import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { CobrancaRepository } from './cobranca.repository';
import { PrismaService } from '../prisma/prisma.service';
import { StatusEnvio } from '@prisma/client';
import { EmailConfigService } from '../email-config.service';

@Injectable()
export class CobrancaService {
  constructor(
    private readonly repository: CobrancaRepository,
    private readonly prisma: PrismaService,
    private readonly emailConfigService: EmailConfigService,
  ) {}

  async create(createCobrancaDto: CreateCobrancaDto) {
    try {
      // Valida se as entidades relacionadas existem, usando os IDs dinâmicos do DTO
      const { moradorId, condominioId, modeloCartaId } = createCobrancaDto;

      console.log('=== INICIANDO CRIAÇÃO DE COBRANÇA ===');
      console.log('DTO recebido:', JSON.stringify(createCobrancaDto, null, 2));

      // Consulta separada para debug
      console.log('=== CONSULTAS DO BANCO ===');
      console.log('MoradorId:', moradorId);
      console.log('CondominioId:', condominioId);
      console.log('ModeloCartaId:', modeloCartaId);

      const morador = await this.prisma.morador.findUnique({ 
        where: { id: moradorId },
        include: { 
          condominio: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              logradouro: true,
              numero: true,
              bairro: true,
              cidade: true,
              estado: true
            }
          }
        }
      });
      
      console.log('Morador encontrado:', morador ? 'SIM' : 'NÃO');
      if (morador) {
        console.log('Morador dados:', {
          id: morador.id,
          nome: morador.nome,
          bloco: morador.bloco,
          apartamento: morador.apartamento,
          condominio: morador.condominio
        });
        console.log('Morador.bloco (tipo):', typeof morador.bloco, 'valor:', morador.bloco);
        console.log('Morador.apartamento (tipo):', typeof morador.apartamento, 'valor:', morador.apartamento);
      }

      const condominio = await this.prisma.condominio.findUnique({ 
        where: { id: condominioId },
        select: {
          id: true,
          nome: true,
          cnpj: true,
          logradouro: true,
          numero: true,
          bairro: true,
          cidade: true,
          estado: true
        }
      });
      
      console.log('Condomínio encontrado:', condominio ? 'SIM' : 'NÃO');
      if (condominio) {
        console.log('Condomínio dados:', {
          id: condominio.id,
          nome: condominio.nome,
          logradouro: condominio.logradouro,
          numero: condominio.numero,
          bairro: condominio.bairro
        });
      }

      const modeloCarta = await this.prisma.modeloCarta.findUnique({ 
        where: { id: modeloCartaId } 
      });
      
      console.log('Modelo Carta encontrado:', modeloCarta ? 'SIM' : 'NÃO');
      if (modeloCarta) {
        console.log('Modelo Carta dados:', {
          id: modeloCarta.id,
          titulo: modeloCarta.titulo,
          conteudo: modeloCarta.conteudo.substring(0, 100) + '...'
        });
      }

    if (!morador) throw new NotFoundException(`Morador com ID ${moradorId} não encontrado.`);
    if (!condominio) throw new NotFoundException(`Condomínio com ID ${condominioId} não encontrado.`);
    if (!modeloCarta) throw new NotFoundException(`Modelo de Carta com ID ${modeloCartaId} não encontrado.`);

    // Log detalhado dos dados carregados
    console.log('=== DADOS CARREGADOS ===');
    console.log('Morador:', JSON.stringify(morador, null, 2));
    console.log('Condomínio:', JSON.stringify(condominio, null, 2));
    console.log('Modelo Carta:', JSON.stringify(modeloCarta, null, 2));
    
    // Verificar campos específicos
    console.log('=== VERIFICAÇÃO DE CAMPOS ===');
    console.log('Morador.apartamento:', morador?.apartamento);
    console.log('Morador.bloco:', morador?.bloco);
    console.log('Condomínio.nome:', condominio?.nome);
    console.log('Condomínio.logradouro:', condominio?.logradouro);
    console.log('Condomínio.numero:', condominio?.numero);
    console.log('Condomínio.bairro:', condominio?.bairro);

    // Se não vier valor, usa o valor do aluguel do morador
    let valor = createCobrancaDto.valor;
    if (valor === undefined || valor === null) {
      if (morador.valorAluguel === undefined || morador.valorAluguel === null) {
        throw new NotFoundException('O valor do aluguel do morador não está cadastrado.');
      }
      valor = morador.valorAluguel;
    }

    // Cria a cobrança com status inicial de NAO_ENVIADO
    const cobranca = await this.repository.create({ ...createCobrancaDto, valor, statusEnvio: StatusEnvio.NAO_ENVIADO });

