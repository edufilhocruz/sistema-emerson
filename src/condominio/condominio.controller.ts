import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CondominioService } from './condominio.service';
import { CreateCondominioDto } from './dto/create-condominio.dto';

@Controller('condominios')
export class CondominioController {
  constructor(private readonly condominioService: CondominioService) {}

  @Post()
  create(@Body() createCondominioDto: CreateCondominioDto) {
    return this.condominioService.create(createCondominioDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.condominioService.findOne(id);
  }
}