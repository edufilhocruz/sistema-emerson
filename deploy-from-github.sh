#!/bin/bash

# Script de Deploy - Sistema Emerson Reis
# Deploy direto do GitHub para o servidor 191.252.111.245

set -e

echo "🚀 Iniciando deploy do Sistema Emerson Reis do GitHub..."

# Configurações
PROJECT_DIR="/var/www/sistema-emerson"
BACKUP_DIR="/var/www/backups/emerson"
LOG_FILE="/var/log/emerson-deploy.log"
GITHUB_REPO="https://github.com/edufilhocruz/sistema-emerson.git"

# Criar diretórios necessários
mkdir -p $BACKUP_DIR
mkdir -p $PROJECT_DIR/logs

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Backup do sistema atual (se existir)
if [ -d "$PROJECT_DIR" ]; then
    log "📦 Fazendo backup do sistema atual..."
    tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C /var/www sistema-emerson
    log "✅ Backup concluído"
fi

# Parar aplicações PM2 do Emerson (se estiverem rodando)
log "🛑 Parando aplicações PM2 do Emerson..."
pm2 stop emerson-backend emerson-frontend 2>/dev/null || true
pm2 delete emerson-backend emerson-frontend 2>/dev/null || true

# Remover diretório atual
if [ -d "$PROJECT_DIR" ]; then
    log "🗑️ Removendo instalação anterior..."
    rm -rf $PROJECT_DIR
fi

# Clone do repositório
log "📥 Fazendo clone do repositório GitHub..."
cd /var/www
git clone $GITHUB_REPO sistema-emerson
cd $PROJECT_DIR

# Instalar dependências do backend
if [ -d "backend" ]; then
    log "📦 Instalando dependências do backend..."
    cd backend
    rm -rf node_modules package-lock.json
    npm install
    log "🔧 Gerando cliente Prisma..."
    npx prisma generate
    log "🗄️ Executando migrações do banco..."
    npx prisma migrate deploy
    cd ..
fi

# Instalar dependências do frontend
log "📦 Instalando dependências do frontend..."
rm -rf node_modules package-lock.json
npm install

# Build do backend
if [ -d "backend" ]; then
    log "🔨 Fazendo build do backend..."
    cd backend
    npm run build
    cd ..
fi

# Build do frontend
log "🔨 Fazendo build do frontend..."
npm run build

# Configurar variáveis de ambiente
log "⚙️ Configurando variáveis de ambiente..."
cp env.emerson .env

# Configurar logs
mkdir -p logs
touch logs/emerson-backend-error.log
touch logs/emerson-backend-out.log
touch logs/emerson-backend-combined.log
touch logs/emerson-frontend-error.log
touch logs/emerson-frontend-out.log
touch logs/emerson-frontend-combined.log

# Iniciar aplicações com PM2
log "🚀 Iniciando aplicações com PM2..."
pm2 start ecosystem.emerson.config.cjs

# Salvar configuração PM2
pm2 save

# Configurar Nginx
log "🌐 Configurando Nginx..."
cp nginx.emerson.conf /etc/nginx/sites-available/emersonreis.adv.br

# Criar link simbólico se não existir
if [ ! -L "/etc/nginx/sites-enabled/emersonreis.adv.br" ]; then
    ln -s /etc/nginx/sites-available/emersonreis.adv.br /etc/nginx/sites-enabled/
fi

# Testar configuração Nginx
nginx -t

# Recarregar Nginx
systemctl reload nginx

# Verificar status das aplicações
log "📊 Verificando status das aplicações..."
pm2 status

log "✅ Deploy do Sistema Emerson Reis concluído!"
log "🌐 Sistema disponível em: https://emersonreis.adv.br"
log "📋 Próximos passos:"
log "   1. Configurar SSL com Let's Encrypt"
log "   2. Verificar logs: pm2 logs emerson-backend emerson-frontend"
log "   3. Monitorar: pm2 monit"

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "📱 Sistema Emerson Reis: https://emersonreis.adv.br"
echo "📊 Monitoramento: pm2 monit"
echo "📋 Logs: pm2 logs"
echo "🔄 Para atualizar: git pull && npm run build && pm2 restart all"
