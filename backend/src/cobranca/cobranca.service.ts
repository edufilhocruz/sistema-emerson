import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { CobrancaRepository } from './cobranca.repository';
import { PrismaService } from '../prisma/prisma.service';
import { StatusEnvio } from '@prisma/client';
import { EmailConfigService } from '../email-config.service';

@Injectable()
export class CobrancaService {
  constructor(
    private readonly repository: CobrancaRepository,
    private readonly prisma: PrismaService,
    private readonly emailConfigService: EmailConfigService,
  ) {}

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
   * Substitui todos os placeholders dinâmicos no texto
   */
  private substituirPlaceholders(texto: string, dados: Record<string, any>): string {
    let resultado = texto;
    
    console.log('=== INICIANDO SUBSTITUIÇÃO DE PLACEHOLDERS ===');
    console.log('Texto original:', texto);
    console.log('Dados disponíveis:', JSON.stringify(dados, null, 2));
    
    // Substitui cada placeholder pelo seu valor correspondente
    Object.entries(dados).forEach(([placeholder, valor]) => {
      console.log(`\n--- Processando: ${placeholder} ---`);
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
          console.log(`✅ Substituição realizada: "${placeholder}" -> "${valor}"`);
        } else {
          console.log(`❌ Substituição falhou para: ${placeholder}`);
        }
      } else {
        console.log(`⚠️ Placeholder não encontrado no texto: ${placeholder}`);
      }
    });
    
    console.log('\n=== RESULTADO FINAL ===');
    console.log('Texto processado:', resultado);
    
    return resultado;
  }

  async create(createCobrancaDto: CreateCobrancaDto) {
    try {
      console.log('=== INICIANDO CRIAÇÃO DE COBRANÇA ===');
      console.log('DTO recebido:', JSON.stringify(createCobrancaDto, null, 2));

      const { moradorId, condominioId, modeloCartaId } = createCobrancaDto;

      // Busca o morador com dados do condomínio
      const morador = await this.prisma.morador.findUnique({
        where: { id: moradorId },
        include: {
          condominio: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              logradouro: true,
              numero: true,
              bairro: true,
              cidade: true,
              estado: true
            }
          }
        }
      });

      if (!morador) {
        throw new NotFoundException(`Morador com ID ${moradorId} não encontrado.`);
      }

      // Busca o modelo de carta com imagens
      const modeloCarta = await this.prisma.modeloCarta.findUnique({
        where: { id: modeloCartaId }
      });

      if (!modeloCarta) {
        throw new NotFoundException(`Modelo de Carta com ID ${modeloCartaId} não encontrado.`);
      }

      console.log('=== DADOS CARREGADOS ===');
      console.log('Morador:', {
        id: morador.id,
        nome: morador.nome,
        bloco: morador.bloco,
        apartamento: morador.apartamento,
        email: morador.email
      });
      console.log('Condomínio:', {
        id: morador.condominio.id,
        nome: morador.condominio.nome,
        logradouro: morador.condominio.logradouro,
        numero: morador.condominio.numero,
        bairro: morador.condominio.bairro
      });

      // Determina o valor da cobrança
      let valor = createCobrancaDto.valor;
      if (valor === undefined || valor === null) {
        if (morador.valorAluguel !== undefined && morador.valorAluguel !== null) {
          valor = morador.valorAluguel;
        }
      }

      // Cria a cobrança com tratamento robusto do valor
      const dadosCobranca: any = {
        ...createCobrancaDto,
        statusEnvio: StatusEnvio.NAO_ENVIADO
      };
      
      // Tratamento robusto do campo valor
      if (valor !== null && valor !== undefined && valor > 0) {
        dadosCobranca.valor = Number(valor);
      } else {
        dadosCobranca.valor = null;
      }
      
      console.log('=== DADOS FINAIS PARA CRIAÇÃO ===');
      console.log('Dados da cobrança:', JSON.stringify(dadosCobranca, null, 2));
      
      const cobranca = await this.repository.create(dadosCobranca);

      // Calcula mês de referência
      const hoje = new Date();
      const mesReferencia = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

      // Monta o endereço completo do condomínio
      const enderecoCondominio = [
        morador.condominio.logradouro,
        morador.condominio.numero,
        morador.condominio.bairro,
        morador.condominio.cidade,
        morador.condominio.estado
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
        '{{nome_condominio}}': morador.condominio.nome,
        '{{condominio}}': morador.condominio.nome,
        '{{cnpj}}': morador.condominio.cnpj,
        '{{cidade}}': morador.condominio.cidade,
        '{{estado}}': morador.condominio.estado,
        '{{endereco}}': enderecoCondominio,
        '{{endereco_condominio}}': enderecoCondominio,
        
        // Campos da cobrança
        '{{valor}}': valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado',
        '{{valor_formatado}}': valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado',
        '{{mes_referencia}}': mesReferencia,
        '{{data_vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
        '{{vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
        
        // Data atual
        '{{data_atual}}': hoje.toLocaleDateString('pt-BR'),
        '{{hoje}}': hoje.toLocaleDateString('pt-BR')
      };

      console.log('=== DADOS PARA SUBSTITUIÇÃO ===');
      console.log(JSON.stringify(dadosSubstituicao, null, 2));

      // Substitui os placeholders no título e conteúdo
      const tituloProcessado = this.substituirPlaceholders(modeloCarta.titulo, dadosSubstituicao);
      const conteudoComPlaceholders = this.substituirPlaceholders(modeloCarta.conteudo, dadosSubstituicao);
      
      // Processa o conteúdo HTML para ser compatível com emails
      const conteudoProcessado = this.processarConteudoHtml(conteudoComPlaceholders);

      // Template de email profissional com HTML inline (compatível com todos os clientes)
      const emailTemplate = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Cobrança - ${morador.condominio.nome}</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
          <!-- Wrapper principal -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <!-- Container do email -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Imagem do cabeçalho -->
                  ${(modeloCarta as any).headerImage ? `
                  <tr>
                    <td style="text-align: center; padding: 0;">
                      <img src="${process.env.BASE_URL || 'https://app.raunaimer.adv.br'}${(modeloCarta as any).headerImage}" 
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
                  ${(modeloCarta as any).footerImage ? `
                  <tr>
                    <td style="text-align: center; padding: 0;">
                      <img src="${process.env.BASE_URL || 'https://app.raunaimer.adv.br'}${(modeloCarta as any).footerImage}" 
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
          
          <!-- Fallback para clientes que não suportam tabelas -->
          <!--[if !mso]><!-->
          <div style="display: none; max-height: 0; overflow: hidden;">
            Esta é uma cobrança automática do sistema Raunaimer.
          </div>
          <!--<![endif]-->
          
          <!-- Preheader text -->
          <div style="display: none; max-height: 0; overflow: hidden;">
            Cobrança - ${morador.condominio.nome} - ${tituloProcessado}
          </div>
        </body>
        </html>
      `;

      const htmlContent = emailTemplate;

      console.log('=== RESULTADO DA SUBSTITUIÇÃO ===');
      console.log('Título original:', modeloCarta.titulo);
      console.log('Título processado:', tituloProcessado);
      console.log('Conteúdo original:', modeloCarta.conteudo);
      console.log('Conteúdo processado:', conteudoProcessado);
      console.log('HTML com imagens:', htmlContent);

      // Envia o email com HTML
      const emailResult = await this.emailConfigService.sendMail({
        to: morador.email,
        subject: tituloProcessado,
        text: conteudoProcessado, // Fallback para clientes que não suportam HTML
        html: htmlContent, // Versão HTML com imagens
      });

      if (emailResult.success) {
        console.log(`✅ Email enviado com sucesso para: ${morador.email}`);
        await this.repository.update(cobranca.id, { statusEnvio: StatusEnvio.ENVIADO });
      } else {
        console.error(`❌ Erro ao enviar email para ${morador.email}:`, emailResult.error);
        await this.repository.update(cobranca.id, { statusEnvio: StatusEnvio.ERRO });
      }

      return cobranca;
    } catch (error) {
      console.error('=== ERRO NA CRIAÇÃO DE COBRANÇA ===');
      console.error('Erro completo:', error);
      
      // Se for um erro conhecido, re-lança
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // Para outros erros, lança um erro genérico
      throw new Error('Erro interno ao processar cobrança');
    }
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const cobranca = await this.repository.findOne(id);
    if (!cobranca) {
      throw new NotFoundException(`Cobrança com ID ${id} não encontrada.`);
    }
    return cobranca;
  }

  async update(id: string, updateCobrancaDto: UpdateCobrancaDto) {
    await this.findOne(id); // Garante que a cobrança existe
    return this.repository.update(id, updateCobrancaDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Garante que a cobrança existe
    return this.repository.remove(id);
  }

  async getInadimplencia(condominioId?: string) {
    // Busca todas as cobranças com status ATRASADO e, se fornecido, do condomínio filtrado
    const where: any = { status: 'ATRASADO' };
    if (condominioId) where.condominioId = condominioId;
    const cobrancas = await this.prisma.cobranca.findMany({
      where,
      include: {
        morador: {
          select: { id: true, nome: true, bloco: true, apartamento: true, condominio: { select: { nome: true } } },
        },
        condominio: { select: { nome: true } },
      },
    });
    // Mapeia para o formato esperado pelo frontend
    return cobrancas.map((c) => {
      // Calcula dias em atraso
      const hoje = new Date();
      const venc = new Date(c.vencimento);
      const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        id: c.id,
        morador: c.morador?.nome || '',
        unidade: `${c.morador?.bloco || ''}-${c.morador?.apartamento || ''}`,
        condominio: c.condominio?.nome || '',
        valor: c.valor,
        diasAtraso,
        vencimento: c.vencimento,
      };
    });
  }

  async getHistoricoCobrancas(condominioId?: string, moradorId?: string) {
    const where: any = {};
    if (condominioId) where.condominioId = condominioId;
    if (moradorId) where.moradorId = moradorId;
    const cobrancas = await this.prisma.cobranca.findMany({
      where,
      include: {
        morador: { select: { nome: true } },
        condominio: { select: { nome: true } },
      },
      orderBy: { dataEnvio: 'desc' },
    });
    return cobrancas.map((c) => ({
      id: c.id,
      morador: c.morador?.nome || '',
      condominio: c.condominio?.nome || '',
      valor: c.valor,
      dataEnvio: c.dataEnvio,
      status: c.status,
      statusEnvio: c.statusEnvio,
      vencimento: c.vencimento,
    }));
  }


}
