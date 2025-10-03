import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum SituacaoProcesso {
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  ARQUIVADO = 'ARQUIVADO',
  SUSPENSO = 'SUSPENSO',
  EVIDENCIDO = 'EVIDENCIDO',
  JULGADO = 'JULGADO',
  CAUTELAR = 'CAUTELAR',
  EXTINTO = 'EXTINTO',
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
