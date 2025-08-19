import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { CobrancaRepository } from './cobranca.repository';
import { PrismaService } from '../prisma/prisma.service';
import { StatusEnvio } from '@prisma/client';
import { EmailConfigService } from '../email-config.service';
import { EmailTemplateService } from '../shared/services/email-template.service';
import { TemplateEngineService } from '../shared/services/template-engine.service';
import { CobrancaProcessor } from './cobranca.processor';
import * as nodemailer from 'nodemailer';

/**
 * Serviço responsável por gerenciar cobranças
 * Implementa arquitetura limpa com separação de responsabilidades
 */
@Injectable()
export class CobrancaService {
  constructor(
    private readonly repository: CobrancaRepository,
    private readonly prisma: PrismaService,
    private readonly emailConfigService: EmailConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly templateEngineService: TemplateEngineService,
    private readonly cobrancaProcessor: CobrancaProcessor,
  ) {}

  /**
   * Cria uma nova cobrança
   */
  async create(createCobrancaDto: CreateCobrancaDto) {
    console.log('=== CRIANDO NOVA COBRANÇA ===');
    console.log('Dados recebidos:', JSON.stringify(createCobrancaDto, null, 2));
    
    const result = await this.repository.create(createCobrancaDto);
    
    console.log('✅ Cobrança criada com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Busca todas as cobranças
   */
  async findAll() {
    console.log('=== BUSCANDO TODAS AS COBRANÇAS ===');
    const cobrancas = await this.repository.findAll();
    
    console.log(`✅ Encontradas ${cobrancas.length} cobranças`);
    return cobrancas;
  }

  /**
   * Busca uma cobrança específica por ID
   */
  async findOne(id: string) {
    console.log('=== BUSCANDO COBRANÇA POR ID ===');
    console.log('ID:', id);
    
    const cobranca = await this.repository.findOne(id);
    
    if (!cobranca) {
      console.log('❌ Cobrança não encontrada');
      throw new NotFoundException(`Cobrança com ID ${id} não encontrada.`);
    }
    
    console.log('✅ Cobrança encontrada:', JSON.stringify(cobranca, null, 2));
    return cobranca;
  }

  /**
   * Atualiza uma cobrança existente
   */
  async update(id: string, updateCobrancaDto: UpdateCobrancaDto) {
    console.log('=== ATUALIZANDO COBRANÇA ===');
    console.log('ID:', id);
    console.log('Dados recebidos:', JSON.stringify(updateCobrancaDto, null, 2));
    
    // Verifica se a cobrança existe
    await this.findOne(id);
    
    const result = await this.repository.update(id, updateCobrancaDto);
    
    console.log('✅ Cobrança atualizada com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Remove uma cobrança
   */
  async remove(id: string) {
    console.log('=== REMOVENDO COBRANÇA ===');
    console.log('ID:', id);
    
    // Verifica se a cobrança existe
    await this.findOne(id);
    
    const result = await this.repository.remove(id);
    
    console.log('✅ Cobrança removida com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Envia uma cobrança por email usando CID
   */
  async enviarCobranca(id: string) {
    console.log('=== ENVIANDO COBRANÇA POR EMAIL ===');
    console.log('ID da cobrança:', id);

    try {
      // Busca a cobrança com dados relacionados
      console.log('🔍 Buscando cobrança no banco de dados...');
      const cobranca = await this.prisma.cobranca.findUnique({
        where: { id },
        include: {
          morador: true,
          condominio: true,
          modeloCarta: true,
        },
      });

      if (!cobranca) {
        console.log('❌ Cobrança não encontrada no banco de dados');
        throw new NotFoundException(`Cobrança com ID ${id} não encontrada.`);
      }

      console.log('✅ Cobrança encontrada:', {
        id: cobranca.id,
        morador: cobranca.morador?.nome,
        email: cobranca.morador?.email,
        condominio: cobranca.condominio?.nome,
        modeloCarta: cobranca.modeloCarta?.titulo
      });

      // Verifica se tem configuração de email
      console.log('🔍 Verificando configuração de email...');
      const emailConfig = await this.emailConfigService.getConfig();
      if (!emailConfig) {
        console.log('❌ Configuração de email não encontrada');
        throw new Error('Configuração de email não encontrada. Configure o email primeiro.');
      }

      console.log('✅ Configuração de email encontrada:', {
        host: emailConfig.host,
        port: emailConfig.port,
        user: emailConfig.user,
        from: emailConfig.from
      });

      // Processa os dados para substituição de placeholders
      console.log('🔧 Processando dados da cobrança...');
      const dadosProcessados = this.cobrancaProcessor.processarDadosCobranca(cobranca);
      console.log('✅ Dados processados:', dadosProcessados);
      
      // Substitui placeholders no conteúdo
      console.log('🔧 Substituindo placeholders no conteúdo...');
      const conteudoProcessado = this.emailTemplateService.substitutePlaceholders(
        cobranca.modeloCarta.conteudo,
        dadosProcessados
      );
      console.log('✅ Conteúdo processado (primeiros 200 chars):', conteudoProcessado.substring(0, 200));

      // Processa o título com campos dinâmicos
      console.log('🔧 Processando título com campos dinâmicos...');
      const tituloProcessado = this.emailTemplateService.substitutePlaceholders(
        cobranca.modeloCarta.titulo,
        dadosProcessados
      );
      console.log('✅ Título processado:', tituloProcessado);

      // Gera template de email com CID
      console.log('🔧 Gerando template de email...');
      const emailTemplate = await this.emailTemplateService.generateEmailTemplate(
        conteudoProcessado,
        cobranca.modeloCarta.headerImageUrl || undefined,
        cobranca.modeloCarta.footerImageUrl || undefined
      );
      console.log('✅ Template gerado com sucesso');

      // Gera o HTML final com os dados processados
      const htmlFinal = this.templateEngineService.renderTemplate(emailTemplate.html, dadosProcessados);

      // Prepara lista de emails para envio
      const emailsParaEnviar = [cobranca.morador.email];
      
      // Adiciona emails adicionais se existirem
      if (cobranca.morador.emailsAdicionais) {
        const emailsAdicionais = cobranca.morador.emailsAdicionais
          .split(',')
          .map(email => email.trim())
          .filter(email => email && email.includes('@'));
        emailsParaEnviar.push(...emailsAdicionais);
      }
      
      console.log('📧 Enviando email para:', emailsParaEnviar);
      
      // Envia para todos os emails
      for (const email of emailsParaEnviar) {
        try {
          await this.enviarEmailComCid(
            email,
            tituloProcessado,
            emailTemplate
          );
          console.log(`✅ Email enviado com sucesso para: ${email}`);
        } catch (error) {
          console.error(`❌ Erro ao enviar email para ${email}:`, error);
        }
      }

      // Atualiza status de envio
      console.log('💾 Atualizando status de envio...');
      await this.prisma.cobranca.update({
        where: { id },
        data: { 
          statusEnvio: StatusEnvio.ENVIADO,
          dataEnvio: new Date()
        },
      });

      console.log('✅ Cobrança enviada com sucesso');
      return { success: true, message: 'Cobrança enviada com sucesso' };

    } catch (error) {
      console.error('❌ Erro ao enviar cobrança:', error);
      console.error('Stack trace:', error.stack);
      
      // Atualiza status para erro
      try {
        await this.prisma.cobranca.update({
          where: { id },
          data: { statusEnvio: StatusEnvio.ERRO },
        });
        console.log('✅ Status atualizado para ERRO');
      } catch (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
      }

      throw error;
    }
  }

  /**
   * Envia email usando CID
   */
  private async enviarEmailComCid(
    to: string,
    subject: string,
    emailTemplate: any
  ) {
    console.log('=== ENVIANDO EMAIL COM CID ===');
    console.log('Destinatário:', to);
    console.log('Assunto:', subject);
    console.log('Template recebido:', {
      hasHtml: !!emailTemplate.html,
      attachmentsCount: emailTemplate.attachments?.length || 0
    });

    try {
      const emailConfig = await this.emailConfigService.getConfig();
      
      if (!emailConfig) {
        console.log('❌ Configuração de email não encontrada');
        throw new Error('Configuração de email não encontrada');
      }

      console.log('✅ Configuração de email carregada:', {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.user,
        from: emailConfig.from
      });

      console.log('🔧 Criando transporter...');
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('🔍 Verificando conexão com servidor de email...');
      await transporter.verify();
      console.log('✅ Conexão verificada com sucesso');

      // Prepara anexos com CID
      console.log('🔧 Preparando anexos...');
      const attachments = emailTemplate.attachments.map((attachment: any) => ({
        filename: attachment.filename,
        path: attachment.path,
        contentType: attachment.contentType,
        cid: attachment.cid
      }));

      console.log('📎 Anexos preparados:', attachments.length);

      // Envia o email
      console.log('📧 Enviando email...');
      const result = await transporter.sendMail({
        from: emailConfig.from,
        to,
        subject,
        html: emailTemplate.html,
        attachments
      });

      console.log('✅ Email enviado com sucesso!');
      console.log('Message ID:', result.messageId);
      console.log(`✅ Email enviado para ${to} com ${attachments.length} anexos`);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        command: error.command
      });
      throw error;
    }
  }

  /**
   * Envia cobranças em massa
   */
  async enviarCobrancasEmMassa(ids: string[]) {
    console.log('=== ENVIANDO COBRANÇAS EM MASSA ===');
    console.log('IDs:', ids);

    const resultados: Array<{ id: string; success: boolean; message: string }> = [];

    for (const id of ids) {
      try {
        const resultado = await this.enviarCobranca(id);
        resultados.push({ id, success: true, message: resultado.message });
      } catch (error) {
        console.error(`❌ Erro ao enviar cobrança ${id}:`, error.message);
        resultados.push({ id, success: false, message: error.message });
      }
    }

    console.log(`✅ Processamento em massa concluído: ${resultados.length} cobranças`);
    return resultados;
  }

  /**
   * Busca cobranças por condomínio
   */
  async findByCondominio(condominioId: string) {
    console.log('=== BUSCANDO COBRANÇAS POR CONDOMÍNIO ===');
    console.log('ID do condomínio:', condominioId);
    
    const cobrancas = await this.repository.findByCondominio(condominioId);
    
    console.log(`✅ Encontradas ${cobrancas.length} cobranças para o condomínio`);
    return cobrancas;
  }

  /**
   * Busca cobranças por morador
   */
  async findByMorador(moradorId: string) {
    console.log('=== BUSCANDO COBRANÇAS POR MORADOR ===');
    console.log('ID do morador:', moradorId);
    
    const cobrancas = await this.repository.findByMorador(moradorId);
    
    console.log(`✅ Encontradas ${cobrancas.length} cobranças para o morador`);
    return cobrancas;
  }

  /**
   * Busca cobranças em inadimplência
   */
  async getInadimplencia(condominioId?: string) {
    console.log('=== BUSCANDO COBRANÇAS EM INADIMPLÊNCIA ===');
    
    const where: any = { status: 'ATRASADO' };
    if (condominioId) where.condominioId = condominioId;
    
    const cobrancas = await this.prisma.cobranca.findMany({
      where,
      include: {
        morador: {
          select: { id: true, nome: true, bloco: true, apartamento: true, condominio: { select: { nome: true } } },
        },
        condominio: { select: { nome: true } },
      },
    });

    // Mapeia para o formato esperado pelo frontend
    return cobrancas.map((c) => {
      // Calcula dias em atraso
      const hoje = new Date();
      const venc = new Date(c.vencimento);
      const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        id: c.id,
        morador: c.morador?.nome || '',
        unidade: `${c.morador?.bloco || ''}-${c.morador?.apartamento || ''}`,
        condominio: c.condominio?.nome || '',
        valor: c.valor,
        diasAtraso,
        vencimento: c.vencimento,
      };
    });
  }

  /**
   * Busca histórico de cobranças
   */
  async getHistoricoCobrancas(condominioId?: string, moradorId?: string) {
    console.log('=== BUSCANDO HISTÓRICO DE COBRANÇAS ===');
    
    const where: any = {};
    if (condominioId) where.condominioId = condominioId;
    if (moradorId) where.moradorId = moradorId;
    
    const cobrancas = await this.prisma.cobranca.findMany({
      where,
      include: {
        morador: { select: { nome: true } },
        condominio: { select: { nome: true } },
      },
      orderBy: { dataEnvio: 'desc' },
    });
    
    return cobrancas.map((c) => ({
      id: c.id,
      morador: c.morador?.nome || '',
      condominio: c.condominio?.nome || '',
      valor: c.valor,
      dataEnvio: c.dataEnvio,
      status: c.status,
      statusEnvio: c.statusEnvio,
      vencimento: c.vencimento,
    }));
  }
}
