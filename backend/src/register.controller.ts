import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  async register(@Body() data: any) {
    const adminExists = await this.usuarioService.existsAdmin();
    if (adminExists) {
      throw new ForbiddenException('Já existe um administrador cadastrado.');
    }
    // Força role Admin
    data.role = 'Admin';
    return this.usuarioService.create(data);
  }
} 