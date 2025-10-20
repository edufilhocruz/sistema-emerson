import { Body, Controller, Delete, Get, Param, Post, Patch, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProcessoService } from './processo.service';
import { CreateProcessoDto, SituacaoProcesso, TipoParte } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';

@Controller('processos')
export class ProcessoController {
  constructor(private readonly service: ProcessoService) {}

  @Post()
  create(@Body() createProcessoDto: CreateProcessoDto) {
    console.log('=== CRIAÇÃO DE PROCESSO ===');
    console.log('DTO recebido:', JSON.stringify(createProcessoDto, null, 2));
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

  @Get('tipos-parte')
  getTiposParte() {
    return {
      tiposParte: Object.values(TipoParte).map(value => ({
        value,
        label: this.getTipoParteLabel(value)
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
      [SituacaoProcesso.CITACAO]: 'Citação',
      [SituacaoProcesso.CONTESTACAO]: 'Contestação',
      [SituacaoProcesso.REPLICA]: 'Réplica',
      [SituacaoProcesso.SISBAJUD]: 'Sisbajud',
      [SituacaoProcesso.PENHORA_DA_UNIDADE]: 'Penhorada da Unidade',
      [SituacaoProcesso.ACORDO_PROTOCOLADO]: 'Acordo Protocolado',
      [SituacaoProcesso.ACORDO_HOMOLOGADO]: 'Acordo Homologado',
      [SituacaoProcesso.ACORDO_QUEBRADO]: 'Acordo Quebrado',
      [SituacaoProcesso.QUITACAO_DA_DIVIDA]: 'Quitação da Dívida',
      [SituacaoProcesso.EXTINTO]: 'Extinto',
      [SituacaoProcesso.CUMP_SENTENCA]: 'Cump. de Sentença',
      [SituacaoProcesso.GRAU_DE_RECURSO]: 'Grau de Recurso',
    };
    return labels[situacao] || situacao;
  }

  private getTipoParteLabel(tipoParte: TipoParte): string {
    const labels = {
      [TipoParte.AUTOR]: 'Autor',
      [TipoParte.REU]: 'Réu',
      [TipoParte.TERCEIRO_INTERESSADO]: 'Terceiro Interessado',
    };
    return labels[tipoParte] || tipoParte;
  }
}


