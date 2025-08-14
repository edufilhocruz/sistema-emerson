import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailTemplateService {
  private uploadDir = path.join(__dirname, '../../uploads/images');

  constructor() {
    // Garantir que o diretório existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Processa um template de email substituindo URLs por CID
   * @param htmlContent - Conteúdo HTML do template
   * @param headerImageUrl - URL da imagem do header
   * @param footerImageUrl - URL da imagem do footer
   * @returns HTML processado com CID
   */
  async processEmailTemplate(
    htmlContent: string,
    headerImageUrl?: string,
    footerImageUrl?: string
  ): Promise<{ html: string; attachments: Array<{ filename: string; path: string; cid: string }> }> {
    const attachments: Array<{ filename: string; path: string; cid: string }> = [];
    let processedHtml = htmlContent;

    // Processar imagem do header
    if (headerImageUrl) {
      const headerCid = await this.processImageForEmail(headerImageUrl, 'header');
      if (headerCid) {
        processedHtml = this.replaceImageUrlsWithCid(processedHtml, headerImageUrl, headerCid.cid);
        attachments.push(headerCid);
      }
    }

    // Processar imagem do footer
    if (footerImageUrl) {
      const footerCid = await this.processImageForEmail(footerImageUrl, 'footer');
      if (footerCid) {
        processedHtml = this.replaceImageUrlsWithCid(processedHtml, footerImageUrl, footerCid.cid);
        attachments.push(footerCid);
      }
    }

    return {
      html: processedHtml,
      attachments
    };
  }

  /**
   * Processa uma imagem para uso em email
   * @param imageUrl - URL da imagem
   * @param type - Tipo da imagem (header/footer)
   * @returns Informações da imagem processada
   */
  private async processImageForEmail(
    imageUrl: string,
    type: 'header' | 'footer'
  ): Promise<{ filename: string; path: string; cid: string } | null> {
    try {
      // Extrair nome do arquivo da URL
      const fileName = this.extractFileNameFromUrl(imageUrl);
      if (!fileName) {
        console.warn(`❌ Não foi possível extrair nome do arquivo de: ${imageUrl}`);
        return null;
      }

      // Verificar se o arquivo existe
      const filePath = path.join(this.uploadDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`❌ Arquivo não encontrado: ${filePath}`);
        return null;
      }

      // Gerar CID único
      const cid = `${type}_${fileName.replace(/\.[^/.]+$/, '')}@raunaimer.app`;

      console.log(`✅ Imagem ${type} processada para email:`);
      console.log(`   📁 Arquivo: ${fileName}`);
      console.log(`   📂 Caminho: ${filePath}`);
      console.log(`   📧 CID: ${cid}`);

      return {
        filename: fileName,
        path: filePath,
        cid: cid
      };

    } catch (error) {
      console.error(`❌ Erro ao processar imagem ${type} para email:`, error);
      return null;
    }
  }

  /**
   * Substitui URLs de imagem por CID no HTML
   * @param html - Conteúdo HTML
   * @param imageUrl - URL original da imagem
   * @param cid - CID da imagem
   * @returns HTML com URLs substituídas por CID
   */
  private replaceImageUrlsWithCid(html: string, imageUrl: string, cid: string): string {
    // Substituir URLs absolutas
    let processedHtml = html.replace(
      new RegExp(`src=["']${this.escapeRegExp(imageUrl)}["']`, 'gi'),
      `src="cid:${cid}"`
    );

    // Substituir URLs relativas
    const relativeUrl = imageUrl.replace(/^.*\/uploads\//, '/uploads/');
    processedHtml = processedHtml.replace(
      new RegExp(`src=["']${this.escapeRegExp(relativeUrl)}["']`, 'gi'),
      `src="cid:${cid}"`
    );

    // Substituir URLs com diferentes prefixos
    const apiUrl = imageUrl.replace('/uploads/', '/api/static/uploads/');
    processedHtml = processedHtml.replace(
      new RegExp(`src=["']${this.escapeRegExp(apiUrl)}["']`, 'gi'),
      `src="cid:${cid}"`
    );

    console.log(`🔄 URLs substituídas por CID ${cid} no HTML`);

    return processedHtml;
  }

  /**
   * Extrai nome do arquivo de uma URL
   * @param url - URL da imagem
   * @returns Nome do arquivo
   */
  private extractFileNameFromUrl(url: string): string | null {
    try {
      // Remover query parameters
      const cleanUrl = url.split('?')[0];
      
      // Extrair nome do arquivo do final da URL
      const fileName = path.basename(cleanUrl);
      
      // Validar se é um arquivo de imagem
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const ext = path.extname(fileName).toLowerCase();
      
      if (!validExtensions.includes(ext)) {
        console.warn(`⚠️ Extensão inválida: ${ext} para arquivo ${fileName}`);
        return null;
      }

      return fileName;
    } catch (error) {
      console.error('❌ Erro ao extrair nome do arquivo:', error);
      return null;
    }
  }

  /**
   * Escapa caracteres especiais para regex
   * @param string - String para escapar
   * @returns String escapada
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Valida se uma imagem existe e é válida
   * @param imageUrl - URL da imagem
   * @returns true se a imagem é válida
   */
  async validateImage(imageUrl: string): Promise<boolean> {
    try {
      const fileName = this.extractFileNameFromUrl(imageUrl);
      if (!fileName) return false;

      const filePath = path.join(this.uploadDir, fileName);
      return fs.existsSync(filePath);
    } catch (error) {
      console.error('❌ Erro ao validar imagem:', error);
      return false;
    }
  }

  /**
   * Obtém informações de uma imagem
   * @param imageUrl - URL da imagem
   * @returns Informações da imagem
   */
  async getImageInfo(imageUrl: string): Promise<{
    exists: boolean;
    size?: number;
    mimeType?: string;
    cid?: string;
  }> {
    try {
      const fileName = this.extractFileNameFromUrl(imageUrl);
      if (!fileName) {
        return { exists: false };
      }

      const filePath = path.join(this.uploadDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        return { exists: false };
      }

      const stats = fs.statSync(filePath);
      const cid = `${fileName.replace(/\.[^/.]+$/, '')}@raunaimer.app`;

      return {
        exists: true,
        size: stats.size,
        mimeType: this.getMimeType(fileName),
        cid: cid
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações da imagem:', error);
      return { exists: false };
    }
  }

  /**
   * Determina o tipo MIME baseado na extensão do arquivo
   * @param fileName - Nome do arquivo
   * @returns Tipo MIME
   */
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Limpa imagens não utilizadas (opcional)
   * @param usedImageUrls - Array de URLs de imagens em uso
   * @returns Número de imagens removidas
   */
  async cleanUnusedImages(usedImageUrls: string[]): Promise<number> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      let removedCount = 0;

      for (const file of files) {
        const fileUrl = `/uploads/images/${file}`;
        const isUsed = usedImageUrls.some(url => url.includes(file));
        
        if (!isUsed) {
          const filePath = path.join(this.uploadDir, file);
          fs.unlinkSync(filePath);
          removedCount++;
          console.log(`🗑️ Imagem não utilizada removida: ${file}`);
        }
      }

      console.log(`✅ ${removedCount} imagens não utilizadas removidas`);
      return removedCount;
    } catch (error) {
      console.error('❌ Erro ao limpar imagens não utilizadas:', error);
      return 0;
    }
  }
}
