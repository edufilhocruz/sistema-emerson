import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { EmailConfigService } from '../email-config.service';
import { ModeloCartaService } from '../modelo-carta/modelo-carta.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface para definir a estrutura de dados do trabalho (job) que a fila recebe.
 * Garante a segurança de tipos entre o controller e o worker.
 */
interface ImportJobData {
  fileBuffer: Buffer;
  condominioId: string;
  modeloCartaId: string;
}

/**
 * CobrancaProcessor (Worker)
 *
 * Esta classe é responsável por processar trabalhos pesados em segundo plano.
 * Ela "ouve" a fila 'import-cobranca' e executa a lógica de importação
 * de planilhas de forma assíncrona, sem bloquear a API principal.
 */
@Processor('import-cobranca')
export class CobrancaProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailConfigService: EmailConfigService,
    private readonly modeloCartaService: ModeloCartaService,
  ) {}

  /**
   * Converte uma imagem para Base64
   */
  private async converterImagemParaBase64(imagePath: string): Promise<string | null> {
    try {
      // Remove a barra inicial se houver
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      
      // Constrói o caminho completo para o arquivo
      const fullPath = path.join(process.cwd(), cleanPath);
      
      console.log(`🔍 WORKER: Tentando carregar imagem: ${fullPath}`);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ WORKER: Arquivo não encontrado: ${fullPath}`);
        return null;
      }
      
      // Lê o arquivo
      const imageBuffer = fs.readFileSync(fullPath);
      
      // Detecta o tipo MIME baseado na extensão
      const ext = path.extname(fullPath).toLowerCase();
      let mimeType = 'image/jpeg'; // default
      
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      
      // Converte para base64
      const base64String = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64String}`;
      
      console.log(`✅ WORKER: Imagem convertida para base64: ${fullPath} (${imageBuffer.length} bytes)`);
      return dataUrl;
      
    } catch (error) {
      console.error(`❌ WORKER: Erro ao converter imagem para base64: ${imagePath}`, error);
      return null;
    }
  }

  /**
   * Substitui todos os placeholders dinâmicos no texto
   */
  private substituirPlaceholders(texto: string, dados: Record<string, any>): string {
    let resultado = texto;
    
    console.log('=== WORKER: INICIANDO SUBSTITUIÇÃO DE PLACEHOLDERS ===');
    console.log('Texto original:', texto);
    console.log('Dados disponíveis:', JSON.stringify(dados, null, 2));
    
    // Substitui cada placeholder pelo seu valor correspondente
    Object.entries(dados).forEach(([placeholder, valor]) => {
      console.log(`\n--- WORKER: Processando: ${placeholder} ---`);
      console.log(`Valor para substituir: "${valor}"`);
      console.log(`Tipo do valor: ${typeof valor}`);
      console.log(`Existe no texto: ${resultado.includes(placeholder)}`);
      
      if (resultado.includes(placeholder)) {
        // Escapa caracteres especiais para regex
        const placeholderEscapado = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(placeholderEscapado, 'g');
        
        const antes = resultado;
        resultado = resultado.replace(regex, String(valor || ''));
        
        if (antes !== resultado) {
          console.log(`✅ WORKER: Substituição realizada: "${placeholder}" -> "${valor}"`);
        } else {
          console.log(`❌ WORKER: Substituição falhou para: ${placeholder}`);
        }
      }
    });
    
    console.log('=== WORKER: SUBSTITUIÇÃO CONCLUÍDA ===');
    console.log('Texto final:', resultado);
    
    return resultado;
  }

  /**
   * Processa o conteúdo HTML do Quill para ser compatível com emails
   */
  private processarConteudoHtml(html: string): string {
    // Remove estilos inline que podem causar problemas em emails
    let processado = html
      // Remove estilos de background que podem não funcionar
      .replace(/background-color:\s*[^;]+;/gi, '')
      .replace(/background:\s*[^;]+;/gi, '')
      
      // Converte cores para formato compatível
      .replace(/color:\s*rgb\(([^)]+)\)/gi, (match, rgb) => {
        const [r, g, b] = rgb.split(',').map(n => parseInt(n.trim()));
        return `color: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      })
      
      // Remove propriedades CSS que podem não funcionar em emails
      .replace(/box-shadow:\s*[^;]+;/gi, '')
      .replace(/border-radius:\s*[^;]+;/gi, '')
      .replace(/transform:\s*[^;]+;/gi, '')
      
      // Garante que imagens tenham atributos necessários
      .replace(/<img([^>]*)>/gi, (match, attrs) => {
        if (!attrs.includes('style=')) {
          attrs += ' style="max-width: 100%; height: auto; border: 0;"';
        }
        if (!attrs.includes('alt=')) {
          attrs += ' alt="Imagem"';
        }
        return `<img${attrs}>`;
      })
      
      // Converte quebras de linha para <br> se necessário
      .replace(/\n/g, '<br>');
    
    return processado;
  }

  /**
   * Processa um trabalho de importação de arquivo.
   * @param job O objeto do trabalho, contendo o buffer do arquivo e os IDs necessários.
   * @returns Um sumário da operação com o total de sucessos e uma lista de erros.
   */
  @Process('process-file')
  async handleImport(job: Job<ImportJobData>) {
    console.log(`WORKER: Iniciando processamento do Job ID: ${job.id}...`);
    const { fileBuffer, condominioId, modeloCartaId } = job.data;
    
    let sucesso = 0;
    const detalhesErros: string[] = [];

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<any>(worksheet, {
        header: ["nome", "email", "bloco", "apto", "valor"],
        defval: null // Garante que células vazias sejam nulas
      });

      // Pula a primeira linha (cabeçalho)
      const dataRows = data.slice(1);

      for (const [index, row] of dataRows.entries()) {
        const linha = index + 2; // +2 porque o índice é base 0 e pulamos a linha de cabeçalho
        
        try {
          // Validação robusta da linha (valor agora é opcional)
          if (!row.nome || !row.email || !row.bloco || !row.apto) {
            throw new Error('Os campos Nome, Email, Bloco e Apto são obrigatórios. O valor é opcional.');
          }

          // Busca por um morador existente ou cria um novo (upsert)
          const morador = await this.prisma.morador.upsert({
            where: { email: row.email },
            update: {}, // Não faz nada se o morador já existe
            create: {
              nome: row.nome,
              email: row.email,
              bloco: String(row.bloco),
              apartamento: String(row.apto),
              telefone: null, // Telefone opcional
              condominioId: condominioId, // ID Dinâmico
            },
          });

          // Cria a cobrança associada ao morador
          const cobranca = await this.prisma.cobranca.create({
            data: {
              valor: row.valor !== null && row.valor !== undefined ? Number(row.valor) : null,
              vencimento: new Date(), // Vencimento placeholder, pode ser adicionado à planilha
              status: 'PENDENTE',
              statusEnvio: 'ENVIADO', // Status inicial
              condominioId: condominioId, // ID Dinâmico
              moradorId: morador.id,
              modeloCartaId: modeloCartaId, // ID Dinâmico
            },
          });

          // Buscar modelo de carta e condomínio para textos dinâmicos
          const modeloCarta = await this.modeloCartaService.findOne(modeloCartaId);
          const condominio = await this.prisma.condominio.findUnique({ where: { id: condominioId } });
          
          // Calcula mês de referência
          const hoje = new Date();
          const mesReferencia = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

          // Monta o endereço completo do condomínio
          const enderecoCondominio = [
            condominio?.logradouro,
            condominio?.numero,
            condominio?.bairro,
            condominio?.cidade,
            condominio?.estado
          ].filter(Boolean).join(', ');

          // Prepara todos os dados para substituição
          const dadosSubstituicao = {
            // Campos do morador
            '{{nome_morador}}': morador.nome,
            '{{nome}}': morador.nome,
            '{{email}}': morador.email,
            '{{telefone}}': morador.telefone || 'Telefone não informado',
            '{{bloco}}': morador.bloco,
            '{{apartamento}}': morador.apartamento,
            '{{unidade}}': `${morador.bloco}-${morador.apartamento}`,
            
            // Campos do condomínio
            '{{nome_condominio}}': condominio?.nome || '',
            '{{condominio}}': condominio?.nome || '',
            '{{cnpj}}': condominio?.cnpj || '',
            '{{cidade}}': condominio?.cidade || '',
            '{{estado}}': condominio?.estado || '',
            '{{endereco}}': enderecoCondominio,
            '{{endereco_condominio}}': enderecoCondominio,
            
            // Campos da cobrança
            '{{valor}}': cobranca.valor ? cobranca.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado',
            '{{valor_formatado}}': cobranca.valor ? cobranca.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado',
            '{{mes_referencia}}': mesReferencia,
            '{{data_vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
            '{{vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
            
            // Data atual
            '{{data_atual}}': hoje.toLocaleDateString('pt-BR'),
            '{{hoje}}': hoje.toLocaleDateString('pt-BR')
          };

          // Substitui os placeholders no título e conteúdo
          const tituloProcessado = this.substituirPlaceholders(modeloCarta.titulo, dadosSubstituicao);
          const conteudoComPlaceholders = this.substituirPlaceholders(modeloCarta.conteudo, dadosSubstituicao);
          
          // Processa o conteúdo HTML para ser compatível com emails
          const conteudoProcessado = this.processarConteudoHtml(conteudoComPlaceholders);

          // Converte as imagens para base64
          const headerImageBase64 = (modeloCarta as any).headerImage ? 
            await this.converterImagemParaBase64((modeloCarta as any).headerImage) : null;
          const footerImageBase64 = (modeloCarta as any).footerImage ? 
            await this.converterImagemParaBase64((modeloCarta as any).footerImage) : null;

          // Template de email profissional com HTML inline
          const emailTemplate = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title>Cobrança - ${condominio?.nome || ''}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                      
                      <!-- Imagem do cabeçalho -->
                      ${headerImageBase64 ? `
                      <tr>
                        <td style="text-align: center; padding: 0;">
                          <img src="${headerImageBase64}" 
                               alt="Cabeçalho" 
                               style="width: 100%; max-height: 200px; object-fit: cover; display: block; border: 0;">
                        </td>
                      </tr>
                      ` : ''}
                      
                      <!-- Conteúdo principal -->
                      <tr>
                        <td style="padding: 30px; text-align: left;">
                          <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #333333;">
                            ${conteudoProcessado}
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Imagem do rodapé -->
                      ${footerImageBase64 ? `
                      <tr>
                        <td style="text-align: center; padding: 0;">
                          <img src="${footerImageBase64}" 
                               alt="Rodapé/Assinatura" 
                               style="width: 100%; max-height: 150px; object-fit: contain; display: block; border: 0;">
                        </td>
                      </tr>
                      ` : ''}
                      
                      <!-- Rodapé do sistema -->
                      <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #666666; line-height: 1.4;">
                                <p style="margin: 0 0 10px 0;">Esta é uma cobrança automática do sistema Raunaimer.</p>
                                <p style="margin: 0;">Para dúvidas, entre em contato conosco.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;

          // Tenta enviar o e-mail de cobrança, mas não falha se der erro
          try {
            await this.emailConfigService.sendMail({
              to: row.email,
              subject: tituloProcessado,
              text: conteudoProcessado,
              html: emailTemplate,
            });
            console.log(`WORKER: Email enviado com sucesso para: ${row.email}`);
            sucesso++;
          } catch (error) {
            console.error(`WORKER: Erro ao enviar email para ${row.email}:`, error.message);
            // Atualiza o status da cobrança para ERRO
            await this.prisma.cobranca.update({
              where: { id: cobranca.id },
              data: { statusEnvio: 'ERRO' }
            });
            // Ainda conta como sucesso para a cobrança, mas marca o erro
            sucesso++;
            detalhesErros.push(`Linha ${linha}: Email não enviado - ${error.message}`);
          }
        } catch (error) {
          // Captura erros por linha, permitindo que o resto do arquivo continue
          detalhesErros.push(`Linha ${linha}: ${error.message}`);
        }
      }
    } catch (error) {
        console.error("WORKER: Erro crítico ao processar o arquivo", error);
        return { message: "Falha geral ao ler ou processar o arquivo.", sucesso, erros: detalhesErros.length, detalhesErros };
    }
    console.log(`WORKER: Processamento concluído para o Job ID: ${job.id}. Sucesso: ${sucesso}, Erros: ${detalhesErros.length}`);
    return { message: "Processamento concluído.", sucesso, erros: detalhesErros.length, detalhesErros };
  }
}
