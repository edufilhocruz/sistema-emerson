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
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Diretório de uploads criado: ${this.uploadsDir}`);
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
      this.logger.log(`Iniciando upload de imagem: ${file.originalname}`);

      // Valida o arquivo
      this.validateImageFile(file.buffer, file.mimetype);

      // Gera nome único
      const fileName = this.generateUniqueFileName(file.originalname);
      const filePath = path.join(this.uploadsDir, fileName);

      // Salva o arquivo
      fs.writeFileSync(filePath, file.buffer);

      // Retorna URL relativa para o banco
      const relativeUrl = `/api/static/uploads/images/${fileName}`;
      
      this.logger.log(`Imagem salva com sucesso: ${relativeUrl}`);
      return relativeUrl;

    } catch (error) {
      this.logger.error(`Erro ao salvar imagem: ${error.message}`);
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
