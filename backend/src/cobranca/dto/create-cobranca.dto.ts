import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsUUID, IsOptional } from 'class-validator';
import { StatusEnvio } from '@prisma/client';

export class CreateCobrancaDto {
  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsDateString({}, { message: 'A data de vencimento deve estar no formato ISO 8601 (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'A data de vencimento é obrigatória.' })
  vencimento: Date;

  @IsUUID('4', { message: 'O ID do condomínio deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O condomínio é obrigatório.' })
  condominioId: string;

  @IsUUID('4', { message: 'O ID do morador deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O morador é obrigatório.' })
  moradorId: string;

  @IsUUID('4', { message: 'O ID do modelo de carta deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O modelo de carta é obrigatório.' })
  modeloCartaId: string;

  statusEnvio?: StatusEnvio;
}
