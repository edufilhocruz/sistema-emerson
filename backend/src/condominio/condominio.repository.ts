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
      console.log('=== INICIANDO EXCLUSÃO EM CASCATA ===');
      
      // 1. Primeiro deleta todas as cobranças relacionadas ao condomínio
      console.log('1. Deletando cobranças...');
      const cobrancasDeletadas = await prisma.cobranca.deleteMany({
        where: { condominioId: id }
      });
      console.log(`   ${cobrancasDeletadas.count} cobranças deletadas`);

      // 2. Depois deleta todos os moradores do condomínio
      console.log('2. Deletando moradores...');
      const moradoresDeletados = await prisma.morador.deleteMany({
        where: { condominioId: id }
      });
      console.log(`   ${moradoresDeletados.count} moradores deletados`);

      // 3. Finalmente deleta o condomínio
      console.log('3. Deletando condomínio...');
      const condominio = await prisma.condominio.delete({
        where: { id }
      });
      console.log(`   Condomínio "${condominio.nome}" deletado com sucesso`);
      
      return condominio;
    });
  }
}
