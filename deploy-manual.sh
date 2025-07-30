#!/bin/bash
set -e

echo "🚀 Iniciando deploy manual..."

# Navegar para o diretório do projeto
cd /var/www/sistema_raunaimer

# Parar e remover todas as aplicações PM2
echo "🛑 Parando todas as aplicações..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Fazer pull das mudanças
echo "📥 Fazendo pull das mudanças..."
git fetch origin main
git reset --hard origin/main

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Instalar dependências
echo "📦 Instalando dependências do frontend..."
npm install

echo "📦 Instalando dependências do backend..."
cd backend && npm install && cd ..

# Build
echo "🔨 Build do frontend..."
npm run build

echo "🔨 Build do backend..."
cd backend && npm run build && cd ..

# Criar logs
echo "📁 Criando diretório de logs..."
mkdir -p logs

# Iniciar PM2
echo "🚀 Iniciando aplicações com PM2..."
# Garantir que o arquivo está com extensão correta
if [ -f "ecosystem.config.js" ]; then
  mv ecosystem.config.js ecosystem.config.cjs
fi
pm2 start ecosystem.config.cjs --env production
pm2 save

# Verificar status
echo "📊 Status das aplicações:"
pm2 status

# Testar aplicações
echo "🌐 Testando aplicações..."
sleep 5
curl -I http://localhost:3001 || echo "❌ Backend não está respondendo"
curl -I http://localhost:3000 || echo "❌ Frontend não está respondendo"

echo "✅ Deploy manual concluído!"
echo "🌐 Aplicação disponível em: http://app.raunaimer.adv.br" 