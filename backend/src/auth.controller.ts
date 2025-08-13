import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', body.email);
      console.log('Password length:', body.password?.length || 0);
      
      if (!body.email || !body.password) {
        console.log('❌ Email ou senha não fornecidos');
        return res.status(400).json({
          message: 'Email e senha são obrigatórios',
        });
      }
      
      const user = await this.authService.validateUser(body.email, body.password);
      const result = await this.authService.login(user);
      
      console.log('✅ Login bem-sucedido para:', body.email);
      
      // Define o cookie JWT
      res.cookie('jwt', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
      });
      
      return res.json({
        user: result.user,
        access_token: result.access_token, // Para compatibilidade com Postman
      });
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      
      if (error.message.includes('Muitas tentativas')) {
        return res.status(429).json({
          message: error.message,
          retryAfter: '15 minutos',
        });
      }
      
      return res.status(401).json({
        message: 'Email ou senha inválidos',
        error: error.message,
      });
    }
  }

  @Post('login-token')
  async loginWithToken(@Body() body: { email: string; password: string }) {
    try {
      console.log('=== LOGIN TOKEN ATTEMPT ===');
      console.log('Email:', body.email);
      
      if (!body.email || !body.password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      const user = await this.authService.validateUser(body.email, body.password);
      const result = await this.authService.login(user);
      
      console.log('✅ Login token bem-sucedido para:', body.email);
      
      return {
        access_token: result.access_token,
        user: result.user,
      };
    } catch (error) {
      console.error('❌ Erro no login token:', error.message);
      throw error;
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    console.log('=== LOGOUT ===');
    
    // Remove o cookie JWT
    res.clearCookie('jwt');
    
    console.log('✅ Logout realizado com sucesso');
    
    return res.json({ message: 'Logout realizado com sucesso' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    try {
      console.log('=== ME ENDPOINT ===');
      console.log('User do request:', req.user);
      
      if (!req.user) {
        console.log('❌ Usuário não encontrado no request');
        return null;
      }
      
      console.log('✅ Usuário autenticado:', {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
      });
      
      return {
        id: req.user.sub,
        nome: req.user.nome,
        email: req.user.email,
        role: req.user.role,
        foto: req.user.foto,
      };
    } catch (error) {
      console.error('❌ Erro no endpoint me:', error.message);
      return null;
    }
  }
} 