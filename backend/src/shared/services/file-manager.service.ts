import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço responsável por gerenciar uploads e manipulação de arquivos
 * Implementa arquitetura limpa com separação de responsabilidades
 */
@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'images');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  constructor() {
    this.ensureUploadsDirectory();
  }

  /**
   * Garante que o diretório de uploads existe
   */
  private ensureUploadsDirectory(): void {
    try {
      // Cria o diretório principal de uploads
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        this.logger.log(`✅ Diretório de uploads criado: ${this.uploadsDir}`);
      }
      
      // Verifica se o diretório existe e é acessível
      if (fs.existsSync(this.uploadsDir)) {
        this.logger.log(`✅ Diretório de uploads existe e é acessível: ${this.uploadsDir}`);
        
        // Lista arquivos no diretório para debug
        const files = fs.readdirSync(this.uploadsDir);
        this.logger.log(`📁 Arquivos no diretório uploads: ${files.length} arquivos`);
        if (files.length > 0) {
          this.logger.log(`📄 Primeiros 5 arquivos: ${files.slice(0, 5).join(', ')}`);
        }
      } else {
        this.logger.error(`❌ Falha ao criar diretório de uploads: ${this.uploadsDir}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao verificar/criar diretório de uploads: ${error.message}`);
    }
  }

  /**
   * Valida um arquivo de imagem
   */
  private validateImageFile(buffer: Buffer, mimetype: string): void {
    // Valida tamanho
    if (buffer.length > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo permitido: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Valida tipo MIME
    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${this.allowedMimeTypes.join(', ')}`);
    }
  }

  /**
   * Gera um nome único para o arquivo
   */
  private generateUniqueFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const uniqueId = uuidv4().replace(/-/g, '').substring(0, 8);
    return `${timestamp}-${uniqueId}${extension}`;
  }

  /**
   * Salva uma imagem e retorna a URL relativa
   */
  async saveImage(file: Express.Multer.File): Promise<string> {
    try {
      this.logger.log(`=== INICIANDO UPLOAD DE IMAGEM ===`);
      this.logger.log(`📁 Nome original: ${file.originalname}`);
      this.logger.log(`📏 Tamanho: ${file.size} bytes`);
      this.logger.log(`🎨 Tipo MIME: ${file.mimetype}`);
      this.logger.log(`📂 Diretório de destino: ${this.uploadsDir}`);

      // Valida o arquivo
      this.validateImageFile(file.buffer, file.mimetype);
      this.logger.log(`✅ Validação do arquivo passou`);

      // Gera nome único
      const fileName = this.generateUniqueFileName(file.originalname);
      const filePath = path.join(this.uploadsDir, fileName);
      
      this.logger.log(`📝 Nome do arquivo gerado: ${fileName}`);
      this.logger.log(`📂 Caminho completo: ${filePath}`);

      // Salva o arquivo
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`✅ Arquivo salvo no sistema de arquivos`);

      // Verifica se o arquivo foi realmente salvo
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.logger.log(`✅ Arquivo existe e tem ${stats.size} bytes`);
      } else {
        throw new Error('Arquivo não foi salvo corretamente');
      }

      // Retorna URL relativa para o banco
      const relativeUrl = `/api/static/uploads/images/${fileName}`;
      
      this.logger.log(`🔗 URL relativa gerada: ${relativeUrl}`);
      this.logger.log(`✅ Upload concluído com sucesso!`);
      
      return relativeUrl;

    } catch (error) {
      this.logger.error(`❌ Erro ao salvar imagem: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Remove uma imagem do sistema de arquivos
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl) return;

      // Extrai o nome do arquivo da URL
      const fileName = path.basename(imageUrl);
      const filePath = path.join(this.uploadsDir, fileName);

      // Verifica se o arquivo existe
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Imagem removida: ${fileName}`);
      }

    } catch (error) {
      this.logger.error(`Erro ao remover imagem: ${error.message}`);
      // Não lança erro para não quebrar o fluxo principal
    }
  }

  /**
   * Verifica se uma imagem existe
   */
  async imageExists(imageUrl: string): Promise<boolean> {
    if (!imageUrl) return false;

    try {
      const fileName = path.basename(imageUrl);
      const filePath = path.join(this.uploadsDir, fileName);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Obtém o caminho absoluto de uma imagem
   */
  getImagePath(imageUrl: string): string | null {
    if (!imageUrl) return null;

    try {
      const fileName = path.basename(imageUrl);
      return path.join(this.uploadsDir, fileName);
    } catch {
      return null;
    }
  }
}
