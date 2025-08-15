/**
 * Tipos de Domínio para o Dashboard
 * Este arquivo centraliza todas as interfaces e tipos de dados
 * relacionados à feature de dashboard, servindo como uma "fonte da verdade"
 * para a estrutura dos dados.
 */

// Tipos Genéricos e de Filtro
export type ChargeStatus = 'sent' | 'paid' | 'overdue';
export type DateRangeFilter = 'hoje' | '3d' | '7d' | '14d' | '30d' | 'mes_atual' | 'mes_anterior';

export interface PeriodFilter {
  mes?: number;
  ano?: number;
  tipo: 'periodo' | 'mes_especifico';
}

// Tipos para Componentes Específicos do Dashboard

export interface DashboardMetrics {
  totalCondominiums: number;
  totalDefaulters: number;
  monthlyCharges: number;
}

export interface SituacaoFinanceira {
  cobrancasEnviadasPorCondominio: number;
  errosEnvio: number;
}

export interface CobrancaEnviadaPorCondominio {
  id: string;
  nome: string;
  quantidadeEmailsEnviados: number;
}

export interface CondominioPendente {
  id: string;
  name: string;
}

export interface StatusCobrancaMensal {
  cobrados: number;
  total: number;
  pendentes: number;
  condominiosPendentes: CondominioPendente[];
}

export interface CondominiumChargeStatus {
  id: string;
  name: string;
  chargesSent: number;
  totalUnits: number;
}

export interface RecentCharge {
  id: string;
  date: string;
  condominium: string;
  resident: string;
  value: string;
  status: ChargeStatus;
}

export interface EnvioComErro {
  id: string;
  morador: string;
  condominio: string;
  motivo: string;
}

// Tipos Legados (mantidos para evitar quebras em outras partes do sistema durante a transição)
export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface EvolutionData {
  dataPoints: ChartDataPoint[];
  trend: 'up' | 'down' | 'stable';
}

export interface PaymentStats {
  paidPercentage: number;
  defaultPercentage: number;
  totalPayments: number;
}

/**
 * Interface Principal que agrega todos os dados do Dashboard.
 */
export interface DashboardData {
  metrics: DashboardMetrics;
  situacaoFinanceira: SituacaoFinanceira;
  statusCobrancaMensal: StatusCobrancaMensal;
  condominiumStatus: CondominiumChargeStatus[];
  enviosComErro: EnvioComErro[];
  recentCharges: RecentCharge[];
  
  // Campos legados
  evolution: EvolutionData;
  payments: PaymentStats;
}