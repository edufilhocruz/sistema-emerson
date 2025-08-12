import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateModeloCartaDto } from './dto/create-modelo-carta.dto';
import { UpdateModeloCartaDto } from './dto/update-modelo-carta.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FileManagerService } from '../shared/services/file-manager.service';

/**
 * Serviço responsável por gerenciar modelos de carta
 * Implementa arquitetura limpa com separação de responsabilidades
 */
@Injectable()
export class ModeloCartaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileManager: FileManagerService
  ) {}

  /**
   * Cria um novo modelo de carta
   */
  async create(createModeloCartaDto: CreateModeloCartaDto) {
    console.log('=== CRIANDO NOVO MODELO DE CARTA ===');
    console.log('Dados recebidos:', JSON.stringify(createModeloCartaDto, null, 2));
    
    // Valida se o conteúdo contém campos dinâmicos válidos
    this.validarCamposDinamicos(createModeloCartaDto.conteudo);
    
    const result = await this.prisma.modeloCarta.create({
      data: createModeloCartaDto,
    });
    
    console.log('✅ Modelo criado com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Busca todos os modelos de carta
   */
  async findAll() {
    console.log('=== BUSCANDO TODOS OS MODELOS ===');
    const modelos = await this.prisma.modeloCarta.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Encontrados ${modelos.length} modelos`);
    return modelos;
  }

  /**
   * Busca um modelo específico por ID
   */
  async findOne(id: string) {
    console.log('=== BUSCANDO MODELO POR ID ===');
    console.log('ID:', id);
    
    const modelo = await this.prisma.modeloCarta.findUnique({ 
      where: { id } 
    });
    
    if (!modelo) {
      console.log('❌ Modelo não encontrado');
      throw new NotFoundException(`Modelo com ID ${id} não encontrado.`);
    }
    
    console.log('✅ Modelo encontrado:', JSON.stringify(modelo, null, 2));
    return modelo;
  }

  /**
   * Atualiza um modelo existente
   */
  async update(id: string, updateModeloCartaDto: UpdateModeloCartaDto) {
    console.log('=== ATUALIZANDO MODELO DE CARTA ===');
    console.log('ID:', id);
    console.log('Dados recebidos:', JSON.stringify(updateModeloCartaDto, null, 2));
    
    // Verifica se o modelo existe
    const existingModel = await this.findOne(id);
    
    // Valida campos dinâmicos se o conteúdo foi alterado
    if (updateModeloCartaDto.conteudo) {
      this.validarCamposDinamicos(updateModeloCartaDto.conteudo);
    }

    // Remove imagens antigas se novas foram fornecidas
    if (updateModeloCartaDto.headerImageUrl && existingModel.headerImageUrl !== updateModeloCartaDto.headerImageUrl) {
      if (existingModel.headerImageUrl) {
        await this.fileManager.deleteImage(existingModel.headerImageUrl);
      }
    }
    
    if (updateModeloCartaDto.footerImageUrl && existingModel.footerImageUrl !== updateModeloCartaDto.footerImageUrl) {
      if (existingModel.footerImageUrl) {
        await this.fileManager.deleteImage(existingModel.footerImageUrl);
      }
    }
    
    const result = await this.prisma.modeloCarta.update({
      where: { id },
      data: updateModeloCartaDto,
    });
    
    console.log('✅ Modelo atualizado com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Remove um modelo
   */
  async remove(id: string) {
    console.log('=== REMOVENDO MODELO DE CARTA ===');
    console.log('ID:', id);
    
    // Verifica se o modelo existe
    const existingModel = await this.findOne(id);
    
    // Verifica se há cobranças usando este modelo
    const cobrancasUsandoModelo = await this.prisma.cobranca.findMany({
      where: { modeloCartaId: id },
      select: { id: true }
    });
    
    if (cobrancasUsandoModelo.length > 0) {
      console.log('❌ Não é possível excluir o modelo. Existem cobranças usando este modelo.');
      throw new Error(`Não é possível excluir este modelo. Existem ${cobrancasUsandoModelo.length} cobrança(s) usando este modelo. Remova as cobranças primeiro.`);
    }

    // Remove imagens associadas
    if (existingModel.headerImageUrl) {
      await this.fileManager.deleteImage(existingModel.headerImageUrl);
    }
    
    if (existingModel.footerImageUrl) {
      await this.fileManager.deleteImage(existingModel.footerImageUrl);
    }
    
    const result = await this.prisma.modeloCarta.delete({ 
      where: { id } 
    });
    
    console.log('✅ Modelo removido com sucesso:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Valida se o conteúdo contém campos dinâmicos válidos
   */
  private validarCamposDinamicos(conteudo: string) {
    console.log('=== VALIDANDO CAMPOS DINÂMICOS ===');
    
    const camposDinamicosValidos = [
      '{{nome_morador}}', '{{email}}', '{{telefone}}',
      '{{bloco}}', '{{apartamento}}', '{{unidade}}',
      '{{nome_condominio}}', '{{cnpj}}',
      '{{cidade}}', '{{estado}}', '{{endereco}}',
      '{{valor}}', '{{valor_formatado}}', '{{mes_referencia}}',
      '{{data_vencimento}}', '{{data_atual}}', '{{hoje}}'
    ];
    
    // Encontra todos os placeholders no conteúdo
    const regex = /\{\{[^}]+\}\}/g;
    const placeholdersEncontrados = conteudo.match(regex) || [];
    
    console.log('Placeholders encontrados:', placeholdersEncontrados);
    
    // Verifica se todos os placeholders são válidos
    const placeholdersInvalidos = placeholdersEncontrados.filter(
      placeholder => !camposDinamicosValidos.includes(placeholder)
    );
    
    if (placeholdersInvalidos.length > 0) {
      console.log('❌ Placeholders inválidos encontrados:', placeholdersInvalidos);
      throw new Error(`Campos dinâmicos inválidos: ${placeholdersInvalidos.join(', ')}`);
    }
    
    console.log('✅ Todos os campos dinâmicos são válidos');
  }

  /**
   * Lista todos os campos dinâmicos disponíveis
   */
  getCamposDinamicos() {
    return {
      morador: [
        { placeholder: '{{nome_morador}}', descricao: 'Nome completo do morador' },
        { placeholder: '{{email}}', descricao: 'Email do morador' },
        { placeholder: '{{telefone}}', descricao: 'Telefone do morador' },
        { placeholder: '{{bloco}}', descricao: 'Bloco do apartamento' },
        { placeholder: '{{apartamento}}', descricao: 'Número do apartamento' },
        { placeholder: '{{unidade}}', descricao: 'Unidade completa (bloco-apartamento)' }
      ],
      condominio: [
        { placeholder: '{{nome_condominio}}', descricao: 'Nome do condomínio' },
        { placeholder: '{{cnpj}}', descricao: 'CNPJ do condomínio' },
        { placeholder: '{{cidade}}', descricao: 'Cidade do condomínio' },
        { placeholder: '{{estado}}', descricao: 'Estado do condomínio' },
        { placeholder: '{{endereco}}', descricao: 'Endereço completo do condomínio' }
      ],
      cobranca: [
        { placeholder: '{{valor}}', descricao: 'Valor da cobrança formatado' },
        { placeholder: '{{valor_formatado}}', descricao: 'Valor formatado (alternativo)' },
        { placeholder: '{{mes_referencia}}', descricao: 'Mês/ano de referência' },
        { placeholder: '{{data_vencimento}}', descricao: 'Data de vencimento' }
      ],
      datas: [
        { placeholder: '{{data_atual}}', descricao: 'Data atual' },
        { placeholder: '{{hoje}}', descricao: 'Data atual (alternativo)' }
      ]
    };
  }
}
