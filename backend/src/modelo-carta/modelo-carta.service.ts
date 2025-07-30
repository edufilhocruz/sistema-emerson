import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModeloCartaDto } from './dto/create-modelo-carta.dto';
import { UpdateModeloCartaDto } from './dto/update-modelo-carta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModeloCartaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createModeloCartaDto: CreateModeloCartaDto) {
    console.log('=== CRIANDO MODELO DE CARTA ===');
    console.log('DTO recebido:', JSON.stringify(createModeloCartaDto, null, 2));
    
    const result = await this.prisma.modeloCarta.create({
      data: createModeloCartaDto,
    });
    
    console.log('Modelo criado com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  findAll() {
    console.log('=== BUSCANDO TODOS OS MODELOS ===');
    return this.prisma.modeloCarta.findMany();
  }

  async findOne(id: string) {
    console.log('=== BUSCANDO MODELO POR ID ===');
    console.log('ID:', id);
    
    const modelo = await this.prisma.modeloCarta.findUnique({ where: { id } });
    
    if (!modelo) {
      console.log('❌ Modelo não encontrado');
      throw new NotFoundException(`Modelo com ID ${id} não encontrado.`);
    }
    
    console.log('✅ Modelo encontrado:', JSON.stringify(modelo, null, 2));
    return modelo;
  }

  async update(id: string, updateModeloCartaDto: UpdateModeloCartaDto) {
    console.log('=== ATUALIZANDO MODELO DE CARTA ===');
    console.log('ID:', id);
    console.log('DTO recebido:', JSON.stringify(updateModeloCartaDto, null, 2));
    
    // Verifica se o modelo existe
    await this.findOne(id);
    
    const result = await this.prisma.modeloCarta.update({
      where: { id },
      data: updateModeloCartaDto,
    });
    
    console.log('✅ Modelo atualizado com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  async remove(id: string) {
    console.log('=== REMOVENDO MODELO DE CARTA ===');
    console.log('ID:', id);
    
    // Verifica se o modelo existe
    await this.findOne(id);
    
    const result = await this.prisma.modeloCarta.delete({ where: { id } });
    
    console.log('✅ Modelo removido com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }
}
