#!/bin/bash

echo "🔧 Script de correção do frontend"
echo "=================================="

# 1. Navegar para o diretório
cd /var/www/sistema_raunaimer

# 2. Parar apenas o frontend
echo "🛑 Parando frontend..."
pm2 stop raunaimer-frontend
pm2 delete raunaimer-frontend

# 3. Verificar se o diretório dist existe
if [ ! -d "dist" ]; then
    echo "❌ Diretório dist não encontrado, fazendo build..."
    npm install
    npm run build
fi

# 4. Iniciar apenas o frontend com configuração correta
echo "🚀 Iniciando frontend..."
pm2 start ecosystem.config.cjs --only raunaimer-frontend --env production

# 5. Aguardar inicialização
echo "⏳ Aguardando 5 segundos..."
sleep 5

# 6. Verificar status
echo "📊 Status do PM2:"
pm2 status

# 7. Testar frontend
echo "🔍 Testando frontend na porta 3000..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend está respondendo"
else
    echo "❌ Frontend ainda não está respondendo"
    echo "📋 Logs do frontend:"
    pm2 logs raunaimer-frontend --lines 20 --nostream || true
fi

# 8. Salvar configuração
pm2 save

echo "✅ Correção do frontend concluída!" 