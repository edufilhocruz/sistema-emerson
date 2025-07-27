#!/bin/bash

# Script de Deploy para Sistema Raunaimer
# Uso: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Iniciando deploy para ambiente: $ENVIRONMENT"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}"
}

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    error "PM2 não está instalado. Instale com: npm install -g pm2"
fi

# Verificar se serve está instalado (para frontend)
if ! command -v serve &> /dev/null; then
    warn "Serve não está instalado. Instalando..."
    npm install -g serve
fi

# Criar diretório de logs se não existir
mkdir -p logs

log "📦 Instalando dependências do frontend..."
npm install

log "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

log "🔨 Buildando frontend..."
npm run build

log "🔨 Buildando backend..."
cd backend
npm run build
cd ..

log "🔄 Parando aplicações existentes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

log "🚀 Iniciando aplicações com PM2..."
pm2 start ecosystem.config.js --env $ENVIRONMENT

log "💾 Salvando configuração do PM2..."
pm2 save

log "📊 Status das aplicações:"
pm2 status

log "✅ Deploy concluído com sucesso!"
log "📝 Logs disponíveis em: ./logs/"
log "🔍 Para ver logs em tempo real: pm2 logs"
log "🛑 Para parar: pm2 stop all"
log "▶️  Para reiniciar: pm2 restart all" 