import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModeloCartaService } from './modelo-carta.service';
import { CreateModeloCartaDto } from './dto/create-modelo-carta.dto';
import { UpdateModeloCartaDto } from './dto/update-modelo-carta.dto';
import { FileManagerService } from '../shared/services/file-manager.service';
import { ImagePreviewService } from '../shared/services/image-preview.service';

/**
 * Controller responsável por gerenciar modelos de carta
 * Implementa arquitetura limpa com separação de responsabilidades
 */
@Controller('modelo-carta')
export class ModeloCartaController {
  constructor(
    private readonly modeloCartaService: ModeloCartaService,
    private readonly fileManager: FileManagerService,
    private readonly imagePreviewService: ImagePreviewService
  ) {
    console.log('=== MODELO CARTA CONTROLLER INSTANCIADO ===');
  }

  @Post()
  create(@Body() createModeloCartaDto: CreateModeloCartaDto) {
    return this.modeloCartaService.create(createModeloCartaDto);
  }

  @Get()
  findAll() {
    return this.modeloCartaService.findAll();
  }

  @Get('campos-dinamicos')
  getCamposDinamicos() {
    console.log('=== ENDPOINT CAMPOS DINÂMICOS CHAMADO ===');
    const result = this.modeloCartaService.getCamposDinamicos();
    console.log('Resultado:', JSON.stringify(result, null, 2));
    return result;
  }

  @Get('teste')
  teste() {
    console.log('=== ENDPOINT TESTE CHAMADO ===');
    return { message: 'Teste funcionando!' };
  }

  /**
   * Upload de imagem com geração de URL temporária e CID
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada.');
    }

    try {
      console.log(`=== UPLOAD DE IMAGEM ===`);
      console.log(`📁 Nome: ${file.originalname}`);
      console.log(`📏 Tamanho: ${file.size} bytes`);
      
      // Usa o ImagePreviewService para gerar URL temporária e CID
      const result = await this.imagePreviewService.saveAndGeneratePreview(file);
      
      console.log(`✅ Imagem processada com sucesso!`);
      console.log(`🔗 URL temporária: ${result.previewUrl}`);
      console.log(`📧 CID: ${result.cid}`);

      return {
        cid: result.cid,
        previewUrl: result.previewUrl
      };

    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      throw new BadRequestException(`Erro ao processar a imagem: ${error.message}`);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modeloCartaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateModeloCartaDto: UpdateModeloCartaDto,
  ) {
    return this.modeloCartaService.update(id, updateModeloCartaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.modeloCartaService.remove(id);
    } catch (error) {
      console.error('Erro ao excluir modelo:', error.message);
      throw error;
    }
  }
}
