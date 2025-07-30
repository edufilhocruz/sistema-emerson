#!/bin/bash
set -e

echo "🚀 Iniciando deploy limpo do zero..."

# Navegar para o diretório do projeto
cd /var/www/sistema_raunaimer

# Parar e remover todas as aplicações PM2
echo "🛑 Parando todas as aplicações..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Limpar completamente o diretório
echo "🧹 Limpando diretório..."
rm -rf *
rm -rf .git

# Clonar o repositório novamente
echo "📥 Clonando repositório..."
git clone https://github.com/edufilhocruz/sistema-raunaimer-v2.git .
chown -R deploy:deploy /var/www/sistema_raunaimer

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

# Build do frontend
echo "🔨 Build do frontend..."
npm run build

# Build do backend
echo "🔨 Build do backend..."
cd backend
npm run build
cd ..

# Criar diretório de logs
echo "📁 Criando diretório de logs..."
mkdir -p logs

# Iniciar aplicações com PM2
echo "🚀 Iniciando aplicações com PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save

# Verificar status
echo "📊 Status das aplicações:"
pm2 status

# Testar aplicação
echo "🌐 Testando aplicação..."
sleep 5
curl -I http://localhost:3001 || echo "❌ Backend não está respondendo"
curl -I http://localhost:3000 || echo "❌ Frontend não está respondendo"

echo "✅ Deploy limpo concluído!"
echo "🌐 Aplicação disponível em: http://app.raunaimer.adv.br" 