import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { SituacaoProcesso } from '@prisma/client';

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
