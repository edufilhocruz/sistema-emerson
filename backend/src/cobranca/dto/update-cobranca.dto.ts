import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { StatusCobranca, StatusEnvio } from '@prisma/client';

export class UpdateCobrancaDto {
  @IsOptional()
  @IsEnum(StatusCobranca, { message: 'O status fornecido é inválido.' })
  status?: StatusCobranca;

  @IsOptional()
  @IsEnum(StatusEnvio, { message: 'O status de envio fornecido é inválido.' })
  statusEnvio?: StatusEnvio;
}
