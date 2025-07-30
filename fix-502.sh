#!/bin/bash

echo "🔧 Script de correção do erro 502 Bad Gateway"
echo "=============================================="

# 1. Verificar se estamos no diretório correto
cd /var/www/sistema_raunaimer || {
    echo "❌ Diretório /var/www/sistema_raunaimer não encontrado"
    exit 1
}

echo "✅ Diretório correto: $(pwd)"

# 2. Verificar status do PM2
echo ""
echo "📊 Status atual do PM2:"
pm2 status

# 3. Parar e remover todas as aplicações PM2
echo ""
echo "🛑 Parando e removendo aplicações PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 4. Verificar se o arquivo ecosystem.config.cjs existe
if [ ! -f "ecosystem.config.cjs" ]; then
    echo "❌ Arquivo ecosystem.config.cjs não encontrado"
    exit 1
fi

echo "✅ Arquivo ecosystem.config.cjs encontrado"

# 5. Verificar se o build existe
if [ ! -d "dist" ]; then
    echo "❌ Diretório dist não encontrado, fazendo build..."
    npm install
    npm run build
fi

if [ ! -d "backend/dist" ]; then
    echo "❌ Diretório backend/dist não encontrado, fazendo build..."
    cd backend
    npm install
    npm run build
    cd ..
fi

# 6. Iniciar PM2
echo ""
echo "🚀 Iniciando aplicações com PM2..."
pm2 start ecosystem.config.cjs --env production

# 7. Salvar configuração PM2
pm2 save

# 8. Aguardar um pouco
echo ""
echo "⏳ Aguardando 10 segundos para aplicações inicializarem..."
sleep 10

# 9. Verificar status
echo ""
echo "📊 Status do PM2 após inicialização:"
pm2 status

# 10. Testar backend
echo ""
echo "🔍 Testando backend na porta 3001..."
if curl -f http://localhost:3001/api/condominio > /dev/null 2>&1; then
    echo "✅ Backend está respondendo"
else
    echo "❌ Backend não está respondendo"
    echo "📋 Logs do backend:"
    pm2 logs raunaimer-backend --lines 20 --nostream || true
fi

# 11. Testar frontend
echo ""
echo "🔍 Testando frontend na porta 3000..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend está respondendo"
else
    echo "❌ Frontend não está respondendo"
    echo "📋 Logs do frontend:"
    pm2 logs raunaimer-frontend --lines 10 --nostream || true
fi

# 12. Verificar Nginx
echo ""
echo "🔍 Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx está ativo"
else
    echo "❌ Nginx não está ativo, reiniciando..."
    systemctl restart nginx
fi

# 13. Testar configuração do Nginx
echo ""
echo "🔍 Testando configuração do Nginx..."
nginx -t

# 14. Reiniciar Nginx
echo ""
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# 15. Teste final
echo ""
echo "🌐 Teste final da aplicação:"
curl -I http://app.raunaimer.adv.br || echo "❌ Aplicação ainda não está acessível"

echo ""
echo "✅ Script de correção concluído!"
echo "📋 Se ainda houver problemas, verifique os logs acima." 