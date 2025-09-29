import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario.service';
import * as bcrypt from 'bcryptjs';

// Cache simples para rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Rate limiting: máximo 5 tentativas em 15 minutos
    const now = Date.now();
    const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    // Reset se passou 15 minutos
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      attempts.count = 0;
    }
    
    // Verifica se excedeu o limite
    if (attempts.count >= 5) {
      throw new UnauthorizedException('Muitas tentativas de login. Tente novamente em 15 minutos.');
    }
    
    try {
      const user = await this.usuarioService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.senha)) {
        // Login bem-sucedido, reseta contador
        loginAttempts.delete(email);
        return user;
      }
      
      // Login falhou, incrementa contador
      attempts.count++;
      attempts.lastAttempt = now;
      loginAttempts.set(email, attempts);
      
      throw new UnauthorizedException('Email ou senha inválidos');
    } catch (error) {
      // Incrementa contador mesmo em caso de erro
      attempts.count++;
      attempts.lastAttempt = now;
      loginAttempts.set(email, attempts);
      throw error;
    }
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      nome: user.nome
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        foto: user.foto,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    };
  }
}
