import { Module } from '@nestjs/common';
import { CondominioService } from './condominio.service';
import { CondominioController } from './condominio.controller';
import { CondominioRepository } from './condominio.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CondominioController],
  providers: [CondominioService, CondominioRepository, PrismaService],
})
export class CondominioModule {}
