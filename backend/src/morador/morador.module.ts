import { Module } from '@nestjs/common';
import { MoradorService } from './morador.service';
import { MoradorController } from './morador.controller';
import { MoradorRepository } from './morador.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MoradorController],
  providers: [MoradorService, MoradorRepository, PrismaService],
})
export class MoradorModule {}
