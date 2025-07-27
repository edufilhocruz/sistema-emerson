import { IsString, IsNotEmpty, IsCNPJ, Length } from 'class-validator';

export class CreateCondominioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsCNPJ()
  @IsNotEmpty()
  cnpj: string;

  // ...outros campos com suas respectivas validações
}