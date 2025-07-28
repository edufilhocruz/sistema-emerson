import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  me(@Req() req: Request) {
    if (!req.user) return null;
    const { senha, ...user } = req.user;
    return user;
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.usuarioService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usuarioService.delete(id);
  }

  @Get('admin-exists')
  //@UseGuards() // Remover o guard para este endpoint
  async adminExists() {
    const exists = await this.usuarioService.existsAdmin();
    return { exists };
  }
}