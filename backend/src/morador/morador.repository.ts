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
  create(createMoradorDto: CreateMoradorDto) {
    const { condominioId, telefone, valorAluguel, ...rest } = createMoradorDto;
    return this.prisma.morador.create({
      data: {
        ...rest,
        telefone: telefone || undefined,
        valorAluguel: valorAluguel || undefined,
        condominio: { connect: { id: condominioId } },
      },
    });
  }

  /**
   * Busca todos os moradores no banco de dados.
   * Inclui o nome do condomínio relacionado para evitar consultas adicionais.
   * @returns Uma promessa que resolve para uma lista de todos os moradores.
   */
  findAll() {
    return this.prisma.morador.findMany({
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
  }

  /**
   * Busca um único morador pelo seu ID.
   * Inclui o nome do condomínio relacionado.
   * @param id O UUID do morador.
   * @returns Uma promessa que resolve para o objeto do morador ou null se não for encontrado.
   */
  findOne(id: string) {
    return this.prisma.morador.findUnique({
      where: { id },
      include: {
        condominio: {
          select: { nome: true },
        },
      },
    });
  }

  /**
   * Atualiza os dados de um morador existente.
   * @param id O UUID do morador a ser atualizado.
   * @param updateMoradorDto Os dados a serem atualizados.
   * @returns O objeto do morador atualizado.
   */
  update(id: string, updateMoradorDto: UpdateMoradorDto) {
    const { condominioId, ...rest } = updateMoradorDto;
    return this.prisma.morador.update({
      where: { id },
      data: {
        ...rest,
        ...(condominioId && { condominio: { connect: { id: condominioId } } }),
      },
    });
  }

  /**
   * Remove um morador do banco de dados.
   * @param id O UUID do morador a ser removido.
   * @returns O objeto do morador que foi removido.
   */
  remove(id: string) {
    return this.prisma.morador.delete({ where: { id } });
  }
}
