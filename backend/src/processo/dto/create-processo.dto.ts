import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum SituacaoProcesso {
  CITACAO = 'CITACAO',
  CONTESTACAO = 'CONTESTACAO',
  REPLICA = 'REPLICA',
  SISBAJUD = 'SISBAJUD',
  PENHORA_DA_UNIDADE = 'PENHORA_DA_UNIDADE',
  ACORDO_PROTOCOLADO = 'ACORDO_PROTOCOLADO',
  ACORDO_HOMOLOGADO = 'ACORDO_HOMOLOGADO',
  ACORDO_QUEBRADO = 'ACORDO_QUEBRADO',
  QUITACAO_DA_DIVIDA = 'QUITACAO_DA_DIVIDA',
  EXTINTO = 'EXTINTO',
  CUMP_SENTENCA = 'CUMP_SENTENCA',
  GRAU_DE_RECURSO = 'GRAU_DE_RECURSO',
}

export class CreateProcessoDto {
  @IsString()
  nome: string;

  @IsString()
  unidade: string;

  @IsString()
  acaoDe: string;

  @IsEnum(SituacaoProcesso)
  situacao: SituacaoProcesso;

  @IsString()
  numeroProcesso: string;

  @IsOptional()
  @IsNumber()
  valorDivida?: number;

  @IsOptional()
  @IsString()
  movimentacoes?: string;

  @IsOptional()
  @IsString()
  condominioId?: string;
}
