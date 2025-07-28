import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { StatusCobranca, StatusEnvio } from '@prisma/client';

export class UpdateCobrancaDto {
  @IsEnum(StatusCobranca, { message: 'O status fornecido é inválido.' })
  @IsNotEmpty({ message: 'O status é obrigatório para atualização.' })
  status: StatusCobranca;

  @IsOptional()
  @IsEnum(StatusEnvio, { message: 'O status de envio fornecido é inválido.' })
  statusEnvio?: StatusEnvio;
}
