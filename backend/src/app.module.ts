import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CondominioModule } from './condominio/condominio.module';
import { MoradorModule } from './morador/morador.module';
import { CobrancaModule } from './cobranca/cobranca.module';
import { ModeloCartaModule } from './modelo-carta/modelo-carta.module';
import { EmailConfigService } from './email-config.service';
import { EmailConfigController } from './email-config.controller';
import { PrismaService } from './prisma/prisma.service';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PermissaoService } from './permissao.service';
import { PermissaoController } from './permissao.controller';
import { StatusEnvio } from '@prisma/client';
import { DashboardModule } from './dashboard/dashboard.module';
import { LogAuditoriaService } from './log-auditoria.service';
import { LogAuditoriaController } from './log-auditoria.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { RegisterController } from './register.controller';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // máximo de requisições por IP por minuto
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CondominioModule,
    MoradorModule,
    CobrancaModule,
    ModeloCartaModule,
    DashboardModule,
    JwtModule.register({
      secret: 'sua_chave_secreta_aqui', // Troque por variável de ambiente em produção
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController, EmailConfigController, UsuarioController, PermissaoController, LogAuditoriaController, AuthController, RegisterController, ContactController],
  providers: [AppService, EmailConfigService, PrismaService, UsuarioService, PermissaoService, LogAuditoriaService, AuthService, AuthGuard, ContactService],
})
export class AppModule {}
