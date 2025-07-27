import { Injectable, NotFoundException } from '@nestjs/common';
import { CondominioRepository } from './condominio.repository';
import { CreateCondominioDto } from './dto/create-condominio.dto';

@Injectable()
export class CondominioService {
  constructor(private readonly repository: CondominioRepository) {}

  async create(createCondominioDto: CreateCondominioDto) {
    // Regras de negócio podem ser adicionadas aqui
    // Ex: Verificar se o CNPJ já existe antes de tentar criar
    return this.repository.create(createCondominioDto);
  }

  async findOne(id: string) {
    const condominio = await this.repository.findOne(id);
    if (!condominio) {
      throw new NotFoundException(`Condomínio com ID ${id} não encontrado.`);
    }
    return condominio;
  }
}