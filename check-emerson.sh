#!/bin/bash

# Script de Verificação - Sistema Emerson Reis
# Para verificar se tudo está funcionando corretamente

set -e

echo "🔍 Verificando Sistema Emerson Reis..."

PROJECT_DIR="/var/www/sistema-emerson"
LOG_FILE="/var/log/emerson-check.log"

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

cd $PROJECT_DIR

# Verificar se o diretório existe
if [ ! -d "$PROJECT_DIR" ]; then
    log "❌ Diretório do projeto não encontrado!"
    exit 1
fi

# Verificar dependências do backend
if [ -d "backend" ]; then
    log "🔍 Verificando backend..."
    cd backend
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        log "❌ node_modules do backend não encontrado!"
        exit 1
    fi
    
    # Verificar se Prisma client foi gerado
    if [ ! -d "node_modules/@prisma/client" ]; then
        log "❌ Cliente Prisma não encontrado!"
        log "🔧 Gerando cliente Prisma..."
        npx prisma generate
    fi
    
    # Verificar conexão com banco
    log "🗄️ Verificando conexão com banco..."
    npx prisma db pull --print || log "⚠️ Problema na conexão com banco"
    
    cd ..
fi

# Verificar dependências do frontend
log "🔍 Verificando frontend..."
if [ ! -d "node_modules" ]; then
    log "❌ node_modules do frontend não encontrado!"
    exit 1
fi

# Verificar se o build existe
if [ ! -d "dist" ]; then
    log "❌ Build do frontend não encontrado!"
    exit 1
fi

# Verificar PM2
log "📊 Verificando PM2..."
pm2 status | grep emerson || log "⚠️ Aplicações Emerson não encontradas no PM2"

# Verificar portas
log "🔍 Verificando portas..."
netstat -tulpn | grep :3002 || log "⚠️ Porta 3002 (backend) não está em uso"
netstat -tulpn | grep :3003 || log "⚠️ Porta 3003 (frontend) não está em uso"

# Verificar Nginx
log "🌐 Verificando Nginx..."
nginx -t || log "❌ Configuração Nginx inválida!"

# Testar endpoints
log "🧪 Testando endpoints..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health || log "⚠️ Backend não responde"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 || log "⚠️ Frontend não responde"

log "✅ Verificação concluída!"
echo ""
echo "📊 Status das aplicações:"
pm2 status
echo ""
echo "🌐 URLs:"
echo "   - Frontend: http://localhost:3003"
echo "   - Backend: http://localhost:3002"
echo "   - Produção: https://emersonreis.adv.br"