    // Substitui os placeholders do modelo de carta
    const mesReferencia = (() => {
      const hoje = new Date();
      return `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    })();
    
    // Preparar dados para substituição
    const dadosSubstituicao = {
      // Campos do morador
      '{{nome_morador}}': morador?.nome || '',
      '{{nome}}': morador?.nome || '',
      '{{email}}': morador?.email || '',
      '{{telefone}}': morador?.telefone || '',
      '{{bloco}}': morador?.bloco || '',
      '{{apartamento}}': morador?.apartamento || '',
      '{{unidade}}': `${morador?.bloco || ''}-${morador?.apartamento || ''}`,
      
      // Campos do condomínio
      '{{nome_condominio}}': condominio?.nome || '',
      '{{condominio}}': condominio?.nome || '',
      '{{cnpj}}': condominio?.cnpj || '',
      '{{cidade}}': condominio?.cidade || '',
      '{{estado}}': condominio?.estado || '',
      '{{endereco}}': `${condominio?.logradouro || ''}, ${condominio?.numero || ''} - ${condominio?.bairro || ''}`,
      '{{endereco_condominio}}': `${condominio?.logradouro || ''}, ${condominio?.numero || ''} - ${condominio?.bairro || ''}`,
      
      // Campos da cobrança
      '{{valor}}': valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      '{{valor_formatado}}': valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      '{{mes_referencia}}': mesReferencia,
      '{{data_vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
      '{{vencimento}}': new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
      
      // Data atual
      '{{data_atual}}': new Date().toLocaleDateString('pt-BR'),
      '{{hoje}}': new Date().toLocaleDateString('pt-BR')
    };

    // Substituir todos os campos dinâmicos no conteúdo
    let conteudo = modeloCarta.conteudo;
    let titulo = modeloCarta.titulo;
    
    console.log('=== SUBSTITUIÇÃO DE CAMPOS ===');
    console.log('Título original:', titulo);
    console.log('Conteúdo original:', conteudo);
    console.log('Dados para substituição:', JSON.stringify(dadosSubstituicao, null, 2));
    
    // Verificar se os placeholders estão no conteúdo
    console.log('=== VERIFICAÇÃO DE PLACEHOLDERS ===');
    const placeholdersEncontrados = [];
    Object.keys(dadosSubstituicao).forEach(placeholder => {
      if (conteudo.includes(placeholder)) {
        placeholdersEncontrados.push(placeholder);
        console.log(`✅ Placeholder encontrado no conteúdo: ${placeholder}`);
      } else {
        console.log(`❌ Placeholder NÃO encontrado no conteúdo: ${placeholder}`);
      }
    });
    console.log('Placeholders encontrados:', placeholdersEncontrados);
    
    let substituicoesRealizadas = 0;
    Object.entries(dadosSubstituicao).forEach(([placeholder, valor]) => {
      console.log(`\n--- Processando: ${placeholder} ---`);
      console.log(`Valor para substituir: "${valor}"`);
      
      // Escapar caracteres especiais da expressão regular
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPlaceholder, 'gi');
      
      console.log(`Regex criado: ${regex}`);
      console.log(`Placeholder original: "${placeholder}"`);
      console.log(`Placeholder escapado: "${escapedPlaceholder}"`);
      
      // Substituir no título
      const tituloAntes = titulo;
      titulo = titulo.replace(regex, valor);
      if (tituloAntes !== titulo) {
        console.log(`✅ Substituído no TÍTULO: ${placeholder} -> "${valor}"`);
        substituicoesRealizadas++;
      } else {
        console.log(`❌ NÃO encontrado no TÍTULO: ${placeholder} (valor: "${valor}")`);
        console.log(`Título atual: "${titulo}"`);
      }
      
      // Substituir no conteúdo
      const conteudoAntes = conteudo;
      conteudo = conteudo.replace(regex, valor);
      if (conteudoAntes !== conteudo) {
        console.log(`✅ Substituído no CONTEÚDO: ${placeholder} -> "${valor}"`);
        substituicoesRealizadas++;
      } else {
        console.log(`❌ NÃO encontrado no CONTEÚDO: ${placeholder} (valor: "${valor}")`);
        // Verificar se o placeholder existe no conteúdo
        const index = conteudo.indexOf(placeholder);
        if (index !== -1) {
          console.log(`⚠️ Placeholder encontrado no índice ${index}, mas não foi substituído`);
          console.log(`Contexto: "${conteudo.substring(Math.max(0, index-10), index+placeholder.length+10)}"`);
        }
      }
    });
    
    console.log(`Total de substituições realizadas: ${substituicoesRealizadas}`);
    console.log('Título final:', titulo);
    console.log('Conteúdo final:', conteudo);

    // Log para debug
    console.log('Conteúdo original:', modeloCarta.conteudo);
    console.log('Conteúdo processado:', conteudo);
    console.log('Dados do morador:', { nome: morador.nome, bloco: morador.bloco, apartamento: morador.apartamento });
    console.log('Dados do condomínio:', { nome: condominio.nome, endereco: `${condominio.logradouro}, ${condominio.numero} - ${condominio.bairro}` });

    // Tenta enviar o email
    const emailResult = await this.emailConfigService.sendMail({
      to: morador.email,
      subject: titulo, // Usar o título processado com campos dinâmicos
      text: conteudo,
    });
    
    if (emailResult.success) {
      console.log(`Email enviado com sucesso para: ${morador.email}`);
      // Atualiza o status da cobrança para ENVIADO
      await this.repository.update(cobranca.id, { statusEnvio: StatusEnvio.ENVIADO });
    } else {
      console.error(`Erro ao enviar email para ${morador.email}:`, emailResult.error);
      // Atualiza o status da cobrança para ERRO
      await this.repository.update(cobranca.id, { statusEnvio: StatusEnvio.ERRO });
    }

    return cobranca;
    } catch (error) {
      console.error('=== ERRO NA CRIAÇÃO DE COBRANÇA ===');
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      throw error; // Re-throw para o controller tratar
    }
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const cobranca = await this.repository.findOne(id);
    if (!cobranca) {
      throw new NotFoundException(`Cobrança com ID ${id} não encontrada.`);
    }
    return cobranca;
  }

  async update(id: string, updateCobrancaDto: UpdateCobrancaDto) {
    await this.findOne(id); // Garante que a cobrança existe
    return this.repository.update(id, updateCobrancaDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Garante que a cobrança existe
    return this.repository.remove(id);
  }

  async getInadimplencia(condominioId?: string) {
    // Busca todas as cobranças com status ATRASADO e, se fornecido, do condomínio filtrado
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

  async getHistoricoCobrancas(condominioId?: string, moradorId?: string) {
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
