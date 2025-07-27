# 🚀 Deploy com PM2 - Sistema Raunaimer

Este documento explica como fazer o deploy do Sistema Raunaimer usando PM2.

## 📋 Pré-requisitos

### No servidor de produção:
1. **Node.js** (versão 18 ou superior)
2. **npm** ou **yarn**
3. **PostgreSQL** (banco de dados)
4. **Redis** (cache)
5. **PM2** (process manager)
6. **Serve** (servidor estático para frontend)

### Instalação dos pré-requisitos:

```bash
# Instalar Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2

# Instalar Serve globalmente
npm install -g serve

# Instalar PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Instalar Redis
sudo apt-get install redis-server
```

## 🔧 Configuração

### 1. Configurar Banco de Dados

```sql
-- Conectar ao PostgreSQL
sudo -u postgres psql

-- Criar usuário e banco
CREATE USER raunaimer WITH PASSWORD 'qbO#259Qq';
CREATE DATABASE raunaimer OWNER raunaimer;
GRANT ALL PRIVILEGES ON DATABASE raunaimer TO raunaimer;
\q
```

### 2. Configurar Redis

```bash
# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `env.production` com suas configurações:

```bash
# JWT Secret (IMPORTANTE: mude para um valor seguro)
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-mude-isto

# Configurações de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# URL da API
VITE_API_URL=https://app.raunaimer.adv.br/api
```

## 🚀 Deploy

### Deploy Automático (Recomendado)

```bash
# Tornar o script executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh production
```

### Deploy Manual

```bash
# 1. Instalar dependências
npm install
cd backend && npm install && cd ..

# 2. Build das aplicações
npm run build
cd backend && npm run build && cd ..

# 3. Iniciar com PM2
pm2 start ecosystem.config.js --env production

# 4. Salvar configuração
pm2 save

# 5. Configurar startup automático
pm2 startup
```

## 📊 Comandos Úteis do PM2

```bash
# Ver status das aplicações
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de uma aplicação específica
pm2 logs raunaimer-backend
pm2 logs raunaimer-frontend

# Reiniciar aplicações
pm2 restart all
pm2 restart raunaimer-backend
pm2 restart raunaimer-frontend

# Parar aplicações
pm2 stop all
pm2 stop raunaimer-backend

# Deletar aplicações
pm2 delete all
pm2 delete raunaimer-backend

# Monitor de recursos
pm2 monit

# Lista de processos salvos
pm2 list

# Recarregar configuração
pm2 reload ecosystem.config.js --env production
```

## 🔄 Atualizações

Para atualizar o sistema:

```bash
# 1. Fazer pull das mudanças
git pull origin main

# 2. Executar deploy
./deploy.sh production
```

## 📝 Logs

Os logs são salvos em:
- `./logs/backend-error.log` - Erros do backend
- `./logs/backend-out.log` - Output do backend
- `./logs/frontend-error.log` - Erros do frontend
- `./logs/frontend-out.log` - Output do frontend

## 🔒 Segurança

### Configurações importantes:

1. **JWT Secret**: Mude o `JWT_SECRET` para um valor seguro
2. **Senha do Banco**: Use uma senha forte para o PostgreSQL
3. **Firewall**: Configure o firewall para permitir apenas as portas necessárias
4. **HTTPS**: Configure SSL/TLS para produção

### Portas utilizadas:
- **3000**: Frontend (React)
- **3001**: Backend (NestJS)
- **5432**: PostgreSQL
- **6379**: Redis

## 🐛 Troubleshooting

### Problemas comuns:

1. **Porta já em uso**:
   ```bash
   # Verificar processos usando a porta
   sudo lsof -i :3000
   sudo lsof -i :3001
   
   # Matar processo se necessário
   sudo kill -9 <PID>
   ```

2. **Erro de permissão**:
   ```bash
   # Dar permissão de escrita nos logs
   sudo chown -R $USER:$USER logs/
   ```

3. **Banco não conecta**:
   ```bash
   # Verificar se PostgreSQL está rodando
   sudo systemctl status postgresql
   
   # Verificar conexão
   psql -h localhost -U raunaimer -d raunaimer
   ```

4. **Redis não conecta**:
   ```bash
   # Verificar se Redis está rodando
   sudo systemctl status redis-server
   
   # Testar conexão
   redis-cli ping
   ```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `pm2 logs`
2. Verifique o status: `pm2 status`
3. Consulte a documentação do PM2: https://pm2.keymetrics.io/docs/ 