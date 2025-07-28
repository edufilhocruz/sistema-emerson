import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusCobranca } from '@prisma/client';

export class UpdateCobrancaDto {
  @IsEnum(StatusCobranca, { message: 'O status fornecido é inválido.' })
  @IsNotEmpty({ message: 'O status é obrigatório para atualização.' })
  status: StatusCobranca;
}
