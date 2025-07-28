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
    if (!config) throw new Error('Configuração de e-mail não encontrada');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
    return transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html,
    });
  }
} 