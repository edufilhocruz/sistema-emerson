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
import * as fs from 'fs';
import * as path from 'path';

@Controller('modelo-carta')
export class ModeloCartaController {
  constructor(private readonly modeloCartaService: ModeloCartaService) {
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

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada.');
    }

    // Validar tipo de arquivo
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Apenas arquivos de imagem são permitidos.');
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('A imagem deve ter no máximo 2MB.');
    }

    // Criar diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `image_${timestamp}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Salvar arquivo
    fs.writeFileSync(filepath, file.buffer);

    // Retornar URL da imagem
    const imageUrl = `/api/static/uploads/images/${filename}`;

    return {
      success: true,
      url: imageUrl,
      filename: filename
    };
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
