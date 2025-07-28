import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }
    const passwordValid = await bcrypt.compare(password, user.senha);
    if (!passwordValid) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }
    // Não retorna a senha
    const { senha, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
} 