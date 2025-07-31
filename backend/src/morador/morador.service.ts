import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMoradorDto } from './dto/create-morador.dto';
import { UpdateMoradorDto } from './dto/update-morador.dto';
import { MoradorRepository } from './morador.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoradorService {
  constructor(
    private readonly repository: MoradorRepository,
    private readonly prisma: PrismaService, // Injetamos o Prisma para checagens
  ) {}

  async create(createMoradorDto: CreateMoradorDto) {
    // Regra de negócio: Verificar se o condomínio existe
    const condominioExists = await this.prisma.condominio.findUnique({
      where: { id: createMoradorDto.condominioId },
    });
    if (!condominioExists) {
      throw new NotFoundException(`Condomínio com ID ${createMoradorDto.condominioId} não encontrado.`);
    }

    // Regra de negócio: Verificar se o e-mail já está em uso
    const emailExists = await this.prisma.morador.findUnique({
        where: { email: createMoradorDto.email },
    });
    if (emailExists) {
        throw new ConflictException(`O e-mail ${createMoradorDto.email} já está em uso.`);
    }

    return this.repository.create(createMoradorDto);
  }

  async findAll() {
    const moradores = await this.repository.findAll();
    return moradores.map((morador: any) => {
      const ultimaCobranca = morador.cobrancas && morador.cobrancas[0];
      let ultimaCobrancaStatus: any = null;
      if (ultimaCobranca) {
        if (ultimaCobranca.statusEnvio === 'ENVIADO') ultimaCobrancaStatus = 'Enviado';
        else if (ultimaCobranca.statusEnvio === 'ERRO') ultimaCobrancaStatus = 'Erro';
        else if (ultimaCobranca.statusEnvio === 'NAO_ENVIADO') ultimaCobrancaStatus = 'Não Enviado';
      }
      return {
        ...morador,
        ultimaCobrancaData: ultimaCobranca ? ultimaCobranca.dataEnvio : null,
        ultimaCobrancaStatus,
        ultimaCobrancaStatusEnvio: ultimaCobranca ? ultimaCobranca.statusEnvio : null,
        ultimaCobrancaTipo: ultimaCobranca && ultimaCobranca.modeloCarta ? ultimaCobranca.modeloCarta.titulo : null,
      };
    });
  }

  async findOne(id: string) {
    const morador = await this.repository.findOne(id);
    if (!morador) {
      throw new NotFoundException(`Morador com ID ${id} não encontrado.`);
    }
    return morador;
  }

  async update(id: string, updateMoradorDto: UpdateMoradorDto) {
    // Busca o morador atual para verificar se o email está sendo alterado
    const moradorAtual = await this.findOne(id);
    
    // Se o email está sendo alterado, verifica se o novo email já existe
    if (updateMoradorDto.email && updateMoradorDto.email !== moradorAtual.email) {
      const emailExists = await this.prisma.morador.findUnique({
        where: { email: updateMoradorDto.email },
      });
      if (emailExists) {
        throw new ConflictException(`O e-mail ${updateMoradorDto.email} já está em uso.`);
      }
    }
    
    return this.repository.update(id, updateMoradorDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Garante que o morador existe
    return this.repository.remove(id);
  }

  async importar(moradores: any[]) {
    if (!Array.isArray(moradores)) {
      throw new Error('O payload deve ser um array de moradores.');
    }
    const criados: any[] = [];
    const duplicados: string[] = [];
    for (const m of moradores) {
      if (!m.nome || !m.email || !m.condominio) continue; // Campos essenciais
      // Busca ou cria o condomínio pelo nome
      let condominio = await this.prisma.condominio.findFirst({ where: { nome: m.condominio } });
      if (!condominio) {
        // Extrai cidade e UF do endereço, se possível
        let cidade = '';
        let estado = '';
        if (m.endereco) {
          // Tenta extrair cidade e UF do final do endereço
          const match = m.endereco.match(/,\s*([^,]+)\s*-\s*([A-Z]{2})$/i);
          if (match) {
            cidade = match[1].trim();
            estado = match[2].trim();
          }
        }
        condominio = await this.prisma.condominio.create({
          data: {
            nome: m.condominio,
            cnpj: '',
            cep: '',
            logradouro: '',
            numero: '',
            bairro: '',
            cidade,
            estado,
          },
        });
      }
      // Verifica duplicidade de e-mail
      const existe = await this.prisma.morador.findUnique({ where: { email: m.email } });
      if (existe) {
        duplicados.push(m.email);
        continue;
      }
      try {
        const novo = await this.prisma.morador.create({
          data: {
            nome: m.nome,
            email: m.email,
            bloco: m.bloco?.toString() || '',
            apartamento: m.apto?.toString() || '',
            telefone: '',
            condominioId: condominio.id,
          },
        });
        criados.push(novo);
      } catch {
        // Ignora outros erros
      }
    }
    return { total: criados.length, moradores: criados, duplicados };
  }
}
