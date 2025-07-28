import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class PermissaoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.permissao.findMany();
  }

  findOne(id: string) {
    return this.prisma.permissao.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.permissao.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.permissao.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.permissao.delete({ where: { id } });
  }
} 