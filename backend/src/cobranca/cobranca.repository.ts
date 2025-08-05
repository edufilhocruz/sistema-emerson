import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';

@Injectable()
export class CobrancaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCobrancaDto: CreateCobrancaDto) {
    try {
      const { condominioId, moradorId, modeloCartaId, ...rest } = createCobrancaDto;
      
      // Constrói o objeto de dados
      const data: any = {
        ...rest,
        condominio: { connect: { id: condominioId } },
        morador: { connect: { id: moradorId } },
        modeloCarta: { connect: { id: modeloCartaId } }
      };
      
      // Garante que valor seja null se não fornecido ou inválido
      if (data.valor === undefined || data.valor === null || data.valor <= 0) {
        data.valor = null;
      }
      
      console.log('=== DADOS FINAIS DO REPOSITORY ===');
      console.log('Dados para criação da cobrança:', JSON.stringify(data, null, 2));
      
      return await this.prisma.cobranca.create({ data });
    } catch (error) {
      console.error('Erro no repositório de cobrança:', error);
      throw new Error('Erro interno ao criar cobrança no banco de dados');
    }
  }

  async findAll() {
    try {
      return await this.prisma.cobranca.findMany({
        include: {
          morador: { select: { nome: true } },
          condominio: { select: { id: true, nome: true } },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar todas as cobranças:', error);
      throw new Error('Erro interno ao buscar cobranças');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.cobranca.findUnique({
        where: { id },
        include: { 
          morador: true, 
          condominio: { select: { id: true, nome: true } }, 
          modeloCarta: true 
        },
      });
    } catch (error) {
      console.error('Erro ao buscar cobrança:', error);
      throw new Error('Erro interno ao buscar cobrança');
    }
  }

  async update(id: string, updateCobrancaDto: UpdateCobrancaDto) {
    try {
      return await this.prisma.cobranca.update({
        where: { id },
        data: updateCobrancaDto,
      });
    } catch (error) {
      console.error('Erro ao atualizar cobrança:', error);
      throw new Error('Erro interno ao atualizar cobrança');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.cobranca.delete({ where: { id } });
    } catch (error) {
      console.error('Erro ao remover cobrança:', error);
      throw new Error('Erro interno ao remover cobrança');
    }
  }
}
