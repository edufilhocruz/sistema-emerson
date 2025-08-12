import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface para dados de imagem com CID
 */
export interface ImageWithCid {
  cid: string;
  filename: string;
  path: string;
  contentType: string;
}

/**
 * Interface para template de email
 */
export interface EmailTemplate {
  html: string;
  attachments: ImageWithCid[];
}

/**
 * Serviço responsável por gerar templates de email com CID
 * Implementa arquitetura limpa para manipulação de templates
 */
@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  /**
   * Gera um template de email com imagens usando CID
   */
  async generateEmailTemplate(
    conteudo: string,
    headerImageUrl?: string,
    footerImageUrl?: string
  ): Promise<EmailTemplate> {
    try {
      this.logger.log('Gerando template de email com CID');

      const attachments: ImageWithCid[] = [];
      let processedHtml = conteudo;

      // Processa imagem do cabeçalho
      if (headerImageUrl) {
        const headerCid = await this.processImageForCid(headerImageUrl, 'header');
        if (headerCid) {
          attachments.push(headerCid);
          processedHtml = this.insertImageInHtml(processedHtml, headerCid.cid, 'header');
        }
      }

      // Processa imagem do rodapé
      if (footerImageUrl) {
        const footerCid = await this.processImageForCid(footerImageUrl, 'footer');
        if (footerCid) {
          attachments.push(footerCid);
          processedHtml = this.insertImageInHtml(processedHtml, footerCid.cid, 'footer');
        }
      }

      // Aplica template HTML base
      const finalHtml = this.applyBaseTemplate(processedHtml);

      this.logger.log(`Template gerado com ${attachments.length} anexos`);
      
      return {
        html: finalHtml,
        attachments
      };

    } catch (error) {
      this.logger.error(`Erro ao gerar template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Processa uma imagem para uso com CID
   */
  private async processImageForCid(imageUrl: string, type: 'header' | 'footer'): Promise<ImageWithCid | null> {
    try {
      if (!imageUrl) return null;

      // Extrai o nome do arquivo da URL
      const fileName = path.basename(imageUrl);
      const filePath = path.join(process.cwd(), 'uploads', 'images', fileName);

      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Arquivo não encontrado: ${filePath}`);
        return null;
      }

      // Determina o tipo MIME baseado na extensão
      const contentType = this.getMimeType(fileName);

      // Gera CID único
      const cid = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.logger.log(`Imagem processada para CID: ${cid} (${fileName})`);

      return {
        cid,
        filename: fileName,
        path: filePath,
        contentType
      };

    } catch (error) {
      this.logger.error(`Erro ao processar imagem para CID: ${error.message}`);
      return null;
    }
  }

  /**
   * Insere imagem no HTML usando CID
   */
  private insertImageInHtml(html: string, cid: string, type: 'header' | 'footer'): string {
    const imgTag = `<img src="cid:${cid}" alt="${type}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`;
    
    if (type === 'header') {
      // Insere no início do conteúdo
      return `<div style="text-align: center; margin-bottom: 20px;">${imgTag}</div>\n${html}`;
    } else {
      // Insere no final do conteúdo
      return `${html}\n<div style="text-align: center; margin-top: 20px;">${imgTag}</div>`;
    }
  }

  /**
   * Aplica template HTML base
   */
  private applyBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cobrança</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .content {
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Esta é uma cobrança automática do sistema Raunaimer.</p>
            <p>Para dúvidas, entre em contato conosco.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Determina o tipo MIME baseado na extensão do arquivo
   */
  private getMimeType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Substitui placeholders no conteúdo
   */
  substitutePlaceholders(content: string, data: Record<string, any>): string {
    let processedContent = content;

    // Substitui cada placeholder pelos dados correspondentes
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });

    return processedContent;
  }
}
