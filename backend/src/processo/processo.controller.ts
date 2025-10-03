import { Body, Controller, Delete, Get, Param, Post, Patch, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProcessoService } from './processo.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { SituacaoProcesso } from '@prisma/client';

@Controller('processos')
export class ProcessoController {
  constructor(private readonly service: ProcessoService) {}

  @Post()
  create(@Body() createProcessoDto: CreateProcessoDto) {
    return this.service.create(createProcessoDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('situacoes')
  getSituacoes() {
    return {
      situacoes: Object.values(SituacaoProcesso).map(value => ({
        value,
        label: this.getSituacaoLabel(value)
      }))
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProcessoDto: UpdateProcessoDto) {
    return this.service.update(id, updateProcessoDto);
  }

  @Patch(':id/situacao')
  updateSituacao(@Param('id') id: string, @Body() body: { situacao: SituacaoProcesso }) {
    return this.service.update(id, { situacao: body.situacao });
  }

  @Get(':id/pdf')
  async gerarPdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.service.gerarPdf(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="processo-${id}.pdf"`);
    res.send(pdf);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  private getSituacaoLabel(situacao: SituacaoProcesso): string {
    const labels = {
      [SituacaoProcesso.EM_ANDAMENTO]: 'Em Andamento',
      [SituacaoProcesso.ARQUIVADO]: 'Arquivado',
      [SituacaoProcesso.SUSPENSO]: 'Suspenso',
      [SituacaoProcesso.EVIDENCIDO]: 'Evidenciado',
      [SituacaoProcesso.JULGADO]: 'Julgado',
      [SituacaoProcesso.CAUTELAR]: 'Cautelar',
      [SituacaoProcesso.EXTINTO]: 'Extinto',
    };
    return labels[situacao] || situacao;
  }
}


