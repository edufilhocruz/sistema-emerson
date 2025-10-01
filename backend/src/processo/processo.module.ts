import { Module } from '@nestjs/common';
import { ProcessoController } from './processo.controller';
import { ProcessoService } from './processo.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessoRepository } from './processo.repository';

@Module({
  controllers: [ProcessoController],
  providers: [ProcessoService, ProcessoRepository, PrismaService],
})
export class ProcessoModule {}


