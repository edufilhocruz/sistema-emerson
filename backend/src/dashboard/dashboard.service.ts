import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function getMonthStartDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(mes?: string, ano?: string) {
    // Se não especificado, usa o mês/ano atual
    const dataAtual = new Date();
    const mesAtual = mes ? parseInt(mes) - 1 : dataAtual.getMonth(); // getMonth() retorna 0-11
    const anoAtual = ano ? parseInt(ano) : dataAtual.getFullYear();
    
    const monthStart = new Date(anoAtual, mesAtual, 1);
    const monthEnd = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);
    // Busca todos os condomínios cadastrados
    const condominios = await this.prisma.condominio.findMany({
      include: {
        moradores: true,
        cobrancas: true,
      },
    });
    
    // Busca as 10 cobranças mais recentes do período, incluindo dados do condomínio e morador
    const recentCharges = await this.prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { dataEnvio: 'desc' },
      take: 10,
      include: {
        condominio: true,
        morador: true,
      },
    });
    
    // Calcula o status de cobrança por condomínio no período
    const condominiumStatus = condominios.map(condo => {
      const chargesSent = condo.cobrancas.filter(c => {
        const dataEnvio = new Date(c.dataEnvio);
        return dataEnvio >= monthStart && dataEnvio <= monthEnd;
      }).length;
      return {
        id: condo.id,
        name: condo.nome,
        chargesSent,
        totalUnits: condo.moradores.length,
      };
    });
    
    // Total de inadimplentes (moradores com statusPagamento ATRASADO)
    const totalDefaulters = await this.prisma.morador.count({ where: { statusPagamento: 'ATRASADO' } });
    
    // Total de cobranças enviadas no período
    const monthlyCharges = await this.prisma.cobranca.count({ 
      where: { 
        dataEnvio: { gte: monthStart, lte: monthEnd } 
      } 
    });
    
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

    // LÓGICA PARA STATUS DE COBRANÇA MENSAL
    // Busca condomínios que já têm cobranças enviadas no período
    const condominiosComCobranca = await this.prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: monthStart, lte: monthEnd },
        statusEnvio: 'ENVIADO',
      },
      select: {
        condominioId: true,
        condominio: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      distinct: ['condominioId'],
    });

    // Lista de IDs dos condomínios já cobrados
    const condominiosCobradosIds = condominiosComCobranca.map(c => c.condominioId);
    
    // Condomínios pendentes (que não foram cobrados ainda)
    const condominiosPendentes = condominios.filter(condo => 
      !condominiosCobradosIds.includes(condo.id)
    ).map(condo => ({
      id: condo.id,
      name: condo.nome,
    }));

    // Calcula os totais
    const totalCondominios = condominios.length;
    const cobrados = condominiosCobradosIds.length;
    const pendentes = totalCondominios - cobrados;

    // Calcula cobranças enviadas por condomínio no período
    const cobrancasEnviadasPorCondominio = await this.prisma.cobranca.groupBy({
      by: ['condominioId'],
      where: {
        dataEnvio: { gte: monthStart, lte: monthEnd },
        statusEnvio: 'ENVIADO',
      },
      _count: {
        id: true,
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
        cobrancasEnviadasPorCondominio: cobrancasEnviadasPorCondominio.length,
        errosEnvio: 0,
      },
      statusCobrancaMensal: {
        cobrados,
        total: totalCondominios,
        pendentes,
        condominiosPendentes,
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

  async getCondominiosPendentes(mes?: string, ano?: string) {
    try {
      // Se não especificado, usa o mês/ano atual
      const dataAtual = new Date();
      const mesAtual = mes ? parseInt(mes) - 1 : dataAtual.getMonth(); // getMonth() retorna 0-11
      const anoAtual = ano ? parseInt(ano) : dataAtual.getFullYear();
      
      const inicioMes = new Date(anoAtual, mesAtual, 1);
      const fimMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);

      // Busca condomínios que já têm cobranças enviadas no período
      const condominiosComCobranca = await this.prisma.cobranca.findMany({
        where: {
          dataEnvio: { gte: inicioMes, lte: fimMes },
          statusEnvio: 'ENVIADO',
        },
        select: {
          condominioId: true,
        },
        distinct: ['condominioId'],
      });

      const condominiosCobradosIds = condominiosComCobranca.map(c => c.condominioId);

      // Busca todos os condomínios que NÃO foram cobrados no período
      const condominiosPendentes = await this.prisma.condominio.findMany({
        where: {
          id: {
            notIn: condominiosCobradosIds.length > 0 ? condominiosCobradosIds : undefined,
          },
        },
        select: {
          id: true,
          nome: true,
          moradores: {
            select: {
              id: true,
              nome: true,
              bloco: true,
              apartamento: true,
              email: true,
            },
          },
        },
        orderBy: {
          nome: 'asc',
        },
      });

      return {
        periodo: {
          mes: mesAtual + 1,
          ano: anoAtual,
          inicio: inicioMes.toISOString(),
          fim: fimMes.toISOString(),
        },
        condominios: condominiosPendentes.map(condo => ({
          id: condo.id,
          nome: condo.nome,
          totalMoradores: condo.moradores.length,
          moradores: condo.moradores,
        })),
        total: condominiosPendentes.length,
      };
    } catch (error) {
      console.error('Erro ao buscar condomínios pendentes:', error);
      throw new Error('Erro interno ao buscar condomínios pendentes');
    }
  }

  async getCobrancasEnviadasPorCondominio(mes?: string, ano?: string) {
    try {
      // Se não especificado, usa o mês/ano atual
      const dataAtual = new Date();
      const mesAtual = mes ? parseInt(mes) - 1 : dataAtual.getMonth(); // getMonth() retorna 0-11
      const anoAtual = ano ? parseInt(ano) : dataAtual.getFullYear();
      
      const inicioMes = new Date(anoAtual, mesAtual, 1);
      const fimMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);

      // Busca cobranças enviadas por condomínio no período
      const cobrancasEnviadas = await this.prisma.cobranca.groupBy({
        by: ['condominioId'],
        where: {
          dataEnvio: { gte: inicioMes, lte: fimMes },
          statusEnvio: 'ENVIADO',
        },
        _count: {
          id: true,
        },
      });

      // Busca os dados dos condomínios
      const condominiosIds = cobrancasEnviadas.map(c => c.condominioId);
      const condominios = await this.prisma.condominio.findMany({
        where: {
          id: {
            in: condominiosIds,
          },
        },
        select: {
          id: true,
          nome: true,
        },
      });

      // Combina os dados
      const resultado = cobrancasEnviadas.map(cobranca => {
        const condominio = condominios.find(c => c.id === cobranca.condominioId);
        return {
          id: cobranca.condominioId,
          nome: condominio?.nome || 'Condomínio não encontrado',
          quantidadeEmailsEnviados: cobranca._count.id,
        };
      }).sort((a, b) => b.quantidadeEmailsEnviados - a.quantidadeEmailsEnviados);

      return {
        periodo: {
          mes: mesAtual + 1,
          ano: anoAtual,
          inicio: inicioMes.toISOString(),
          fim: fimMes.toISOString(),
        },
        condominios: resultado,
        total: resultado.length,
        totalEmails: resultado.reduce((sum, item) => sum + item.quantidadeEmailsEnviados, 0),
      };
    } catch (error) {
      console.error('Erro ao buscar cobranças enviadas por condomínio:', error);
      throw new Error('Erro interno ao buscar cobranças enviadas por condomínio');
    }
  }
} 