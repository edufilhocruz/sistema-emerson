export interface InadimplenciaItem {
  id: string;
  morador: string;
  unidade: string;
  condominio: string;
  valor: number;
  diasAtraso: number;
  vencimento: string; // Formato YYYY-MM-DD
}

export interface InadimplenciaKpis {
  totalInadimplente: number;
  totalUnidades: number;
  mediaDiasAtraso: number;
}
export type CobrancaStatus = 'Pago' | 'Atrasado' | 'Em Aberto';

export interface HistoricoCobranca {
  id: string;
  morador: string;
  condominio: string;
  valor: number;
  dataEnvio: string; // Formato YYYY-MM-DD HH:mm
  status: CobrancaStatus;
}

export interface CobrancasKpis {
  totalArrecadado: number;
  totalPendente: number;
  taxaSucesso: number; // Em percentual
}