export type SituacaoProcesso = 
  | 'EM_ANDAMENTO'
  | 'ARQUIVADO'
  | 'SUSPENSO'
  | 'EVIDENCIDO'
  | 'JULGADO'
  | 'CAUTELAR'
  | 'EXTINTO';

export interface ProcessoData {
  id: string;
  nome: string;
  unidade: string;
  acaoDe: string;
  situacao: SituacaoProcesso;
  numeroProcesso: string;
  valorDivida?: number | null;
  movimentacoes?: string | null;
  condominioId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessoWithCondominio extends ProcessoData {
  condominio?: {
    id: string;
    nome: string;
  };
}

export interface SituacaoOption {
  value: SituacaoProcesso;
  label: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
}
