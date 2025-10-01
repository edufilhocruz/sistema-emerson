import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessoRepository } from './processo.repository';

@Injectable()
export class ProcessoService {
  constructor(private readonly repository: ProcessoRepository) {}

  async create(data: any) {
    return this.repository.create(data);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const proc = await this.repository.findOne(id);
    if (!proc) throw new NotFoundException('Processo não encontrado');
    return proc;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.repository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}


