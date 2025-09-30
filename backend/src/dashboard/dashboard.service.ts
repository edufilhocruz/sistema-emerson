import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function getMonthStartDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(mes?: string, ano?: string, periodo?: string) {
    console.log('=== DASHBOARD SERVICE ===');
    console.log('Parâmetros recebidos:', { mes, ano, periodo });
    
    // Se não especificado, usa o mês/ano atual
    const dataAtual = new Date();
    let monthStart: Date;
    let monthEnd: Date;
    
    if (periodo) {
      // Aplicar filtro de período
      switch (periodo) {
        case 'hoje':
          monthStart = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate(), 0, 0, 0, 0);
          monthEnd = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate(), 23, 59, 59, 999);
          break;
        case '7d':
          monthStart = new Date(dataAtual.getTime() - 7 * 24 * 60 * 60 * 1000);
          monthEnd = new Date(dataAtual.getTime());
          break;
        case '30d':
          monthStart = new Date(dataAtual.getTime() - 30 * 24 * 60 * 60 * 1000);
          monthEnd = new Date(dataAtual.getTime());
          break;
        case 'mes_atual':
        default:
          const mesAtual = mes ? parseInt(mes) - 1 : dataAtual.getMonth();
          const anoAtual = ano ? parseInt(ano) : dataAtual.getFullYear();
          monthStart = new Date(anoAtual, mesAtual, 1);
          monthEnd = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);
          break;
        case 'mes_anterior':
          const mesAnterior = mes ? parseInt(mes) - 1 : (dataAtual.getMonth() === 0 ? 11 : dataAtual.getMonth() - 1);
          const anoAnterior = ano ? parseInt(ano) : (dataAtual.getMonth() === 0 ? dataAtual.getFullYear() - 1 : dataAtual.getFullYear());
          monthStart = new Date(anoAnterior, mesAnterior, 1);
          monthEnd = new Date(anoAnterior, mesAnterior + 1, 0, 23, 59, 59, 999);
          break;
      }
    } else {
      // Lógica original para mês/ano específico
      const mesAtual = mes ? parseInt(mes) - 1 : dataAtual.getMonth();
      const anoAtual = ano ? parseInt(ano) : dataAtual.getFullYear();
      monthStart = new Date(anoAtual, mesAtual, 1);
      monthEnd = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);
    }
    
    console.log('Período calculado:', { monthStart, monthEnd, periodo });
    // Busca todos os condomínios cadastrados
    const condominios = await this.prisma.condominio.findMany({
      include: {
        moradores: true,
        cobrancas: true,
      },
    });
    
    console.log('Total de condomínios cadastrados:', condominios.length);
    console.log('Lista de condomínios:', condominios.map(c => ({
      id: c.id,
      nome: c.nome,
      totalMoradores: c.moradores.length,
      totalCobrancas: c.cobrancas.length,
    })));
    
    // Busca as 10 cobranças mais recentes do período, incluindo dados do condomínio e morador
    const recentCharges = await this.prisma.cobranca.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        condominio: true,
        morador: true,
      },
    });
    
    // Calcula o status de cobrança por condomínio no período
    const condominiumStatus = condominios.map(condo => {
      const chargesSent = condo.cobrancas.filter(c => {
        const dataCriacao = new Date(c.createdAt);
        const foiEnviada = c.statusEnvio === 'ENVIADO' || c.statusEnvio === 'ERRO';
        return dataCriacao >= monthStart && dataCriacao <= monthEnd && foiEnviada;
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
    
    // Total de cobranças enviadas no período (ENVIADO + ERRO)
    const monthlyCharges = await this.prisma.cobranca.count({ 
      where: { 
        createdAt: { gte: monthStart, lte: monthEnd },
        statusEnvio: {
          in: ['ENVIADO', 'ERRO'], // Conta tentativas de envio
        },
      } 
    });
    
    console.log('Total de cobranças no período:', monthlyCharges);
    
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
    
    // Cobranças já enviadas hoje: createdAt hoje e statusEnvio ENVIADO ou ERRO
    const enviadasHoje = await this.prisma.cobranca.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        statusEnvio: {
          in: ['ENVIADO', 'ERRO'],
        },
      },
    });
    
    console.log('Cobranças enviadas hoje:', enviadasHoje);

    // LÓGICA PARA STATUS DE COBRANÇA MENSAL
    console.log('=== DEBUG DASHBOARD ===');
    console.log('Período:', { monthStart, monthEnd });
    
    // Busca condomínios que já têm cobranças enviadas no período (ENVIADO ou ERRO)
    // Considera como "cobrado" qualquer condomínio que teve tentativa de envio
    const condominiosComCobranca = await this.prisma.cobranca.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        statusEnvio: {
          in: ['ENVIADO', 'ERRO'], // Considera tanto envios bem-sucedidos quanto com erro
        },
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
    
    console.log('Condomínios com cobrança encontrados:', condominiosComCobranca.length);
    console.log('Detalhes:', condominiosComCobranca.map(c => ({ id: c.condominioId, nome: c.condominio.nome })));
    
    // Debug: Verificar todas as cobranças no período
    const todasCobrancas = await this.prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: monthStart, lte: monthEnd },
      },
      select: {
        id: true,
        condominioId: true,
        statusEnvio: true,
        dataEnvio: true,
        createdAt: true,
        condominio: {
          select: {
            nome: true,
          },
        },
      },
    });
    
    // Debug: Verificar também por createdAt para comparar
    const todasCobrancasPorCriacao = await this.prisma.cobranca.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      select: {
        id: true,
        condominioId: true,
        statusEnvio: true,
        dataEnvio: true,
        createdAt: true,
        condominio: {
          select: {
            nome: true,
          },
        },
      },
    });
    
    console.log('=== COMPARAÇÃO DE MÉTODOS ===');
    console.log('Cobranças por dataEnvio:', todasCobrancas.length);
    console.log('Cobranças por createdAt:', todasCobrancasPorCriacao.length);
    
    console.log('Cobranças por status (dataEnvio):', {
      ENVIADO: todasCobrancas.filter(c => c.statusEnvio === 'ENVIADO').length,
      ERRO: todasCobrancas.filter(c => c.statusEnvio === 'ERRO').length,
      NAO_ENVIADO: todasCobrancas.filter(c => c.statusEnvio === 'NAO_ENVIADO').length,
    });
    
    console.log('Cobranças por status (createdAt):', {
      ENVIADO: todasCobrancasPorCriacao.filter(c => c.statusEnvio === 'ENVIADO').length,
      ERRO: todasCobrancasPorCriacao.filter(c => c.statusEnvio === 'ERRO').length,
      NAO_ENVIADO: todasCobrancasPorCriacao.filter(c => c.statusEnvio === 'NAO_ENVIADO').length,
    });
    
    console.log('Detalhes das cobranças (dataEnvio):', todasCobrancas.map(c => ({
      id: c.id,
      condominio: c.condominio.nome,
      statusEnvio: c.statusEnvio,
      dataEnvio: c.dataEnvio,
      createdAt: c.createdAt,
    })));
    
    console.log('Detalhes das cobranças (createdAt):', todasCobrancasPorCriacao.map(c => ({
      id: c.id,
      condominio: c.condominio.nome,
      statusEnvio: c.statusEnvio,
      dataEnvio: c.dataEnvio,
      createdAt: c.createdAt,
    })));

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

    // Calcula cobranças enviadas por condomínio no período (inclui ENVIADO e ERRO)
    const cobrancasEnviadasPorCondominio = await this.prisma.cobranca.groupBy({
      by: ['condominioId'],
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        statusEnvio: {
          in: ['ENVIADO', 'ERRO'], // Inclui tanto envios bem-sucedidos quanto com erro
        },
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