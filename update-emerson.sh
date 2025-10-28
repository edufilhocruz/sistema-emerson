#!/bin/bash

# Script de Atualização Rápida - Sistema Emerson Reis
# Para atualizações futuras do GitHub

set -e

echo "🔄 Atualizando Sistema Emerson Reis..."

PROJECT_DIR="/var/www/sistema-emerson"
LOG_FILE="/var/log/emerson-update.log"

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

cd $PROJECT_DIR

# Backup rápido
log "📦 Fazendo backup rápido..."
tar -czf "/var/www/backups/emerson/quick-backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C /var/www sistema-emerson

# Parar aplicações
log "🛑 Parando aplicações..."
pm2 stop emerson-backend emerson-frontend

# Pull do GitHub
log "📥 Atualizando código do GitHub..."
git pull origin main

# Instalar dependências atualizadas
log "📦 Instalando dependências atualizadas..."
rm -rf node_modules package-lock.json
npm install

if [ -d "backend" ]; then
    cd backend
    rm -rf node_modules package-lock.json
    npm install
    log "🔧 Gerando cliente Prisma..."
    npx prisma generate
    cd ..
fi

# Build
log "🔨 Fazendo build..."
if [ -d "backend" ]; then
    cd backend
    npm run build
    cd ..
fi

npm run build

# Reiniciar aplicações
log "🚀 Reiniciando aplicações..."
pm2 restart emerson-backend emerson-frontend

# Verificar status
log "📊 Verificando status..."
pm2 status

log "✅ Atualização concluída!"
echo ""
echo "🎉 Sistema atualizado com sucesso!"
echo "📱 Sistema Emerson Reis: https://emersonreis.adv.br"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs"
