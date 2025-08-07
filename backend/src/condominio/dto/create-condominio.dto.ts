import { IsString, IsNotEmpty, Length, IsEmail, IsEnum } from 'class-validator';

export enum TipoServico {
  ASSESSORIA_MENSAL = 'ASSESSORIA_MENSAL',
  SOMENTE_COBRANCAS = 'SOMENTE_COBRANCAS'
}

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

  @IsString()
  administradora?: string;

  @IsEnum(TipoServico)
  tipoServico: TipoServico;

  @IsString()
  @IsNotEmpty()
  sindicoNome: string;

  @IsString()
  @IsNotEmpty()
  @Length(14, 14, { message: 'O CPF deve ter 14 caracteres.' })
  sindicoCpf: string;

  @IsEmail()
  @IsNotEmpty()
  sindicoEmail: string;

  @IsString()
  @IsNotEmpty()
  sindicoTelefone: string;
}
