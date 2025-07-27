#!/bin/bash

# Script para configurar servidor para CI/CD
# Uso: ./setup-server.sh

set -e

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

log "🚀 Configurando servidor para CI/CD"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Execute este script como root (sudo)"
fi

# Atualizar sistema
log "📦 Atualizando sistema..."
apt-get update
apt-get upgrade -y

# Instalar dependências
log "📦 Instalando dependências..."
apt-get install -y curl wget git nginx postgresql postgresql-contrib redis-server

# Instalar Node.js
log "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalar PM2 e Serve globalmente
log "📦 Instalando PM2 e Serve..."
npm install -g pm2 serve

# Criar usuário para deploy
log "👤 Criando usuário deploy..."
useradd -m -s /bin/bash deploy || true
usermod -aG sudo deploy

# Configurar SSH para deploy
log "🔑 Configurando SSH..."
mkdir -p /home/deploy/.ssh
chown deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Criar diretório do projeto
log "📁 Criando diretório do projeto..."
mkdir -p /var/www/sistema_raunaimer
chown deploy:deploy /var/www/sistema_raunaimer

# Configurar PostgreSQL
log "🗄️ Configurando PostgreSQL..."
sudo -u postgres psql << EOF
CREATE USER raunaimer WITH PASSWORD 'qbO#259Qq';
CREATE DATABASE raunaimer OWNER raunaimer;
GRANT ALL PRIVILEGES ON DATABASE raunaimer TO raunaimer;
\q
EOF

# Configurar Redis
log "🔴 Configurando Redis..."
systemctl enable redis-server
systemctl start redis-server

# Configurar Nginx
log "🌐 Configurando Nginx..."
cp nginx.conf /etc/nginx/sites-available/sistema_raunaimer
ln -sf /etc/nginx/sites-available/sistema_raunaimer /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

# Configurar firewall
log "🔥 Configurando firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 3001
ufw --force enable

# Criar diretório de logs
log "📝 Criando diretório de logs..."
mkdir -p /var/www/sistema_raunaimer/logs
chown deploy:deploy /var/www/sistema_raunaimer/logs

# Configurar PM2 startup
log "⚡ Configurando PM2 startup..."
sudo -u deploy pm2 startup systemd -u deploy --hp /home/deploy

# Criar script de deploy
log "📜 Criando script de deploy..."
cat > /var/www/sistema_raunaimer/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# Navegar para o diretório
cd /var/www/sistema_raunaimer

# Fazer pull das mudanças
git pull origin main

# Instalar dependências
npm install
cd backend && npm install && cd ..

# Build das aplicações
npm run build
cd backend && npm run build && cd ..

# Parar aplicações existentes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar com PM2
pm2 start ecosystem.config.js --env production

# Salvar configuração
pm2 save

echo "✅ Deploy concluído!"
pm2 status
EOF

chmod +x /var/www/sistema_raunaimer/deploy.sh
chown deploy:deploy /var/www/sistema_raunaimer/deploy.sh

# Configurar permissões
log "🔐 Configurando permissões..."
chown -R deploy:deploy /var/www/sistema_raunaimer

# Instruções finais
log "✅ Servidor configurado com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure as chaves SSH no GitHub:"
echo "   - Gere uma chave SSH: ssh-keygen -t rsa -b 4096 -C 'github-actions'"
echo "   - Adicione a chave pública ao servidor: cat ~/.ssh/id_rsa.pub >> /home/deploy/.ssh/authorized_keys"
echo "   - Adicione a chave privada como secret SSH_PRIVATE_KEY no GitHub"
echo ""
echo "2. Configure os secrets no GitHub:"
echo "   - SSH_PRIVATE_KEY: Chave privada SSH"
echo "   - SERVER_HOST: IP ou domínio do servidor"
echo "   - SERVER_USER: deploy"
echo ""
echo "3. Clone o repositório:"
echo "   sudo -u deploy git clone https://github.com/edufilhocruz/sistema-raunaimer-v2.git /var/www/sistema_raunaimer"
echo ""
echo "4. Configure as variáveis de ambiente:"
echo "   sudo -u deploy cp env.production /var/www/sistema_raunaimer/.env"
echo ""
echo "5. Execute o primeiro deploy:"
echo "   sudo -u deploy /var/www/sistema_raunaimer/deploy.sh" 