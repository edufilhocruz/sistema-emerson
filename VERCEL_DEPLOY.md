# 🚀 Deploy no Vercel - Sistema Raunaimer

## 📋 Configuração Necessária

### 1. **Variáveis de Ambiente**
Configure estas variáveis no painel do Vercel (Settings > Environment Variables):

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=https://your-domain.vercel.app
```

### 2. **Build Commands**
O Vercel usará automaticamente:
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`

### 3. **Estrutura de Deploy**
```
/ (Frontend React)
├── dist/ (arquivos estáticos)
└── /api/* (Backend NestJS)
    └── backend/dist/main.js
```

## 🔧 Arquivos de Configuração

### `vercel.json`
- Configura builds para frontend e backend
- Define rotas de API (`/api/*` → backend)
- Configura função serverless do backend

### `package.json`
- Script `vercel-build`: constrói frontend + backend
- Script `build:all`: executa ambos os builds

### `.vercelignore`
- Otimiza upload excluindo arquivos desnecessários
- Reduz tamanho do deploy

## 🚀 Processo de Deploy

1. **Conectar repositório** no Vercel
2. **Configurar variáveis** de ambiente
3. **Deploy automático** a cada push
4. **Builds simultâneos** de frontend e backend

## 📊 Monitoramento

- **Logs**: Dashboard do Vercel
- **Performance**: Analytics integrado
- **Errors**: Error tracking automático

## 🔄 Atualizações

Para atualizar o sistema:
1. Push para branch `main`
2. Deploy automático no Vercel
3. Frontend e backend atualizados simultaneamente

## ⚠️ Considerações

- **Database**: Use PostgreSQL externo (Supabase, Railway, etc.)
- **File Upload**: Configure storage externo (AWS S3, Cloudinary)
- **Email**: Configure SMTP externo
- **Redis**: Use Redis externo se necessário

## 🆘 Troubleshooting

### Build falha
- Verificar variáveis de ambiente
- Verificar logs no dashboard do Vercel
- Testar build local: `npm run vercel-build`

### API não funciona
- Verificar rotas em `vercel.json`
- Verificar se backend buildou corretamente
- Verificar logs da função serverless

### Frontend não carrega
- Verificar se `dist/` foi gerado
- Verificar configuração de rotas
- Verificar console do navegador
