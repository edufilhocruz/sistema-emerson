import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCondominioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Length(18, 18, { message: 'O CNPJ deve ter 18 caracteres.' })
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  cep: string;

  @IsString()
  @IsNotEmpty()
  logradouro: string;

  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsString()
  bairro: string;

  @IsString()
  cidade: string;

  @IsString()
  estado: string;
}
