import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CobrancaService } from './cobranca.service';
import { CobrancaController } from './cobranca.controller';
import { CobrancaRepository } from './cobranca.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CobrancaProcessor } from './cobranca.processor';
import { EmailConfigService } from '../email-config.service';
import { ModeloCartaService } from '../modelo-carta/modelo-carta.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'import-cobranca', // Registra a fila a ser usada neste módulo
    }),
  ],
  controllers: [CobrancaController],
  providers: [
    CobrancaService,
    CobrancaRepository,
    PrismaService,
    CobrancaProcessor, // Adiciona o worker como um provider para que o NestJS o gerencie
    EmailConfigService,
    ModeloCartaService,
  ],
})
export class CobrancaModule {}
