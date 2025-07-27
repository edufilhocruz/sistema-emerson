# 🔧 Configuração do GitHub Actions - Sistema Raunaimer

Este guia explica como configurar o GitHub Actions para deploy automático.

## 📋 Pré-requisitos

1. **Repositório no GitHub** com o código do projeto
2. **Servidor configurado** com o script `setup-server.sh`
3. **Acesso SSH** ao servidor
4. **Permissões de administrador** no repositório GitHub

## 🔑 Passo 1: Configurar Chaves SSH

### 1.1 Gerar chave SSH no servidor

```bash
# Conectar ao servidor
ssh usuario@seu-servidor.com

# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# Ver a chave pública
cat ~/.ssh/github_actions.pub
```

### 1.2 Adicionar chave pública ao servidor

```bash
# Adicionar ao authorized_keys do usuário deploy
cat ~/.ssh/github_actions.pub >> /home/deploy/.ssh/authorized_keys

# Configurar permissões
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.3 Copiar chave privada

```bash
# Ver a chave privada (você vai precisar dela)
cat ~/.ssh/github_actions
```

## 🔐 Passo 2: Configurar Secrets no GitHub

### 2.1 Acessar configurações do repositório

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### 2.2 Adicionar secrets

Clique em **New repository secret** e adicione:

#### `SSH_PASSWORD`
- **Nome**: `SSH_PASSWORD`
- **Valor**: `Du@05arqbO#259Q`

#### `SERVER_HOST`
- **Nome**: `SERVER_HOST`
- **Valor**: `191.252.111.245`

#### `SERVER_USER`
- **Nome**: `SERVER_USER`
- **Valor**: `root`

## 🚀 Passo 3: Configurar o Servidor

### 3.1 Executar script de configuração

```bash
# No servidor, como root
sudo ./setup-server.sh
```

### 3.2 Clone o repositório

```bash
# Como usuário deploy
sudo -u deploy git clone https://github.com/edufilhocruz/sistema-raunaimer-v2.git /var/www/sistema_raunaimer
```

### 3.3 Configurar variáveis de ambiente

```bash
# Copiar arquivo de ambiente
sudo -u deploy cp /var/www/sistema_raunaimer/env.production /var/www/sistema_raunaimer/.env

# Editar configurações
sudo -u deploy nano /var/www/sistema_raunaimer/.env
```

## 🔄 Passo 4: Testar o Deploy

### 4.1 Fazer push para o GitHub

```bash
# No seu computador local
git add .
git commit -m "Configuração inicial do CI/CD"
git push origin main
```

### 4.2 Verificar o workflow

1. Vá para a aba **Actions** no GitHub
2. Você verá o workflow **Test and Build** executando
3. Se os testes passarem, o **Deploy to Production** será executado

### 4.3 Verificar logs

```bash
# No servidor
sudo -u deploy pm2 logs
sudo -u deploy pm2 status
```

## 📊 Monitoramento

### GitHub Actions

- **Aba Actions**: Veja todos os deploys
- **Status**: Verde = sucesso, Vermelho = erro
- **Logs**: Clique no job para ver logs detalhados

### Servidor

```bash
# Status das aplicações
pm2 status

# Logs em tempo real
pm2 logs

# Monitor de recursos
pm2 monit
```

## 🐛 Troubleshooting

### Problemas comuns:

#### 1. **Erro de SSH**
```
Error: Permission denied (publickey)
```
**Solução**: Verificar se a chave SSH está correta nos secrets

#### 2. **Erro de permissão**
```
Error: EACCES: permission denied
```
**Solução**: Verificar permissões do usuário deploy

#### 3. **Erro de build**
```
Error: Build failed
```
**Solução**: Verificar logs do GitHub Actions

#### 4. **Aplicação não inicia**
```
Error: Port already in use
```
**Solução**: Verificar se as portas estão livres

### Comandos úteis:

```bash
# Verificar status do PM2
pm2 status

# Reiniciar aplicações
pm2 restart all

# Ver logs de erro
pm2 logs --err

# Verificar portas em uso
sudo lsof -i :3000
sudo lsof -i :3001
```

## 🔒 Segurança

### Recomendações:

1. **Use HTTPS** para o repositório
2. **Configure branch protection** no GitHub
3. **Use secrets** para dados sensíveis
4. **Monitore logs** regularmente
5. **Configure firewall** no servidor
6. **Mantenha dependências atualizadas**

## 📝 Estrutura dos Workflows

### `.github/workflows/test.yml`
- Executa em: push e pull requests
- Testa o código
- Faz build das aplicações
- Não faz deploy

### `.github/workflows/deploy.yml`
- Executa em: push para main/master
- Faz deploy automático
- Requer testes aprovados

## 🔄 Fluxo de Trabalho

1. **Desenvolver** → Fazer alterações no código
2. **Commit** → `git add . && git commit -m "descrição"`
3. **Push** → `git push origin main`
4. **Testes** → GitHub Actions executa testes
5. **Deploy** → Se testes passarem, faz deploy automático
6. **Monitoramento** → Verificar logs e status

## 📞 Suporte

Para problemas:
1. Verifique os logs do GitHub Actions
2. Verifique os logs do PM2 no servidor
3. Consulte a documentação do GitHub Actions
4. Verifique a configuração dos secrets 