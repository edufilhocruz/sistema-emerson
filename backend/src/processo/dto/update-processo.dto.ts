import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessoDto } from './create-processo.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { SituacaoProcesso } from '@prisma/client';

export class UpdateProcessoDto extends PartialType(CreateProcessoDto) {
  @IsOptional()
  @IsEnum(SituacaoProcesso)
 -situacao?: SituacaoProcesso;
}
