import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessoDto, SituacaoProcesso } from './create-processo.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateProcessoDto extends PartialType(CreateProcessoDto) {
  @IsOptional()
  @IsEnum(SituacaoProcesso)
  situacao?: SituacaoProcesso;
}
