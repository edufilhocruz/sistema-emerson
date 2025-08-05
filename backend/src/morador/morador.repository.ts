import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoradorDto } from './dto/create-morador.dto';
import { UpdateMoradorDto } from './dto/update-morador.dto';

/**
 * MoradorRepository
 * * Esta classe é responsável por toda a comunicação direta com o banco de dados
 * para a entidade 'Morador'. Ela abstrai as consultas do Prisma, permitindo que
 * a camada de serviço (lógica de negócio) permaneça limpa e focada.
 */
@Injectable()
export class MoradorRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo registro de morador no banco de dados.
   * @param createMoradorDto Os dados para o novo morador.
   * @returns O objeto do morador criado.
   */
  async create(createMoradorDto: CreateMoradorDto) {
    try {
      const { condominioId, telefone, valorAluguel, ...rest } = createMoradorDto;
      return await this.prisma.morador.create({
        data: {
          ...rest,
          telefone: telefone === null || telefone === undefined ? null : telefone,
          valorAluguel: valorAluguel === null || valorAluguel === undefined ? null : Number(valorAluguel),
          condominio: { connect: { id: condominioId } },
        },
      });
    } catch (error) {
      console.error('Erro ao criar morador no repositório:', error);
      throw new Error('Erro interno ao criar morador no banco de dados');
    }
  }

  /**
   * Busca todos os moradores no banco de dados.
   * Inclui o nome do condomínio relacionado para evitar consultas adicionais.
   * @returns Uma promessa que resolve para uma lista de todos os moradores.
   */
  async findAll() {
    try {
      return await this.prisma.morador.findMany({
        include: {
          condominio: {
            select: { id: true, nome: true },
          },
          cobrancas: {
            orderBy: { dataEnvio: 'desc' },
            take: 1,
            select: {
              dataEnvio: true,
              status: true,
              statusEnvio: true,
              modeloCarta: { select: { titulo: true } },
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar todos os moradores:', error);
      throw new Error('Erro interno ao buscar moradores');
    }
  }

  /**
   * Busca um único morador pelo seu ID.
   * Inclui o nome do condomínio relacionado.
   * @param id O UUID do morador.
   * @returns Uma promessa que resolve para o objeto do morador ou null se não for encontrado.
   */
  async findOne(id: string) {
    try {
      return await this.prisma.morador.findUnique({
        where: { id },
        include: {
          condominio: {
            select: { nome: true },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao buscar morador:', error);
      throw new Error('Erro interno ao buscar morador');
    }
  }

  /**
   * Atualiza os dados de um morador existente.
   * @param id O UUID do morador a ser atualizado.
   * @param updateMoradorDto Os dados a serem atualizados.
   * @returns O objeto do morador atualizado.
   */
  async update(id: string, updateMoradorDto: UpdateMoradorDto) {
    try {
      const { condominioId, ...rest } = updateMoradorDto;
      return await this.prisma.morador.update({
        where: { id },
        data: {
          ...rest,
          ...(condominioId && { condominio: { connect: { id: condominioId } } }),
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar morador:', error);
      throw new Error('Erro interno ao atualizar morador');
    }
  }

  /**
   * Remove um morador do banco de dados.
   * @param id O UUID do morador a ser removido.
   * @returns O objeto do morador que foi removido.
   */
  async remove(id: string) {
    try {
      return await this.prisma.morador.delete({ where: { id } });
    } catch (error) {
      console.error('Erro ao remover morador:', error);
      throw new Error('Erro interno ao remover morador');
    }
  }
}
