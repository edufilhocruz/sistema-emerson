export type SituacaoProcesso = 
  | 'CITACAO'
  | 'CONTESTACAO'
  | 'REPLICA'
  | 'SISBAJUD'
  | 'PENHORA_DA_UNIDADE'
  | 'ACORDO_PROTOCOLADO'
  | 'ACORDO_HOMOLOGADO'
  | 'ACORDO_QUEBRADO'
  | 'QUITACAO_DA_DIVIDA'
  | 'EXTINTO'
  | 'CUMP_SENTENCA'
  | 'GRAU_DE_RECURSO';

export type TipoParte = 
  | 'AUTOR'
  | 'REU'
  | 'TERCEIRO_INTERESSADO';

export interface ProcessoData {
  id: string;
  nome: string;
  unidade: string;
  bloco?: string | null;
  parte: TipoParte;
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

export interface TipoParteOption {
  value: TipoParte;
  label: string;
}
