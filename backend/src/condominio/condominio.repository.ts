import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCondominioDto } from './dto/create-condominio.dto';
import { UpdateCondominioDto } from './dto/update-condominio.dto';

@Injectable()
export class CondominioRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createCondominioDto: CreateCondominioDto) {
    return this.prisma.condominio.create({ data: createCondominioDto });
  }

  findAll() {
    return this.prisma.condominio.findMany();
  }

  findOne(id: string) {
    return this.prisma.condominio.findUnique({ where: { id } });
  }

  update(id: string, updateCondominioDto: UpdateCondominioDto) {
    // Remove campos undefined para não sobrescrever dados existentes
    const data = Object.fromEntries(
      Object.entries(updateCondominioDto).filter(([_, v]) => v !== undefined)
    );
    return this.prisma.condominio.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // Usa uma transação para deletar todos os registros relacionados
    return await this.prisma.$transaction(async (prisma) => {
      // Primeiro deleta todas as cobranças relacionadas ao condomínio
      await prisma.cobranca.deleteMany({
        where: { condominioId: id }
      });

      // Depois deleta todos os moradores do condomínio
      await prisma.morador.deleteMany({
        where: { condominioId: id }
      });

      // Finalmente deleta o condomínio
      return await prisma.condominio.delete({
        where: { id }
      });
    });
  }
}
