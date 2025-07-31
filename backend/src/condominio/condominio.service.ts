import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCondominioDto } from './dto/create-condominio.dto';
import { UpdateCondominioDto } from './dto/update-condominio.dto';
import { CondominioRepository } from './condominio.repository';

@Injectable()
export class CondominioService {
  constructor(private readonly repository: CondominioRepository) {}

  create(createCondominioDto: CreateCondominioDto) {
    return this.repository.create(createCondominioDto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const condominio = await this.repository.findOne(id);
    if (!condominio) {
      throw new NotFoundException(`Condomínio com ID ${id} não encontrado.`);
    }
    return condominio;
  }

  async update(id: string, updateCondominioDto: UpdateCondominioDto) {
    await this.findOne(id); // Garante que o condomínio existe antes de tentar atualizar
    return this.repository.update(id, updateCondominioDto);
  }

  async remove(id: string) {
    console.log('=== REMOVENDO CONDOMÍNIO ===');
    console.log('ID:', id);
    
    try {
      // Garante que o condomínio existe antes de tentar remover
      const condominio = await this.findOne(id);
      console.log('Condomínio encontrado:', condominio.nome);
      
      // Remove o condomínio e todos os registros relacionados
      const result = await this.repository.remove(id);
      console.log('✅ Condomínio removido com sucesso:', result.nome);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao remover condomínio:', error);
      throw error;
    }
  }
}
