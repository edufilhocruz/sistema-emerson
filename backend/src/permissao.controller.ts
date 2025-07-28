import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PermissaoService } from './permissao.service';
import { AuthGuard } from './auth.guard';

@Controller('permissoes')
@UseGuards(AuthGuard)
export class PermissaoController {
  constructor(private readonly permissaoService: PermissaoService) {}

  @Get()
  findAll() {
    return this.permissaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissaoService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.permissaoService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.permissaoService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.permissaoService.delete(id);
  }
} 