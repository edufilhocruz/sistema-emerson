#!/bin/bash

# Script Completo de Deploy - Sistema Emerson Reis
# Execute este script no servidor para resolver tudo de uma vez

set -e

echo "🚀 Deploy Completo do Sistema Emerson Reis..."

PROJECT_DIR="/var/www/sistema-emerson"
LOG_FILE="/var/log/emerson-deploy-complete.log"

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

cd $PROJECT_DIR

# 1. Criar arquivo .env
log "⚙️ Configurando variáveis de ambiente..."
cp env.emerson .env
log "✅ Arquivo .env criado"

# 2. Executar migrações do banco
log "🗄️ Executando migrações do banco..."
cd backend
npx prisma migrate deploy
log "✅ Migrações executadas"
cd ..

# 3. Build do frontend
log "🔨 Fazendo build do frontend..."
npm run build
log "✅ Build do frontend concluído"

# 4. Build do backend
log "🔨 Fazendo build do backend..."
cd backend
npm run build
log "✅ Build do backend concluído"
cd ..

# 5. Configurar logs
log "📝 Configurando logs..."
mkdir -p logs
touch logs/emerson-backend-error.log
touch logs/emerson-backend-out.log
touch logs/emerson-backend-combined.log
touch logs/emerson-frontend-error.log
touch logs/emerson-frontend-out.log
touch logs/emerson-frontend-combined.log
log "✅ Logs configurados"

# 6. Iniciar aplicações com PM2
log "🚀 Iniciando aplicações com PM2..."
pm2 start ecosystem.emerson.config.cjs
pm2 save
log "✅ Aplicações iniciadas no PM2"

# 7. Configurar Nginx
log "🌐 Configurando Nginx..."
cp nginx.emerson.conf /etc/nginx/sites-available/emersonreis.adv.br

# Criar link simbólico se não existir
if [ ! -L "/etc/nginx/sites-enabled/emersonreis.adv.br" ]; then
    ln -s /etc/nginx/sites-available/emersonreis.adv.br /etc/nginx/sites-enabled/
fi

# Testar configuração Nginx
nginx -t

# Recarregar Nginx
systemctl reload nginx
log "✅ Nginx configurado"

# 8. Verificar status
log "📊 Verificando status das aplicações..."
pm2 status

log "✅ Deploy completo concluído!"
echo ""
echo "🎉 Sistema Emerson Reis funcionando!"
echo "📱 Frontend: http://localhost:3003"
echo "🔧 Backend: http://localhost:3002"
echo "🌐 Produção: https://emersonreis.adv.br (após configurar SSL)"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configurar SSL: ./setup-ssl-emerson.sh"
echo "   2. Monitorar: pm2 monit"
echo "   3. Ver logs: pm2 logs"
