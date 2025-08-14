import { Module } from '@nestjs/common';
import { ModeloCartaService } from './modelo-carta.service';
import { ModeloCartaController } from './modelo-carta.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SharedModule } from '../shared/shared.module';
import { ImagePreviewService } from '../shared/services/image-preview.service';

@Module({
  imports: [SharedModule],
  controllers: [ModeloCartaController],
  providers: [ModeloCartaService, PrismaService, ImagePreviewService],
})
export class ModeloCartaModule {}
