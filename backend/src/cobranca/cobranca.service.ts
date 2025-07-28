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
    // Valida se as entidades relacionadas existem, usando os IDs dinâmicos do DTO
    const { moradorId, condominioId, modeloCartaId } = createCobrancaDto;

    const [morador, condominio, modeloCarta] = await Promise.all([
      this.prisma.morador.findUnique({ where: { id: moradorId } }),
      this.prisma.condominio.findUnique({ where: { id: condominioId } }),
      this.prisma.modeloCarta.findUnique({ where: { id: modeloCartaId } }),
    ]);

    if (!morador) throw new NotFoundException(`Morador com ID ${moradorId} não encontrado.`);
    if (!condominio) throw new NotFoundException(`Condomínio com ID ${condominioId} não encontrado.`);
    if (!modeloCarta) throw new NotFoundException(`Modelo de Carta com ID ${modeloCartaId} não encontrado.`);

    // Se não vier valor, usa o valor do aluguel do morador
    let valor = createCobrancaDto.valor;
    if (valor === undefined || valor === null) {
      if (morador.valorAluguel === undefined || morador.valorAluguel === null) {
        throw new NotFoundException('O valor do aluguel do morador não está cadastrado.');
      }
      valor = morador.valorAluguel;
    }

    const cobranca = await this.repository.create({ ...createCobrancaDto, valor, statusEnvio: StatusEnvio.ENVIADO });

    // Substitui os placeholders do modelo de carta
    const mesReferencia = (() => {
      const hoje = new Date();
      return `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    })();
    let conteudo = modeloCarta.conteudo
      .replace(/{{nome_morador}}/gi, morador.nome)
      .replace(/{{valor}}/gi, cobranca.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
      .replace(/{{mes_referencia}}/gi, mesReferencia);

    await this.emailConfigService.sendMail({
      to: morador.email,
      subject: `Cobrança - ${condominio.nome}`,
      text: conteudo,
    });

    return cobranca;
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
