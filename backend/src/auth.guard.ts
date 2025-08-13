import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.jwt;
    
    console.log('=== AUTH GUARD VERIFICATION ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Token presente:', !!token);
    console.log('Cookies:', request.cookies);
    
    if (!token) {
      console.log('❌ Token JWT não encontrado');
      throw new UnauthorizedException('Token JWT não encontrado. Faça login novamente.');
    }
    
    try {
      const payload = this.jwtService.verify(token);
      console.log('✅ Token verificado com sucesso');
      console.log('Payload:', { 
        sub: payload.sub, 
        email: payload.email, 
        role: payload.role,
        exp: new Date(payload.exp * 1000).toISOString()
      });
      
      request.user = payload;
      return true;
    } catch (e) {
      console.log('❌ Erro na verificação do token:', e.message);
      
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado. Faça login novamente.');
      } else if (e.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido. Faça login novamente.');
      } else {
        throw new UnauthorizedException('Erro na autenticação. Faça login novamente.');
      }
    }
  }
} 