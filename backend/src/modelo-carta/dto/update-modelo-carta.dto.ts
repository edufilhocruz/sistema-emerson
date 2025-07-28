import { PartialType } from '@nestjs/mapped-types';
import { CreateModeloCartaDto } from './create-modelo-carta.dto';

export class UpdateModeloCartaDto extends PartialType(CreateModeloCartaDto) {}
