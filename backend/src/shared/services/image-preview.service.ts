import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImagePreviewService {
  private uploadDir = path.join(__dirname, '../../../uploads/images');

  constructor() {
    // Cria o diretório de uploads se não existir
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log('✅ Diretório de uploads criado:', this.uploadDir);
    }
  }

  /**
   * Salva a imagem e gera informações para preview e envio
   * @param file - Arquivo de imagem enviado
   * @returns Objeto com CID para email e URL para preview
   */
  async saveAndGeneratePreview(file: Express.Multer.File) {
    try {
      // Gera nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const uniqueId = uuidv4();
      const fileName = `${uniqueId}${fileExtension}`;
      const filePath = path.join(this.uploadDir, fileName);

      // Salva o arquivo fisicamente no servidor
      fs.writeFileSync(filePath, file.buffer);
      console.log('📁 Arquivo salvo em:', filePath);

      // CID para envio de email (Content-ID)
      // Formato: nome_do_arquivo@app
      const cid = `cid:${fileName}@app`;

      // URL para preview no frontend
      // Esta URL será servida pelo NestJS através do serviço de arquivos estáticos
      const previewUrl = `/api/static/uploads/images/${fileName}`;

      console.log('=== IMAGEM PROCESSADA COM SUCESSO ===');
      console.log('📁 Arquivo salvo como:', fileName);
      console.log('📂 Caminho completo:', filePath);
      console.log('🔗 URL de preview:', previewUrl);
      console.log('📧 CID para email:', cid);
      console.log('📏 Tamanho:', file.size, 'bytes');

      return {
        cid,                              // CID para usar no envio de email
        previewUrl,                       // URL relativa para preview no frontend
        originalName: file.originalname,  // Nome original do arquivo
        savedAs: fileName,                // Nome do arquivo salvo
        filePath,                         // Caminho completo no servidor
        size: file.size,                  // Tamanho do arquivo
        mimeType: file.mimetype          // Tipo MIME do arquivo
      };
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      throw new Error(`Falha ao processar imagem: ${error.message}`);
    }
  }

  /**
   * Remove uma imagem do sistema
   * @param fileName - Nome do arquivo a ser removido
   */
  async deleteImage(fileName: string): Promise<void> {
    try {
      if (!fileName) {
        console.warn('⚠️ Nome do arquivo não fornecido para exclusão');
        return;
      }

      // Remove o caminho se vier completo, mantém apenas o nome do arquivo
      const cleanFileName = path.basename(fileName);
      const filePath = path.join(this.uploadDir, cleanFileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Imagem removida: ${cleanFileName}`);
      } else {
        console.warn(`⚠️ Arquivo não encontrado: ${cleanFileName}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao remover imagem:`, error);
      throw new Error(`Falha ao remover imagem: ${error.message}`);
    }
  }

  /**
   * Verifica se uma imagem existe
   * @param fileName - Nome do arquivo a verificar
   */
  async imageExists(fileName: string): Promise<boolean> {
    try {
      if (!fileName) return false;
      
      const cleanFileName = path.basename(fileName);
      const filePath = path.join(this.uploadDir, cleanFileName);
      
      return fs.existsSync(filePath);
    } catch (error) {
      console.error(`❌ Erro ao verificar imagem:`, error);
      return false;
    }
  }

  /**
   * Obtém informações sobre uma imagem
   * @param fileName - Nome do arquivo
   */
  async getImageInfo(fileName: string): Promise<any> {
    try {
      if (!fileName) {
        throw new Error('Nome do arquivo não fornecido');
      }

      const cleanFileName = path.basename(fileName);
      const filePath = path.join(this.uploadDir, cleanFileName);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${cleanFileName}`);
      }

      const stats = fs.statSync(filePath);
      
      return {
        fileName: cleanFileName,
        filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        previewUrl: `/uploads/images/${cleanFileName}`,
        cid: `cid:${cleanFileName}@app`
      };
    } catch (error) {
      console.error(`❌ Erro ao obter informações da imagem:`, error);
      throw error;
    }
  }

  /**
   * Lista todas as imagens no diretório
   */
  async listImages(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      });
      
      console.log(`📁 ${imageFiles.length} imagens encontradas no diretório`);
      return imageFiles;
    } catch (error) {
      console.error(`❌ Erro ao listar imagens:`, error);
      return [];
    }
  }

  /**
   * Limpa imagens antigas (opcional - para manutenção)
   * @param daysOld - Remove imagens mais antigas que X dias
   */
  async cleanOldImages(daysOld: number = 30): Promise<number> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const now = Date.now();
      const cutoffTime = daysOld * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️ Imagem antiga removida: ${file}`);
        }
      }

      console.log(`✅ ${deletedCount} imagens antigas removidas`);
      return deletedCount;
    } catch (error) {
      console.error(`❌ Erro ao limpar imagens antigas:`, error);
      return 0;
    }
  }
}