#!/bin/bash

# Script para configurar SSL com Let's Encrypt
# Uso: ./setup-ssl.sh app.raunaimer.adv.br

set -e

DOMAIN=${1:-app.raunaimer.adv.br}
EMAIL="admin@raunaimer.adv.br"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

log "🔒 Configurando SSL para $DOMAIN"

# Verificar se certbot está instalado
if ! command -v certbot &> /dev/null; then
    log "📦 Instalando certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    log "📦 Instalando Nginx..."
    sudo apt-get install -y nginx
fi

# Criar configuração temporária do Nginx para validação
log "📝 Criando configuração temporária do Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obter certificado SSL
log "🔐 Obtendo certificado SSL..."
sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive

# Configurar renovação automática
log "🔄 Configurando renovação automática..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

log "✅ SSL configurado com sucesso!"
log "🌐 Acesse: https://$DOMAIN"
log "🔄 O certificado será renovado automaticamente"

# Verificar status
sudo certbot certificates 