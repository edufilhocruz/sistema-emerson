#!/bin/bash

# Script para fazer push inicial para o GitHub
# Uso: ./push-to-github.sh

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

log "🚀 Preparando push para GitHub..."

# Verificar se git está configurado
if ! git config --get user.name > /dev/null 2>&1; then
    error "Git não está configurado. Configure com: git config --global user.name 'Seu Nome'"
fi

if ! git config --get user.email > /dev/null 2>&1; then
    error "Git não está configurado. Configure com: git config --global user.email 'seu-email@exemplo.com'"
fi

# Verificar se o repositório remoto está configurado
if ! git remote get-url origin > /dev/null 2>&1; then
    log "📡 Configurando repositório remoto..."
    git remote add origin https://github.com/edufilhocruz/sistema_raunaimer.git
fi

# Verificar se há mudanças para commitar
if git diff --quiet && git diff --cached --quiet; then
    warn "Nenhuma mudança detectada para commitar"
else
    log "📝 Adicionando arquivos..."
    git add .
    
    log "💾 Fazendo commit..."
    git commit -m "feat: Configuração completa de CI/CD com PM2 e GitHub Actions

- Adicionado ecosystem.config.js para PM2
- Criado deploy.sh para deploy automatizado
- Configurado GitHub Actions workflows
- Adicionado setup-server.sh para configuração do servidor
- Criado documentação completa de deploy
- Configurado nginx.conf para proxy reverso
- Adicionado setup-ssl.sh para certificados SSL
- Criado webhook-config.json para notificações
- Atualizado package.json com scripts úteis
- Configurado domínio app.raunaimer.adv.br"
fi

# Verificar se a branch main existe
if ! git branch --list | grep -q "main"; then
    log "🌿 Criando branch main..."
    git checkout -b main
fi

log "📤 Fazendo push para GitHub..."
git push -u origin main

log "✅ Push concluído com sucesso!"
echo ""
echo "🎉 Próximos passos:"
echo "1. Configure os secrets no GitHub:"
echo "   - Vá para: https://github.com/edufilhocruz/sistema_raunaimer/settings/secrets/actions"
echo "   - Adicione: SSH_PRIVATE_KEY, SERVER_HOST, SERVER_USER"
echo ""
echo "2. Configure o servidor:"
echo "   - Execute: sudo ./setup-server.sh"
echo ""
echo "3. Teste o deploy:"
echo "   - Faça uma pequena alteração e push"
echo "   - Verifique na aba Actions do GitHub"
echo ""
echo "🔗 Repositório: https://github.com/edufilhocruz/sistema_raunaimer" 