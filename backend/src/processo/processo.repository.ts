import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    try {
      console.log('=== PROCESSO REPOSITORY CREATE ===');
      console.log('Dados para criar:', JSON.stringify(data, null, 2));
      
      const resultado = await this.prisma.processo.create({
        data,
        include: {
          condominio: true,
        },
      });
      
      console.log('Processo criado no repository:', JSON.stringify(resultado, null, 2));
      return resultado;
    } catch (error) {
      console.error('ERRO no repository create:', error);
      
      // Tentar criar sem include se falhar
      console.log('Tentando criar sem include...');
      try {
        const resultado = await this.prisma.processo.create({
          data,
        });
        console.log('Processo criado sem include:', JSON.stringify(resultado, null, 2));
        return resultado;
      } catch (secondError) {
        console.error('ERRO também sem include:', secondError);
        throw secondError;
      }
    }
  }

  async findAll() {
    try {
      console.log('=== PROCESSO REPOSITORY FINDALL ===');
      return await this.prisma.processo.findMany({
        include: {
          condominio: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('ERRO no findAll com include:', error);
      
      // Tentar sem include se falhar
      console.log('Tentando findAll sem include...');
      try {
        const resultado = await this.prisma.processo.findMany({
          orderBy: { createdAt: 'desc' },
        });
        console.log('Processos encontrados sem include:', resultado.length);
        return resultado;
      } catch (secondError) {
        console.error('ERRO também sem include:', secondError);
        throw secondError;
      }
    }
  }

  async findOne(id: string) {
    return this.prisma.processo.findUnique({
      where: { id },
      include: {
        condominio: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.processo.update({
      where: { id },
      data,
      include: {
        condominio: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.processo.delete({ where: { id } });
  }
}


