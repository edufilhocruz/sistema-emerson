#!/bin/bash

# Script de Deploy Manual - Sistema Raunaimer
# Conecta no servidor e faz deploy das alterações

echo "🚀 INICIANDO DEPLOY MANUAL - SISTEMA RAUNAIMER"
echo "=============================================="

# Configurações do servidor
SERVER_IP="191.252.111.245"
SERVER_USER="root"
PROJECT_DIR="/var/www/sistema_raunaimer"

echo "📡 Conectando no servidor..."
echo "IP: $SERVER_IP"
echo "Usuário: $SERVER_USER"
echo "Diretório: $PROJECT_DIR"
echo ""

# Comandos para executar no servidor
SSH_COMMANDS="
echo '🔧 PARANDO SERVIÇOS...'
pm2 stop all
pm2 delete all

echo '📁 NAVEGANDO PARA O DIRETÓRIO...'
cd $PROJECT_DIR

echo '🔄 PUXANDO ALTERAÇÕES DO GITHUB...'
git fetch origin
git reset --hard origin/main

echo '🧹 LIMPANDO CACHE...'
rm -rf node_modules
rm -rf backend/node_modules
rm -rf backend/dist

echo '📦 INSTALANDO DEPENDÊNCIAS DO FRONTEND...'
npm install

echo '🏗️ BUILDANDO FRONTEND...'
npm run build

echo '📦 INSTALANDO DEPENDÊNCIAS DO BACKEND...'
cd backend
npm install

echo '🔧 GERANDO CLIENTE PRISMA...'
npx prisma generate

echo '🏗️ BUILDANDO BACKEND...'
npm run build

echo '📁 VOLTANDO PARA DIRETÓRIO RAIZ...'
cd ..

echo '🔄 INICIANDO SERVIÇOS...'
pm2 start ecosystem.config.cjs

echo '⏳ AGUARDANDO SERVIÇOS INICIAREM...'
sleep 5

echo '📊 STATUS DOS SERVIÇOS...'
pm2 status

echo '✅ DEPLOY CONCLUÍDO COM SUCESSO!'
"

# Executa os comandos via SSH
echo "Executando comandos no servidor..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "$SSH_COMMANDS"

echo ""
echo "🎉 DEPLOY MANUAL CONCLUÍDO!"
echo "Acesse: http://app.raunaimer.adv.br"
echo ""
echo "Para verificar os logs:"
echo "ssh $SERVER_USER@$SERVER_IP 'pm2 logs raunaimer-backend --lines 50'" 