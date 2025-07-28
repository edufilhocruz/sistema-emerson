import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as nodemailer from 'nodemailer';
// import { EmailConfigDto } from './email-config.controller'; // Removido

@Injectable()
export class EmailConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig() {
    // Busca a configuração mais recente
    return this.prisma.emailConfig.findFirst({ orderBy: { updatedAt: 'desc' } });
  }

  async saveConfig(data: any) {
    // Salva nova configuração (pode ser update ou create)
    const existing = await this.getConfig();
    if (existing) {
      return this.prisma.emailConfig.update({ where: { id: existing.id }, data });
    }
    return this.prisma.emailConfig.create({ data });
  }

  async sendMail({ to, subject, text, html }: { to: string, subject: string, text?: string, html?: string }) {
    const config = await this.getConfig();
    if (!config) {
      console.error('Configuração de e-mail não encontrada');
      return { success: false, error: 'Configuração de e-mail não encontrada' };
    }
    
    try {
      console.log('Criando transporter com configuração:', { host: config.host, port: config.port, secure: config.secure, user: config.user });
      
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.pass },
      });
      
      console.log('Verificando conexão...');
      // Verifica a conexão antes de tentar enviar
      await transporter.verify();
      console.log('Conexão verificada com sucesso');
      
      console.log('Enviando email...');
      const result = await transporter.sendMail({
        from: config.from,
        to,
        subject,
        text,
        html,
      });
      
      console.log('Email enviado com sucesso:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Erro no serviço de email:', error.message);
      return { success: false, error: error.message };
    }
  }
} 