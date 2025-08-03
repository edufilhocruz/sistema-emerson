import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsUUID, IsOptional } from 'class-validator';
import { StatusEnvio } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class CreateCobrancaDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const numValue = Number(value);
    return isNaN(numValue) ? null : numValue;
  })
  @IsNumber({}, { message: 'O valor deve ser um número válido.' })
  valor?: number | null;

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
