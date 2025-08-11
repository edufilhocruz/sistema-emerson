import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // Removido HTTPS para produção, pois o proxy (Traefik/Nginx) já faz o HTTPS
  const app = await NestFactory.create(AppModule);

  // Configurações básicas
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  const config = new DocumentBuilder()
    .setTitle('Documentação da API')
    .setDescription('Endpoints do sistema Raunaimer')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Habilita a validação automática de DTOs em todas as rotas
  app.useGlobalPipes(new ValidationPipe());
  
  // Configuração explícita do CORS para maior compatibilidade
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:8080', 
      'http://191.252.111.245', 
      'http://app.raunaimer.adv.br', 
      'https://app.raunaimer.adv.br',
      'http://raunaimer.adv.br',
      'https://raunaimer.adv.br'
    ], // Permite requisições do frontend e landing page
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Define um prefixo global para todas as rotas da API
  app.setGlobalPrefix('api');

  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();