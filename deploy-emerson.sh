#!/bin/bash

# Script de Deploy - Sistema Emerson Reis
# Para ser executado no servidor 191.252.111.245

set -e

echo "🚀 Iniciando deploy do Sistema Emerson Reis..."

# Configurações
PROJECT_DIR="/var/www/sistema-emerson"
BACKUP_DIR="/var/www/backups/emerson"
LOG_FILE="/var/log/emerson-deploy.log"

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

# Criar diretório do projeto
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Copiar arquivos do projeto (assumindo que você já fez upload dos arquivos)
log "📁 Preparando estrutura do projeto..."

# Instalar dependências do backend
if [ -d "backend" ]; then
    log "📦 Instalando dependências do backend..."
    cd backend
    npm ci --production
    cd ..
fi

# Instalar dependências do frontend
if [ -d "." ]; then
    log "📦 Instalando dependências do frontend..."
    npm ci --production
fi

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
