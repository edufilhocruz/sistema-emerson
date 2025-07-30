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

  async create(createCobrancaDto: CreateCobrancaDto) {
    try {
      // Valida se as entidades relacionadas existem, usando os IDs dinâmicos do DTO
      const { moradorId, condominioId, modeloCartaId } = createCobrancaDto;

      console.log('=== INICIANDO CRIAÇÃO DE COBRANÇA ===');
      console.log('DTO recebido:', JSON.stringify(createCobrancaDto, null, 2));

      const [morador, condominio, modeloCarta] = await Promise.all([
        this.prisma.morador.findUnique({ 
          where: { id: moradorId },
          include: { condominio: true }
        }),
        this.prisma.condominio.findUnique({ where: { id: condominioId } }),
        this.prisma.modeloCarta.findUnique({ where: { id: modeloCartaId } }),
      ]);

    if (!morador) throw new NotFoundException(`Morador com ID ${moradorId} não encontrado.`);
    if (!condominio) throw new NotFoundException(`Condomínio com ID ${condominioId} não encontrado.`);
    if (!modeloCarta) throw new NotFoundException(`Modelo de Carta com ID ${modeloCartaId} não encontrado.`);

    // Log detalhado dos dados carregados
    console.log('=== DADOS CARREGADOS ===');
    console.log('Morador:', JSON.stringify(morador, null, 2));
    console.log('Condomínio:', JSON.stringify(condominio, null, 2));
    console.log('Modelo Carta:', JSON.stringify(modeloCarta, null, 2));

    // Se não vier valor, usa o valor do aluguel do morador
    let valor = createCobrancaDto.valor;
    if (valor === undefined || valor === null) {
      if (morador.valorAluguel === undefined || morador.valorAluguel === null) {
        throw new NotFoundException('O valor do aluguel do morador não está cadastrado.');
      }
      valor = morador.valorAluguel;
    }

    // Cria a cobrança com status inicial de NAO_ENVIADO
    const cobranca = await this.repository.create({ ...createCobrancaDto, valor, statusEnvio: StatusEnvio.NAO_ENVIADO });

    // Substitui os placeholders do modelo de carta
    const mesReferencia = (() => {
      const hoje = new Date();
      return `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    })();
    
    // Preparar dados para substituição
    const dadosSubstituicao = {
      // Campos do morador
      '{{nome_morador}}': morador.nome || '',
      '{{nome}}': morador.nome || '',
      '{{email}}': morador.email || '',
      '{{telefone}}': morador.telefone || '',
      '{{bloco}}': morador.bloco || '',
      '{{apartamento}}': morador.apartamento || '',
      '{{unidade}}': `${morador.bloco || ''}-${morador.apartamento || ''}`,
      
      // Campos do condomínio
      '{{nome_condominio}}': condominio.nome || '',
      '{{condominio}}': condominio.nome || '',
      '{{cnpj}}': condominio.cnpj || '',
      '{{cidade}}': condominio.cidade || '',
      '{{estado}}': condominio.estado || '',
      '{{endereco}}': `${condominio.logradouro || ''}, ${condominio.numero || ''} - ${condominio.bairro || ''}`,
      '{{endereco_condominio}}': `${condominio.logradouro || ''}, ${condominio.numero || ''} - ${condominio.bairro || ''}`,
      
      // Campos da cobrança
      '{{valor}}': valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      '{{valor_formatado}}': valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      '{{mes_referencia}}': mesReferencia,
      '{{data_vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
      '{{vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
      
      // Data atual
      '{{data_atual}}': new Date().toLocaleDateString('pt-BR'),
      '{{hoje}}': new Date().toLocaleDateString('pt-BR')
    };

    // Substituir todos os campos dinâmicos
    let conteudo = modeloCarta.conteudo;
    console.log('=== SUBSTITUIÇÃO DE CAMPOS ===');
    console.log('Conteúdo original:', conteudo);
    
    Object.entries(dadosSubstituicao).forEach(([placeholder, valor]) => {
      // Escapar caracteres especiais da expressão regular
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPlaceholder, 'gi');
      const conteudoAntes = conteudo;
      conteudo = conteudo.replace(regex, valor);
      if (conteudoAntes !== conteudo) {
        console.log(`Substituído: ${placeholder} -> "${valor}"`);
      } else {
        console.log(`NÃO encontrado: ${placeholder} (valor: "${valor}")`);
      }
    });
    
    console.log('Conteúdo final:', conteudo);

    // Log para debug
    console.log('Conteúdo original:', modeloCarta.conteudo);
    console.log('Conteúdo processado:', conteudo);
    console.log('Dados do morador:', { nome: morador.nome, bloco: morador.bloco, apartamento: morador.apartamento });
    console.log('Dados do condomínio:', { nome: condominio.nome, endereco: `${condominio.logradouro}, ${condominio.numero} - ${condominio.bairro}` });

    // Tenta enviar o email
    const emailResult = await this.emailConfigService.sendMail({
      to: morador.email,
      subject: `Cobrança - ${condominio.nome}`,
      text: conteudo,
    });
    
    if (emailResult.success) {
      console.log(`Email enviado com sucesso para: ${morador.email}`);
      // Atualiza o status da cobrança para ENVIADO
      await this.repository.update(cobranca.id, { statusEnvio: StatusEnvio.ENVIADO });
    } else {
      console.error(`Erro ao enviar email para ${morador.email}:`, emailResult.error);
      // Atualiza o status da cobrança para ERRO
      await this.repository.update(cobranca.id, { statusEnvio: StatusEnvio.ERRO });
    }

    return cobranca;
    } catch (error) {
      console.error('=== ERRO NA CRIAÇÃO DE COBRANÇA ===');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      throw error; // Re-throw para o controller tratar
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
