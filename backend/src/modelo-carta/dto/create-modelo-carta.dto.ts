import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateModeloCartaDto {
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título não pode ser vazio.' })
  titulo: string;

  @IsString({ message: 'O conteúdo deve ser um texto.' })
  @IsNotEmpty({ message: 'O conteúdo não pode ser vazio.' })
  conteudo: string;

  @IsString({ message: 'A imagem do cabeçalho deve ser um texto.' })
  @IsOptional()
  headerImage?: string;

  @IsString({ message: 'A imagem do rodapé deve ser um texto.' })
  @IsOptional()
  footerImage?: string;
}
