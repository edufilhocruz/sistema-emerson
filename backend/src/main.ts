import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Define um prefixo global para todas as rotas da API
  app.setGlobalPrefix('api');

  // Configurar arquivos estáticos para uploads
  const uploadsPath = join(__dirname, '..', 'uploads');
  const imagesPath = join(uploadsPath, 'images');
  
  console.log('=== CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS ===');
  console.log('📂 Caminho dos uploads:', uploadsPath);
  console.log('📂 Caminho das imagens:', imagesPath);
  
  // Criar diretórios se não existirem
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Diretório de uploads criado');
  }
  
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
    console.log('✅ Diretório de imagens criado');
  }
  
  // IMPORTANTE: Configurar para servir arquivos estáticos
  // O frontend espera acessar as imagens em /uploads/images/
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    index: false,
    setHeaders: (res, path) => {
      // Headers para melhor cache e segurança
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
  
  console.log('✅ Servidor de arquivos estáticos configurado');
  console.log('📍 Imagens acessíveis em: /uploads/images/[arquivo]');
  
  // Log de arquivos existentes
  try {
    const files = fs.readdirSync(imagesPath);
    if (files.length > 0) {
      console.log(`📁 ${files.length} imagens encontradas`);
      console.log('📄 Exemplos:', files.slice(0, 3).join(', '));
    } else {
      console.log('📁 Nenhuma imagem encontrada ainda');
    }
  } catch (error) {
    console.log('⚠️ Erro ao listar imagens:', error.message);
  }

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📷 Teste de imagem: ${await app.getUrl()}/uploads/images/teste.png`);
  console.log(`📚 API Docs: ${await app.getUrl()}/api-docs`);
}
bootstrap();