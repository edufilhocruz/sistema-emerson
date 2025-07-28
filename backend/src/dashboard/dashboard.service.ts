import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function getMonthStartDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    // Busca todos os condomínios cadastrados
    const condominios = await this.prisma.condominio.findMany({
      include: {
        moradores: true,
        cobrancas: true,
      },
    });
    // Busca as 10 cobranças mais recentes, incluindo dados do condomínio e morador
    const recentCharges = await this.prisma.cobranca.findMany({
      orderBy: { dataEnvio: 'desc' },
      take: 10,
      include: {
        condominio: true,
        morador: true,
      },
    });
    // Calcula o status de cobrança por condomínio
    const monthStart = getMonthStartDate();
    const condominiumStatus = condominios.map(condo => {
      const chargesSent = condo.cobrancas.filter(c => new Date(c.dataEnvio) >= monthStart).length;
      return {
        id: condo.id,
        name: condo.nome,
        chargesSent,
        totalUnits: condo.moradores.length,
      };
    });
    // Total de inadimplentes (moradores com statusPagamento ATRASADO)
    const totalDefaulters = await this.prisma.morador.count({ where: { statusPagamento: 'ATRASADO' } });
    // Total de cobranças enviadas no mês atual
    const monthlyCharges = await this.prisma.cobranca.count({ where: { dataEnvio: { gte: monthStart } } });
    // Calcular início e fim do dia de hoje
    const hoje = new Date();
    const startOfDay = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);
    // Cobranças a fazer hoje: vencimento hoje e statusEnvio = NAO_ENVIADO
    const aFazerHoje = await this.prisma.cobranca.count({
      where: {
        vencimento: { gte: startOfDay, lte: endOfDay },
        statusEnvio: 'NAO_ENVIADO',
      },
    });
    // Cobranças já enviadas hoje: dataEnvio hoje
    const enviadasHoje = await this.prisma.cobranca.count({
      where: {
        dataEnvio: { gte: startOfDay, lte: endOfDay },
      },
    });
    // Valores default para os demais campos
    return {
      metrics: {
        totalCondominiums: condominios.length,
        totalDefaulters,
        monthlyCharges,
      },
      situacaoFinanceira: {
        pagas: 0,
        acordos: 0,
        devedores: 0,
        errosEnvio: 0,
      },
      statusCobrancaMensal: {
        cobrados: 0,
        total: 0,
        pendentes: 0,
        condominiosPendentes: [],
      },
      condominiumStatus,
      enviosComErro: [],
      recentCharges,
      evolution: { dataPoints: [], trend: 'stable' },
      payments: { paidPercentage: 0, defaultPercentage: 0, totalPayments: 0 },
      condominios,
      aFazerHoje,
      enviadasHoje,
    };
  }
} 