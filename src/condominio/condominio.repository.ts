import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Serviço do Prisma injetável
import { CreateCondominioDto } from './dto/create-condominio.dto';

@Injectable()
export class CondominioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCondominioDto) {
    return this.prisma.condominio.create({ data });
  }

  async findOne(id: string) {
    return this.prisma.condominio.findUnique({ where: { id } });
  }
}