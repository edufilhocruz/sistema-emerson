#!/bin/bash

# Script para configurar SSL - Sistema Emerson Reis
# Para ser executado no servidor 191.252.111.245

set -e

echo "🔒 Configurando SSL para emersonreis.adv.br..."

# Verificar se o domínio está apontando para o servidor
echo "🌐 Verificando DNS..."
echo "Certifique-se de que emersonreis.adv.br está apontando para 191.252.111.245"
echo "Pressione Enter para continuar..."
read

# Instalar Certbot se não estiver instalado
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Parar Nginx temporariamente
echo "🛑 Parando Nginx..."
systemctl stop nginx

# Gerar certificado SSL
echo "🔐 Gerando certificado SSL..."
certbot certonly --standalone -d emersonreis.adv.br --non-interactive --agree-tos --email admin@emersonreis.adv.br

# Verificar se o certificado foi criado
if [ -f "/etc/letsencrypt/live/emersonreis.adv.br/fullchain.pem" ]; then
    echo "✅ Certificado SSL criado com sucesso!"
else
    echo "❌ Erro ao criar certificado SSL"
    exit 1
fi

# Configurar renovação automática
echo "🔄 Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Reiniciar Nginx
echo "🚀 Reiniciando Nginx..."
systemctl start nginx
systemctl reload nginx

# Testar configuração SSL
echo "🧪 Testando configuração SSL..."
nginx -t

echo ""
echo "✅ SSL configurado com sucesso!"
echo "🌐 Sistema Emerson Reis: https://emersonreis.adv.br"
echo "🔒 Certificado válido até: $(openssl x509 -in /etc/letsencrypt/live/emersonreis.adv.br/fullchain.pem -noout -dates | grep notAfter | cut -d= -f2)"
echo ""
echo "📋 Comandos úteis:"
echo "   - Verificar status SSL: curl -I https://emersonreis.adv.br"
echo "   - Renovar certificado: certbot renew"
echo "   - Ver logs: tail -f /var/log/nginx/emerson-error.log"
