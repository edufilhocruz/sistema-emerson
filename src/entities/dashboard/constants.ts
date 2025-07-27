import { DashboardData, CondominiumChargeStatus, EnvioComErro } from './types';

//================================== DADOS COMPARTILHADOS ==================================
// Estes dados são usados em múltiplos mocks, então os definimos uma vez para reutilização.

const allCondominiumStatus: CondominiumChargeStatus[] = [
    { id: '1', name: 'Residencial das Flores', chargesSent: 20, totalUnits: 30 },
    { id: '2', name: 'Condomínio Vista Verde', chargesSent: 15, totalUnits: 18 },
    { id: '3', name: 'Edifício Central', chargesSent: 50, totalUnits: 50 },
    { id: '4', name: 'Parque das Águas', chargesSent: 25, totalUnits: 40 },
];

const errosDeEnvioGeral: EnvioComErro[] = [
  { id: 'e1', morador: 'João Souza', condominio: 'Parque das Águas', motivo: 'E-mail inválido' },
  { id: 'e2', morador: 'Maria Lima', condominio: 'Residencial Topázio', motivo: 'Servidor SMTP recusou a conexão' },
  { id: 'e3', morador: 'Pedro Martins', condominio: 'Edifício Central', motivo: 'Caixa de entrada cheia' },
  { id: 'e4', morador: 'Carla Dias', condominio: 'Residencial das Flores', motivo: 'E-mail inválido' },
  { id: 'e5', morador: 'Fernanda Mota', condominio: 'Condomínio Vista Verde', motivo: 'API de envio indisponível' },
];

const condominiosPendentesGeral = [
  { id: 'p1', name: 'Parque das Águas' },
  { id: 'p2', name: 'Edifício Sol Nascente' },
  { id: 'p3', name: 'Condomínio Atlântico' },
  { id: 'p4', name: 'Residencial Topázio' },
  { id: 'p5', name: 'Golden Towers' },
  { id: 'p6', name: 'Green Valley Residence' },
  { id: 'p7', name: 'Blue Coast Apartments' },
  { id: 'p8', name: 'Village Premium' },
  { id: 'p9', name: 'Solar das Palmeiras' },
];


//================================== MOCKS PRINCIPAIS ==================================

/**
 * DADOS GERAIS (PADRÃO / 30 DIAS)
 */
export const MOCK_DASHBOARD_DATA: DashboardData = {
  metrics: { totalCondominiums: 4, totalDefaulters: 42, monthlyCharges: 110 },
  situacaoFinanceira: { pagas: 60, acordos: 10, devedores: 35, errosEnvio: 5 },
  statusCobrancaMensal: { cobrados: 1, total: 10, pendentes: 9, condominiosPendentes: condominiosPendentesGeral },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: errosDeEnvioGeral,
  recentCharges: [ { id: '1', date: '05/01/2024', condominium: 'Residencial das Flores', resident: 'Carlos Silva', value: 'R$ 550,00', status: 'sent' } ],
  evolution: { dataPoints: [], trend: 'stable' },
  payments: { paidPercentage: 0, defaultPercentage: 0, totalPayments: 0 },
};

/**
 * DADOS FILTRADOS PARA "HOJE"
 */
export const MOCK_DATA_TODAY: DashboardData = {
  metrics: { totalCondominiums: 4, totalDefaulters: 3, monthlyCharges: 8 },
  situacaoFinanceira: { pagas: 5, acordos: 1, devedores: 3, errosEnvio: 0 },
  statusCobrancaMensal: { cobrados: 1, total: 10, pendentes: 9, condominiosPendentes: condominiosPendentesGeral },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: [],
  recentCharges: [],
  evolution: { dataPoints: [], trend: 'stable' },
  payments: { paidPercentage: 98, defaultPercentage: 2, totalPayments: 45 },
};

/**
 * DADOS FILTRADOS PARA "3 DIAS"
 */
export const MOCK_DATA_3_DAYS: DashboardData = {
  metrics: { totalCondominiums: 4, totalDefaulters: 7, monthlyCharges: 21 },
  situacaoFinanceira: { pagas: 15, acordos: 2, devedores: 7, errosEnvio: 1 },
  statusCobrancaMensal: { cobrados: 3, total: 10, pendentes: 7, condominiosPendentes: condominiosPendentesGeral.slice(0, 7) },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: [errosDeEnvioGeral[0]],
  recentCharges: [],
  evolution: { dataPoints: [], trend: 'down' },
  payments: { paidPercentage: 96, defaultPercentage: 4, totalPayments: 78 },
};

/**
 * DADOS FILTRADOS PARA "7 DIAS"
 */
export const MOCK_DATA_7_DAYS: DashboardData = {
  metrics: { totalCondominiums: 4, totalDefaulters: 12, monthlyCharges: 35 },
  situacaoFinanceira: { pagas: 25, acordos: 4, devedores: 12, errosEnvio: 2 },
  statusCobrancaMensal: { cobrados: 4, total: 10, pendentes: 6, condominiosPendentes: condominiosPendentesGeral.slice(0, 6) },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: [errosDeEnvioGeral[0], errosDeEnvioGeral[1]],
  recentCharges: [],
  evolution: { dataPoints: [], trend: 'up' },
  payments: { paidPercentage: 95, defaultPercentage: 5, totalPayments: 102 },
};

/**
 * DADOS FILTRADOS PARA "14 DIAS"
 */
export const MOCK_DATA_14_DAYS: DashboardData = {
  metrics: { totalCondominiums: 4, totalDefaulters: 25, monthlyCharges: 70 },
  situacaoFinanceira: { pagas: 40, acordos: 8, devedores: 25, errosEnvio: 3 },
  statusCobrancaMensal: { cobrados: 5, total: 10, pendentes: 5, condominiosPendentes: condominiosPendentesGeral.slice(0, 5) },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: [errosDeEnvioGeral[0], errosDeEnvioGeral[1], errosDeEnvioGeral[2]],
  recentCharges: [],
  evolution: { dataPoints: [], trend: 'stable' },
  payments: { paidPercentage: 88, defaultPercentage: 12, totalPayments: 180 },
};

/**
 * DADOS FILTRADOS PARA O CONDOMÍNIO 1 (FLORES)
 */
export const MOCK_DATA_CONDOMINIO_1: DashboardData = {
  metrics: { totalCondominiums: 1, totalDefaulters: 8, monthlyCharges: 20 },
  situacaoFinanceira: { pagas: 12, acordos: 2, devedores: 8, errosEnvio: 1 },
  statusCobrancaMensal: { cobrados: 1, total: 1, pendentes: 0, condominiosPendentes: [] },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: [errosDeEnvioGeral[3]],
  recentCharges: [],
  evolution: { dataPoints: [], trend: 'up' },
  payments: { paidPercentage: 85, defaultPercentage: 15, totalPayments: 150 },
};

/**
 * DADOS FILTRADOS PARA O CONDOMÍNIO 2 (VISTA VERDE)
 */
export const MOCK_DATA_CONDOMINIO_2: DashboardData = {
  metrics: { totalCondominiums: 1, totalDefaulters: 3, monthlyCharges: 15 },
  situacaoFinanceira: { pagas: 12, acordos: 0, devedores: 3, errosEnvio: 0 },
  statusCobrancaMensal: { cobrados: 1, total: 1, pendentes: 0, condominiosPendentes: [] },
  condominiumStatus: allCondominiumStatus,
  enviosComErro: [],
  recentCharges: [],
  evolution: { dataPoints: [], trend: 'stable' },
  payments: { paidPercentage: 92, defaultPercentage: 8, totalPayments: 84 },
};