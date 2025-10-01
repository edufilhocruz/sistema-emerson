import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.processo.create({ data });
  }

  async findAll() {
    return this.prisma.processo.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    return this.prisma.processo.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.processo.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.processo.delete({ where: { id } });
  }
}


