import { Module } from '@nestjs/common';
import { ModeloCartaService } from './modelo-carta.service';
import { ModeloCartaController } from './modelo-carta.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ModeloCartaController],
  providers: [ModeloCartaService, PrismaService],
})
export class ModeloCartaModule {}
