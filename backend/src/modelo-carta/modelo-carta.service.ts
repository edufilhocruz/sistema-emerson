import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModeloCartaDto } from './dto/create-modelo-carta.dto';
import { UpdateModeloCartaDto } from './dto/update-modelo-carta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModeloCartaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createModeloCartaDto: CreateModeloCartaDto) {
    console.log('DTO recebido:', createModeloCartaDto);
    const result = await this.prisma.modeloCarta.create({
      data: createModeloCartaDto,
    });
    console.log('Registro salvo:', result);
    return result;
  }

  findAll() {
    return this.prisma.modeloCarta.findMany();
  }

  async findOne(id: string) {
    const modelo = await this.prisma.modeloCarta.findUnique({ where: { id } });
    if (!modelo) throw new NotFoundException(`Modelo com ID ${id} não encontrado.`);
    return modelo;
  }

  async update(id: string, updateModeloCartaDto: UpdateModeloCartaDto) {
    await this.findOne(id); // Garante que o modelo existe
    return this.prisma.modeloCarta.update({
      where: { id },
      data: updateModeloCartaDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Garante que o modelo existe
    return this.prisma.modeloCarta.delete({ where: { id } });
  }
}
