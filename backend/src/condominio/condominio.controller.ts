import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CondominioService } from './condominio.service';
import { CreateCondominioDto } from './dto/create-condominio.dto';
import { UpdateCondominioDto } from './dto/update-condominio.dto';

@Controller('condominio')
export class CondominioController {
  constructor(private readonly condominioService: CondominioService) {}

  @Post()
  create(@Body() createCondominioDto: CreateCondominioDto) {
    return this.condominioService.create(createCondominioDto);
  }

  @Get()
  findAll() {
    return this.condominioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.condominioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCondominioDto: UpdateCondominioDto,
  ) {
    return this.condominioService.update(id, updateCondominioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.condominioService.remove(id);
  }
}
