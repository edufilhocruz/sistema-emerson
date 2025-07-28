import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class LogAuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(usuario: string, acao: string, ip: string) {
    return this.prisma.logAuditoria.create({
      data: { usuario, acao, ip },
    });
  }

  async buscarTodos({ page = 1, limit = 20 }: { page?: number; limit?: number }) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.logAuditoria.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.logAuditoria.count(),
    ]);
    return { logs, total };
  }
} 