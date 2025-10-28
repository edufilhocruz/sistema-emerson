#!/bin/bash

# Script de Correção - Sistema Emerson Reis
# Para resolver problemas de dependências e configuração

set -e

echo "🔧 Corrigindo problemas do Sistema Emerson Reis..."

PROJECT_DIR="/var/www/sistema-emerson"
LOG_FILE="/var/log/emerson-fix.log"

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

cd $PROJECT_DIR

# Parar aplicações
log "🛑 Parando aplicações..."
pm2 stop emerson-backend emerson-frontend 2>/dev/null || true

# Instalar dependências do backend
if [ -d "backend" ]; then
    log "📦 Instalando dependências do backend..."
    cd backend
    
    # Limpar node_modules e package-lock.json
    rm -rf node_modules package-lock.json
    
    # Instalar dependências
    npm install
    
    # Gerar cliente Prisma
    log "🔧 Gerando cliente Prisma..."
    npx prisma generate
    
    # Executar migrações do banco
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

# Verificar se as aplicações estão funcionando
log "🚀 Reiniciando aplicações..."
pm2 restart emerson-backend emerson-frontend

# Verificar status
log "📊 Verificando status..."
pm2 status

log "✅ Correção concluída!"
echo ""
echo "🎉 Sistema corrigido com sucesso!"
echo "📱 Sistema Emerson Reis: https://emersonreis.adv.br"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs"
