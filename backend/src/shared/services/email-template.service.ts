import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateEngineService, TemplateData, TemplateConfig } from './template-engine.service';

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

  constructor(private readonly templateEngine: TemplateEngineService) {}

  /**
   * Gera um template de email com imagens usando CID
   */
  async generateEmailTemplate(
    conteudo: string,
    headerImageUrl?: string,
    footerImageUrl?: string,
    templateData?: TemplateData,
    config?: TemplateConfig
  ): Promise<EmailTemplate> {
    try {
      console.log('=== GERANDO TEMPLATE DE EMAIL ===');
      console.log('Conteúdo recebido (primeiros 200 chars):', conteudo.substring(0, 200));
      console.log('Header image URL:', headerImageUrl);
      console.log('Footer image URL:', footerImageUrl);
      console.log('Template data:', templateData);
      console.log('Config:', config);

      this.logger.log('Gerando template de email com CID e Handlebars');

      const attachments: ImageWithCid[] = [];

      // Processa imagem do cabeçalho
      if (headerImageUrl) {
        console.log('🔧 Processando imagem do cabeçalho...');
        const headerCid = await this.processImageForCid(headerImageUrl, 'header');
        if (headerCid) {
          attachments.push(headerCid);
          console.log('✅ Imagem do cabeçalho processada:', headerCid.filename);
        } else {
          console.log('⚠️ Imagem do cabeçalho não foi processada');
        }
      } else {
        console.log('ℹ️ Nenhuma imagem de cabeçalho fornecida');
      }

      // Processa imagem do rodapé
      if (footerImageUrl) {
        console.log('🔧 Processando imagem do rodapé...');
        const footerCid = await this.processImageForCid(footerImageUrl, 'footer');
        if (footerCid) {
          attachments.push(footerCid);
          console.log('✅ Imagem do rodapé processada:', footerCid.filename);
        } else {
          console.log('⚠️ Imagem do rodapé não foi processada');
        }
      } else {
        console.log('ℹ️ Nenhuma imagem de rodapé fornecida');
      }

      // Configuração do template
      const templateConfig: TemplateConfig = {
        headerImageUrl: headerImageUrl ? 'cid:header_image' : undefined,
        footerImageUrl: footerImageUrl ? 'cid:footer_image' : undefined,
        ...config
      };

      console.log('🔧 Configuração do template:', templateConfig);

      // Gera o HTML usando o TemplateEngineService
      console.log('🔧 Gerando HTML final...');
      const finalHtml = this.templateEngine.generateEmailTemplate(
        conteudo,
        templateData || {},
        templateConfig
      );

      console.log('✅ HTML gerado com sucesso (primeiros 200 chars):', finalHtml.substring(0, 200));
      console.log(`✅ Template gerado com ${attachments.length} anexos`);
      
      this.logger.log(`Template gerado com ${attachments.length} anexos`);
      
      return {
        html: finalHtml,
        attachments
      };

    } catch (error) {
      console.error('❌ Erro ao gerar template:', error);
      console.error('Stack trace:', error.stack);
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
   * Substitui placeholders no conteúdo usando Handlebars
   */
  substitutePlaceholders(content: string, data: Record<string, any>): string {
    try {
      // Usa o TemplateEngineService para renderizar o conteúdo
      return this.templateEngine.renderTemplate(content, data);
    } catch (error) {
      this.logger.error(`Erro ao substituir placeholders: ${error.message}`);
      // Fallback para substituição simples se Handlebars falhar
      return this.simplePlaceholderSubstitution(content, data);
    }
  }

  /**
   * Substituição simples de placeholders (fallback)
   */
  private simplePlaceholderSubstitution(content: string, data: Record<string, any>): string {
    let processedContent = content;

    // Substitui cada placeholder pelos dados correspondentes
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });

    return processedContent;
  }

  /**
   * Valida um template Handlebars
   */
  validateTemplate(template: string): boolean {
    return this.templateEngine.validateTemplate(template);
  }

  /**
   * Lista todos os helpers disponíveis
   */
  getAvailableHelpers(): string[] {
    return this.templateEngine.getAvailableHelpers();
  }

  /**
   * Lista todos os partials disponíveis
   */
  getAvailablePartials(): string[] {
    return this.templateEngine.getAvailablePartials();
  }

  /**
   * Gera um exemplo de template com dados de teste
   */
  generateExampleTemplate(): { template: string; data: TemplateData } {
    const template = `
{{> header}}

<div class="content">
    {{> moradorInfo}}
    {{> condominioInfo}}
    {{> cobrancaInfo}}
    
    <div class="mb-20">
        <h2>Olá {{nome_morador}}!</h2>
        <p>Esta é uma cobrança referente ao mês de {{monthYear data_vencimento}}.</p>
        <p>Valor: {{currency valor}}</p>
        <p>Vencimento: {{dateFull data_vencimento}}</p>
        
        {{#if diasAtraso}}
        <div class="warning">
            <p>⚠️ Esta cobrança está em atraso há {{daysLate data_vencimento}} dias.</p>
            <p>Valor com multa: {{valueWithPenalty valor (daysLate data_vencimento)}}</p>
        </div>
        {{/if}}
    </div>
</div>

{{> footer}}`;

    const data: TemplateData = {
      nome_morador: 'João Silva',
      email: 'joao@email.com',
      telefone: '11999887766',
      bloco: 'A',
      apartamento: '101',
      nome_condominio: 'Residencial Exemplo',
      cnpj: '12345678000190',
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      valor: 500.00,
      data_vencimento: new Date('2024-02-15'),
      diasAtraso: 5
    };

    return { template, data };
  }
}
