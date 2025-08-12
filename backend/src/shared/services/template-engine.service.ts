import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';

/**
 * Interface para dados de template
 */
export interface TemplateData {
  [key: string]: any;
}

/**
 * Interface para configuração de template
 */
export interface TemplateConfig {
  headerImageUrl?: string;
  footerImageUrl?: string;
  theme?: 'default' | 'professional' | 'modern';
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
}

/**
 * Serviço responsável por gerar templates HTML usando Handlebars
 * Implementa arquitetura limpa com sistema de templates robusto
 */
@Injectable()
export class TemplateEngineService {
  private readonly logger = new Logger(TemplateEngineService.name);
  private readonly handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
    this.registerPartials();
  }

  /**
   * Registra helpers customizados para formatação
   */
  private registerHelpers(): void {
    // Helper para formatação de moeda
    this.handlebars.registerHelper('currency', function(value: number, options: any) {
      if (!value) return 'Valor não informado';
      return value.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      });
    });

    // Helper para formatação de data
    this.handlebars.registerHelper('date', function(value: string | Date, options: any) {
      if (!value) return 'Data não informada';
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    });

    // Helper para formatação de data completa
    this.handlebars.registerHelper('dateFull', function(value: string | Date, options: any) {
      if (!value) return 'Data não informada';
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    });

    // Helper para formatação de telefone
    this.handlebars.registerHelper('phone', function(value: string, options: any) {
      if (!value) return 'Telefone não informado';
      // Remove caracteres não numéricos
      const numbers = value.replace(/\D/g, '');
      if (numbers.length === 11) {
        return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7)}`;
      }
      return value;
    });

    // Helper para formatação de CNPJ
    this.handlebars.registerHelper('cnpj', function(value: string, options: any) {
      if (!value) return 'CNPJ não informado';
      const numbers = value.replace(/\D/g, '');
      if (numbers.length === 14) {
        return `${numbers.slice(0,2)}.${numbers.slice(2,5)}.${numbers.slice(5,8)}/${numbers.slice(8,12)}-${numbers.slice(12)}`;
      }
      return value;
    });

    // Helper para formatação de CEP
    this.handlebars.registerHelper('cep', function(value: string, options: any) {
      if (!value) return 'CEP não informado';
      const numbers = value.replace(/\D/g, '');
      if (numbers.length === 8) {
        return `${numbers.slice(0,5)}-${numbers.slice(5)}`;
      }
      return value;
    });

    // Helper para formatação de CPF
    this.handlebars.registerHelper('cpf', function(value: string, options: any) {
      if (!value) return 'CPF não informado';
      const numbers = value.replace(/\D/g, '');
      if (numbers.length === 11) {
        return `${numbers.slice(0,3)}.${numbers.slice(3,6)}.${numbers.slice(6,9)}-${numbers.slice(9)}`;
      }
      return value;
    });

    // Helper para formatação de texto (primeira letra maiúscula)
    this.handlebars.registerHelper('capitalize', function(value: string, options: any) {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    });

    // Helper para formatação de texto (todas as palavras capitalizadas)
    this.handlebars.registerHelper('titleCase', function(value: string, options: any) {
      if (!value) return '';
      return value.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    });

    // Helper para formatação de número
    this.handlebars.registerHelper('number', function(value: number, options: any) {
      if (!value) return '0';
      return value.toLocaleString('pt-BR');
    });

    // Helper para formatação de porcentagem
    this.handlebars.registerHelper('percentage', function(value: number, options: any) {
      if (!value) return '0%';
      return `${value.toFixed(2)}%`;
    });

    // Helper para formatação de endereço completo
    this.handlebars.registerHelper('fullAddress', function(logradouro: string, numero: string, bairro: string, cidade: string, estado: string, options: any) {
      const parts = [logradouro, numero, bairro, cidade, estado].filter(Boolean);
      return parts.join(', ');
    });

    // Helper para formatação de unidade (bloco-apartamento)
    this.handlebars.registerHelper('unit', function(bloco: string, apartamento: string, options: any) {
      if (!bloco && !apartamento) return 'Unidade não informada';
      return `${bloco || ''}-${apartamento || ''}`.replace(/^-|-$/g, '');
    });

    // Helper para formatação de mês/ano
    this.handlebars.registerHelper('monthYear', function(value: string | Date, options: any) {
      if (!value) return 'Mês/ano não informado';
      const date = new Date(value);
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    });

    // Helper para formatação de dias em atraso
    this.handlebars.registerHelper('daysLate', function(vencimento: string | Date, options: any) {
      if (!vencimento) return '0';
      const hoje = new Date();
      const venc = new Date(vencimento);
      const dias = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
      return dias.toString();
    });

    // Helper para formatação de valor com multa
    this.handlebars.registerHelper('valueWithPenalty', function(valor: number, diasAtraso: number, options: any) {
      if (!valor) return 'Valor não informado';
      const multa = diasAtraso > 0 ? valor * 0.02 : 0; // 2% de multa por dia
      const total = valor + multa;
      return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    });

    this.logger.log('✅ Helpers customizados registrados com sucesso');
  }

  /**
   * Registra partials para reutilização de componentes
   */
  private registerPartials(): void {
    // Partial para cabeçalho padrão
    this.handlebars.registerPartial('header', `
      <div style="background-color: {{#if colors.primary}}{{colors.primary}}{{else}}#2563eb{{/if}}; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">{{#if nome_condominio}}{{nome_condominio}}{{else}}Sistema Raunaimer{{/if}}</h1>
        {{#if headerImageUrl}}
        <div style="margin-top: 15px;">
          <img src="cid:header_image" alt="Cabeçalho" style="max-width: 100%; height: auto; max-height: 150px;">
        </div>
        {{/if}}
      </div>
    `);

    // Partial para rodapé padrão
    this.handlebars.registerPartial('footer', `
      <div style="background-color: {{#if colors.secondary}}{{colors.secondary}}{{else}}#f8f9fa{{/if}}; padding: 20px; text-align: center; margin-top: 30px;">
        {{#if footerImageUrl}}
        <div style="margin-bottom: 15px;">
          <img src="cid:footer_image" alt="Rodapé" style="max-width: 100%; height: auto; max-height: 100px;">
        </div>
        {{/if}}
        <p style="margin: 0; color: #666; font-size: 12px;">Esta é uma cobrança automática do sistema Raunaimer.</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Para dúvidas, entre em contato conosco.</p>
      </div>
    `);

    // Partial para informações do morador
    this.handlebars.registerPartial('moradorInfo', `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Informações do Morador</h3>
        <p style="margin: 5px 0;"><strong>Nome:</strong> {{nome_morador}}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
        <p style="margin: 5px 0;"><strong>Telefone:</strong> {{phone telefone}}</p>
        <p style="margin: 5px 0;"><strong>Unidade:</strong> {{unit bloco apartamento}}</p>
      </div>
    `);

    // Partial para informações do condomínio
    this.handlebars.registerPartial('condominioInfo', `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Informações do Condomínio</h3>
        <p style="margin: 5px 0;"><strong>Nome:</strong> {{nome_condominio}}</p>
        <p style="margin: 5px 0;"><strong>CNPJ:</strong> {{cnpj cnpj}}</p>
        <p style="margin: 5px 0;"><strong>Endereço:</strong> {{fullAddress logradouro numero bairro cidade estado}}</p>
      </div>
    `);

    // Partial para informações da cobrança
    this.handlebars.registerPartial('cobrancaInfo', `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Informações da Cobrança</h3>
        <p style="margin: 5px 0;"><strong>Valor:</strong> {{currency valor}}</p>
        <p style="margin: 5px 0;"><strong>Vencimento:</strong> {{dateFull data_vencimento}}</p>
        <p style="margin: 5px 0;"><strong>Mês/Ano:</strong> {{monthYear data_vencimento}}</p>
        {{#if diasAtraso}}
        <p style="margin: 5px 0; color: #dc2626;"><strong>Dias em Atraso:</strong> {{daysLate data_vencimento}}</p>
        <p style="margin: 5px 0; color: #dc2626;"><strong>Valor com Multa:</strong> {{valueWithPenalty valor (daysLate data_vencimento)}}</p>
        {{/if}}
      </div>
    `);

    this.logger.log('✅ Partials registrados com sucesso');
  }

  /**
   * Compila um template Handlebars
   */
  compileTemplate(template: string): HandlebarsTemplateDelegate {
    try {
      return this.handlebars.compile(template);
    } catch (error) {
      this.logger.error(`Erro ao compilar template: ${error.message}`);
      throw new Error(`Erro ao compilar template: ${error.message}`);
    }
  }

  /**
   * Renderiza um template com dados
   */
  renderTemplate(template: string, data: TemplateData): string {
    try {
      const compiledTemplate = this.compileTemplate(template);
      return compiledTemplate(data);
    } catch (error) {
      this.logger.error(`Erro ao renderizar template: ${error.message}`);
      throw new Error(`Erro ao renderizar template: ${error.message}`);
    }
  }

  /**
   * Gera um template de email completo com Handlebars
   */
  generateEmailTemplate(
    content: string,
    data: TemplateData,
    config: TemplateConfig = {}
  ): string {
    try {
      this.logger.log('Gerando template de email com Handlebars');

      // Template base com Handlebars
      const emailTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cobrança - {{nome_condominio}}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: {{#if colors.text}}{{colors.text}}{{else}}#333{{/if}};
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: {{#if colors.background}}{{colors.background}}{{else}}#f4f4f4{{/if}};
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .content {
            padding: 30px;
        }
        .info-section {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .info-section h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
        }
        .info-section p {
            margin: 5px 0;
            font-size: 14px;
        }
        .highlight {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .warning {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: {{#if colors.primary}}{{colors.primary}}{{else}}#2563eb{{/if}};
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 5px;
        }
        .btn:hover {
            opacity: 0.9;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-left {
            text-align: left;
        }
        .mb-20 {
            margin-bottom: 20px;
        }
        .mt-20 {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        {{> header}}
        
        <div class="content">
            {{#if showMoradorInfo}}
            {{> moradorInfo}}
            {{/if}}
            
            {{#if showCondominioInfo}}
            {{> condominioInfo}}
            {{/if}}
            
            {{#if showCobrancaInfo}}
            {{> cobrancaInfo}}
            {{/if}}
            
            <div class="mb-20">
                {{{content}}}
            </div>
            
            {{#if diasAtraso}}
            <div class="warning">
                <h4 style="margin: 0 0 10px 0;">⚠️ Cobrança em Atraso</h4>
                <p style="margin: 5px 0;">Esta cobrança está em atraso há <strong>{{daysLate data_vencimento}} dias</strong>.</p>
                <p style="margin: 5px 0;">Valor com multa: <strong>{{valueWithPenalty valor (daysLate data_vencimento)}}</strong></p>
            </div>
            {{/if}}
            
            {{#if valor}}
            <div class="highlight text-center">
                <h3 style="margin: 0 0 10px 0;">💰 Valor da Cobrança</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 0; color: #2563eb;">
                    {{currency valor}}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                    Vencimento: {{dateFull data_vencimento}}
                </p>
            </div>
            {{/if}}
        </div>
        
        {{> footer}}
    </div>
</body>
</html>`;

      // Renderiza o template com os dados
      return this.renderTemplate(emailTemplate, {
        ...data,
        content,
        showMoradorInfo: true,
        showCondominioInfo: true,
        showCobrancaInfo: true,
        ...config
      });

    } catch (error) {
      this.logger.error(`Erro ao gerar template de email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Valida se um template é válido
   */
  validateTemplate(template: string): boolean {
    try {
      this.compileTemplate(template);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lista todos os helpers disponíveis
   */
  getAvailableHelpers(): string[] {
    return [
      'currency', 'date', 'dateFull', 'phone', 'cnpj', 'cep', 'cpf',
      'capitalize', 'titleCase', 'number', 'percentage', 'fullAddress',
      'unit', 'monthYear', 'daysLate', 'valueWithPenalty'
    ];
  }

  /**
   * Lista todos os partials disponíveis
   */
  getAvailablePartials(): string[] {
    return ['header', 'footer', 'moradorInfo', 'condominioInfo', 'cobrancaInfo'];
  }
}
