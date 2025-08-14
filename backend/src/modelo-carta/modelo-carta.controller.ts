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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModeloCartaService } from './modelo-carta.service';
import { CreateModeloCartaDto } from './dto/create-modelo-carta.dto';
import { UpdateModeloCartaDto } from './dto/update-modelo-carta.dto';
import { FileManagerService } from '../shared/services/file-manager.service';
import { ImagePreviewService } from '../shared/services/image-preview.service';
import { EmailTemplateService } from '../shared/services/email-template.service';

/**
 * Controller responsável por gerenciar modelos de carta
 * Implementa arquitetura limpa com separação de responsabilidades
 */
@Controller('modelo-carta')
export class ModeloCartaController {
  constructor(
    private readonly modeloCartaService: ModeloCartaService,
    private readonly fileManager: FileManagerService,
    private readonly imagePreviewService: ImagePreviewService,
    private readonly emailTemplateService: EmailTemplateService
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

  /**
   * Processa um template de email substituindo URLs por CID
   */
  @Post('process-email-template')
  async processEmailTemplate(@Body() data: {
    htmlContent: string;
    headerImageUrl?: string;
    footerImageUrl?: string;
  }) {
    try {
      console.log('=== PROCESSANDO TEMPLATE DE EMAIL ===');
      console.log('📧 Conteúdo HTML recebido:', data.htmlContent.substring(0, 200) + '...');
      console.log('🖼️ Header image URL:', data.headerImageUrl);
      console.log('🖼️ Footer image URL:', data.footerImageUrl);

      const result = await this.emailTemplateService.processEmailTemplate(
        data.htmlContent,
        data.headerImageUrl,
        data.footerImageUrl
      );

      console.log('✅ Template processado com sucesso!');
      console.log(`📎 ${result.attachments.length} anexos processados`);
      console.log('📧 HTML final (primeiros 200 chars):', result.html.substring(0, 200) + '...');

      return {
        success: true,
        html: result.html,
        attachments: result.attachments.map(att => ({
          filename: att.filename,
          cid: att.cid,
          size: att.path ? require('fs').statSync(att.path).size : 0
        })),
        message: 'Template processado com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao processar template:', error);
      throw new BadRequestException(`Erro ao processar template: ${error.message}`);
    }
  }

  /**
   * Valida imagens de um modelo
   */
  @Get('validate-images')
  async validateImages(@Query('headerImageUrl') headerImageUrl?: string, @Query('footerImageUrl') footerImageUrl?: string) {
    try {
      console.log('=== VALIDANDO IMAGENS ===');
      
      const results = {
        header: headerImageUrl ? await this.emailTemplateService.validateImage(headerImageUrl) : null,
        footer: footerImageUrl ? await this.emailTemplateService.validateImage(footerImageUrl) : null
      };

      console.log('✅ Validação concluída:', results);
      return results;

    } catch (error) {
      console.error('❌ Erro na validação:', error);
      throw new BadRequestException(`Erro na validação: ${error.message}`);
    }
  }

  /**
   * Obtém informações de uma imagem
   */
  @Get('image-info')
  async getImageInfo(@Query('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('URL da imagem é obrigatória.');
    }

    try {
      console.log('=== OBTENDO INFORMAÇÕES DA IMAGEM ===');
      console.log('🖼️ URL:', imageUrl);

      const info = await this.emailTemplateService.getImageInfo(imageUrl);
      
      console.log('✅ Informações obtidas:', info);
      return info;

    } catch (error) {
      console.error('❌ Erro ao obter informações:', error);
      throw new BadRequestException(`Erro ao obter informações: ${error.message}`);
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
