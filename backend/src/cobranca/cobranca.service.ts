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

      // Busca o modelo de carta
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

      // Verificação detalhada dos campos problemáticos
      console.log('=== VERIFICAÇÃO DETALHADA DOS CAMPOS ===');
      console.log('morador.bloco:', {
        valor: morador.bloco,
        tipo: typeof morador.bloco,
        existe: morador.bloco !== null && morador.bloco !== undefined
      });
      console.log('morador.apartamento:', {
        valor: morador.apartamento,
        tipo: typeof morador.apartamento,
        existe: morador.apartamento !== null && morador.apartamento !== undefined
      });
      console.log('morador.condominio.nome:', {
        valor: morador.condominio.nome,
        tipo: typeof morador.condominio.nome,
        existe: morador.condominio.nome !== null && morador.condominio.nome !== undefined
      });
      console.log('morador.condominio.logradouro:', {
        valor: morador.condominio.logradouro,
        tipo: typeof morador.condominio.logradouro,
        existe: morador.condominio.logradouro !== null && morador.condominio.logradouro !== undefined
      });

      // TESTE DIRETO - Verificar se os dados estão sendo carregados
      console.log('=== TESTE DIRETO DOS DADOS ===');
      console.log('Dados completos do morador:', JSON.stringify(morador, null, 2));
      console.log('Dados completos do condomínio:', JSON.stringify(morador.condominio, null, 2));

      // Determina o valor da cobrança
      let valor = createCobrancaDto.valor;
      if (valor === undefined || valor === null) {
        if (morador.valorAluguel !== undefined && morador.valorAluguel !== null) {
          valor = morador.valorAluguel;
        }
        // Se ambos são null/undefined, mantém como null (NÃO lançar erro!)
      }

      // Validação explícita - permite valores null
      console.log('=== VALIDAÇÃO DO VALOR ===');
      console.log('Valor final:', valor);
      console.log('Tipo do valor:', typeof valor);
      console.log('Valor é null?', valor === null);
      console.log('Valor é undefined?', valor === undefined);

      // Cria a cobrança
      const cobranca = await this.repository.create({
        ...createCobrancaDto,
        valor,
        statusEnvio: StatusEnvio.NAO_ENVIADO
      });

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
      const conteudoProcessado = this.substituirPlaceholders(modeloCarta.conteudo, dadosSubstituicao);

      console.log('=== RESULTADO DA SUBSTITUIÇÃO ===');
      console.log('Título original:', modeloCarta.titulo);
      console.log('Título processado:', tituloProcessado);
      console.log('Conteúdo original:', modeloCarta.conteudo);
      console.log('Conteúdo processado:', conteudoProcessado);

      // Envia o email
      const emailResult = await this.emailConfigService.sendMail({
        to: morador.email,
        subject: tituloProcessado,
        text: conteudoProcessado,
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
      throw error;
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
