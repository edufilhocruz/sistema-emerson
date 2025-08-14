import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EmailTemplateService } from '../services/email-template.service';
import { TemplateEngineService, TemplateData, TemplateConfig } from '../services/template-engine.service';

/**
 * Controller para demonstração e teste de templates
 */
@Controller('template-demo')
export class TemplateDemoController {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly templateEngine: TemplateEngineService
  ) {}

  /**
   * Gera um exemplo de template com dados de teste
   */
  @Get('example')
  getExampleTemplate() {
    const { template, data } = this.emailTemplateService.generateExampleTemplate();
    
    return {
      template,
      data,
      description: 'Exemplo de template com dados de teste para demonstração'
    };
  }

  /**
   * Testa a renderização de um template customizado
   */
  @Post('test')
  testTemplate(@Body() body: { template: string; data: TemplateData; config?: TemplateConfig }) {
    try {
      const { template, data, config } = body;
      
      // Valida o template
      if (!this.templateEngine.validateTemplate(template)) {
        return {
          success: false,
          error: 'Template inválido'
        };
      }

      // Renderiza o template
      const result = this.templateEngine.renderTemplate(template, data);
      
      return {
        success: true,
        result,
        template,
        data,
        config
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera um email completo com template e CID
   */
  @Post('email')
  async generateEmail(@Body() body: {
    content: string;
    data: TemplateData;
    config?: TemplateConfig;
    headerImageUrl?: string;
    footerImageUrl?: string;
  }) {
    try {
      const { content, data, config, headerImageUrl, footerImageUrl } = body;
      
      const emailTemplate = await this.emailTemplateService.generateEmailTemplate(
        content,
        headerImageUrl,
        footerImageUrl,
        data,
        config
      );
      
      return {
        success: true,
        html: emailTemplate.html,
        attachments: emailTemplate.attachments.map(att => ({
          cid: att.cid,
          filename: att.filename,
          path: att.path
        })),
        data,
        config
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Documentação completa do sistema de templates
   */
  @Get('docs')
  getDocumentation() {
    return {
      title: 'Sistema de Templates com Handlebars + CID',
      description: 'Documentação completa do sistema de templates para emails',
      
      features: [
        'Sistema de templates robusto com Handlebars',
        'Helpers customizados para formatação',
        'Partials reutilizáveis',
        'Sistema CID para imagens em emails',
        'Validação de templates',
        'Fallback para substituição simples',
        'Configuração de temas e cores'
      ],
      
      helpers: this.templateEngine.getAvailableHelpers().map(helper => ({
        name: helper,
        description: this.getHelperDescription(helper)
      })),
      
      partials: this.templateEngine.getAvailablePartials().map(partial => ({
        name: partial,
        description: this.getPartialDescription(partial)
      })),
      
      examples: {
        basic: '{{nome_morador}}',
        currency: '{{currency valor}}',
        date: '{{dateFull data_vencimento}}',
        phone: '{{phone telefone}}',
        conditional: '{{#if diasAtraso}}Em atraso{{else}}No prazo{{/if}}',
        partial: '{{> moradorInfo}}'
      },
      
      usage: {
        step1: 'Crie um template usando a sintaxe Handlebars',
        step2: 'Use helpers para formatação: {{currency valor}}',
        step3: 'Use partials para componentes: {{> header}}',
        step4: 'Configure cores e temas no config',
        step5: 'Renderize com dados dinâmicos'
      }
    };
  }

  /**
   * Obtém descrição de um helper
   */
  private getHelperDescription(helper: string): string {
    const descriptions: { [key: string]: string } = {
      currency: 'Formata valor como moeda brasileira (R$)',
      date: 'Formata data no formato brasileiro',
      dateFull: 'Formata data completa (dd/mm/aaaa)',
      phone: 'Formata telefone no formato brasileiro',
      cnpj: 'Formata CNPJ com pontos e traços',
      cep: 'Formata CEP com traço',
      cpf: 'Formata CPF com pontos e traço',
      capitalize: 'Primeira letra maiúscula',
      titleCase: 'Todas as palavras capitalizadas',
      number: 'Formata número com separadores',
      percentage: 'Formata porcentagem',
      fullAddress: 'Monta endereço completo',
      unit: 'Formata unidade (bloco-apartamento)',
      monthYear: 'Formata mês/ano',
      daysLate: 'Calcula dias em atraso',
      valueWithPenalty: 'Calcula valor com multa',
      default: 'Helper padrão'
    };
    
    return descriptions[helper] || descriptions.default;
  }

  /**
   * Obtém descrição de um partial
   */
  private getPartialDescription(partial: string): string {
    const descriptions: { [key: string]: string } = {
      header: 'Cabeçalho do email com logo e informações',
      footer: 'Rodapé do email com contatos e links',
      moradorInfo: 'Informações do morador (nome, email, telefone)',
      condominioInfo: 'Informações do condomínio (nome, endereço, CNPJ)',
      cobrancaInfo: 'Informações da cobrança (valor, vencimento, multa)',
      default: 'Partial padrão'
    };
    
    return descriptions[partial] || descriptions.default;
  }

  /**
   * Testa a validação de imagens
   */
  @Get('validate-images')
  async validateImages(@Query('headerImageUrl') headerImageUrl?: string, @Query('footerImageUrl') footerImageUrl?: string) {
    try {
      const results = {
        header: headerImageUrl ? await this.emailTemplateService.validateImage(headerImageUrl) : null,
        footer: footerImageUrl ? await this.emailTemplateService.validateImage(footerImageUrl) : null
      };

      return {
        success: true,
        results,
        message: 'Validação de imagens concluída'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém informações de uma imagem
   */
  @Get('image-info')
  async getImageInfo(@Query('imageUrl') imageUrl: string) {
    try {
      const info = await this.emailTemplateService.getImageInfo(imageUrl);
      
      return {
        success: true,
        info,
        message: 'Informações da imagem obtidas'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
