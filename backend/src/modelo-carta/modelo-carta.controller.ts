import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModeloCartaService } from './modelo-carta.service';
import { CreateModeloCartaDto } from './dto/create-modelo-carta.dto';
import { UpdateModeloCartaDto } from './dto/update-modelo-carta.dto';

@Controller('modelo-carta')
export class ModeloCartaController {
  constructor(private readonly modeloCartaService: ModeloCartaService) {
    console.log('=== MODELO CARTA CONTROLLER INSTANCIADO ===');
  }

  @Post()
  create(@Body() createModeloCartaDto: CreateModeloCartaDto) {
    return this.modeloCartaService.create(createModeloCartaDto);
  }

  @Get()
  findAll() {
    return this.modeloCartaService.findAll();
  }

  @Get('campos-dinamicos')
  getCamposDinamicos() {
    console.log('=== ENDPOINT CAMPOS DINÂMICOS CHAMADO ===');
    return {
      morador: [
        { placeholder: '{{nome_morador}}', descricao: 'Nome completo do morador' },
        { placeholder: '{{nome}}', descricao: 'Nome do morador (alternativo)' },
      ],
      condominio: [
        { placeholder: '{{nome_condominio}}', descricao: 'Nome do condomínio' },
        { placeholder: '{{condominio}}', descricao: 'Nome do condomínio (alternativo)' },
      ],
      cobranca: [
        { placeholder: '{{valor}}', descricao: 'Valor da cobrança formatado' },
        { placeholder: '{{valor_formatado}}', descricao: 'Valor formatado (alternativo)' },
      ],
      datas: [
        { placeholder: '{{data_atual}}', descricao: 'Data atual' },
        { placeholder: '{{hoje}}', descricao: 'Data atual (alternativo)' }
      ]
    };
  }

  @Get('teste')
  teste() {
    console.log('=== ENDPOINT TESTE CHAMADO ===');
    return { message: 'Teste funcionando!' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modeloCartaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateModeloCartaDto: UpdateModeloCartaDto,
  ) {
    return this.modeloCartaService.update(id, updateModeloCartaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modeloCartaService.remove(id);
  }
}
