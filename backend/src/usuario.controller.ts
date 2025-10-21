import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('admin-exists')
  async adminExists() {
    const exists = await this.usuarioService.existsAdmin();
    return { exists };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: Request) {
    if (!req.user) return null;
    const { senha, ...user } = req.user;
    return user;
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() data: any) {
    return this.usuarioService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() data: any) {
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  delete(@Param('id') id: string) {
    return this.usuarioService.delete(id);
  }
}