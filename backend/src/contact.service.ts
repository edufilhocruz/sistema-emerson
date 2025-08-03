import { Injectable } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly emailConfigService: EmailConfigService) {}

  async sendContactEmail(contactData: ContactDto) {
    try {
      const { 
        from_name, 
        from_email, 
        phone, 
        contact_type, 
        company, 
        units, 
        message,
        source,
        timestamp,
        userAgent,
        referrer
      } = contactData;

      // Validação básica
      if (!from_name || !from_email || !phone) {
        return {
          success: false,
          error: 'Nome, email e telefone são obrigatórios'
        };
      }

      // Configurar email HTML
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d; border-bottom: 2px solid #d69e2e; padding-bottom: 10px;">
            Novo Contato - Raunaimer Monfre Advocacia
          </h2>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">Informações do Cliente:</h3>
            
            <p><strong style="color: #4a5568;">Nome:</strong> ${from_name}</p>
            <p><strong style="color: #4a5568;">Email:</strong> ${from_email}</p>
            <p><strong style="color: #4a5568;">Telefone:</strong> ${phone}</p>
            <p><strong style="color: #4a5568;">Tipo de Contato:</strong> ${contact_type || 'Não informado'}</p>
            <p><strong style="color: #4a5568;">Empresa:</strong> ${company || 'Não informado'}</p>
            <p><strong style="color: #4a5568;">Unidades:</strong> ${units || 'Não informado'}</p>
          </div>
          
          <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #d69e2e;">
            <h3 style="color: #2d3748; margin-top: 0;">Mensagem:</h3>
            <p style="color: #4a5568; line-height: 1.6;">${message || 'Nenhuma mensagem fornecida'}</p>
          </div>
          
          <div style="background-color: #f0fff4; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #718096;">
            <p><strong>Origem:</strong> ${source || 'landing-page'}</p>
            <p><strong>Data/Hora:</strong> ${timestamp || new Date().toISOString()}</p>
            <p><strong>Referrer:</strong> ${referrer || 'Direto'}</p>
            <p><strong>User Agent:</strong> ${userAgent || 'Não informado'}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096;">
            <p>Este email foi enviado através do formulário de contato do site raunaimer.adv.br</p>
          </div>
        </div>
      `;

      // Enviar email usando o serviço existente
      const result = await this.emailConfigService.sendMail({
        to: 'contato@raunaimer.adv.br',
        subject: `Novo Contato - ${from_name} - Raunaimer Monfre Advocacia`,
        html: htmlContent
      });

      if (result.success) {
        console.log('Email de contato enviado com sucesso:', result.messageId);
        return {
          success: true,
          message: 'Email enviado com sucesso!',
          messageId: result.messageId
        };
      } else {
        console.error('Erro ao enviar email de contato:', result.error);
        return {
          success: false,
          error: 'Erro ao enviar email',
          details: result.error
        };
      }

    } catch (error) {
      console.error('Erro no serviço de contato:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      };
    }
  }
} 