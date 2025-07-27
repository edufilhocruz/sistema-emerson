# ✅ Checklist de Deploy - Sistema Raunaimer

## 🔧 Pré-Deploy

### Servidor
- [ ] Node.js 18+ instalado
- [ ] npm/yarn instalado
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] Serve instalado globalmente (`npm install -g serve`)
- [ ] PostgreSQL instalado e configurado
- [ ] Redis instalado e configurado
- [ ] Nginx instalado (opcional, para proxy reverso)
- [ ] Firewall configurado (portas 3000, 3001, 5432, 6379)

### Banco de Dados
- [ ] Usuário `raunaimer` criado no PostgreSQL
- [ ] Banco `raunaimer` criado
- [ ] Permissões configuradas
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Prisma Client gerado (`npx prisma generate`)

### Configurações
- [ ] Arquivo `env.production` configurado
- [ ] JWT_SECRET alterado para valor seguro
- [ ] Configurações de email definidas
- [ ] URLs da API configuradas
- [ ] Domínio `app.raunaimer.adv.br` configurado no DNS

## 🚀 Deploy

### Execução
- [ ] Código atualizado no servidor
- [ ] Script `deploy.sh` executável (`chmod +x deploy.sh`)
- [ ] Deploy executado (`./deploy.sh production`)
- [ ] PM2 iniciado com sucesso
- [ ] Aplicações rodando nas portas corretas

### Verificações Pós-Deploy
- [ ] Frontend acessível em `http://localhost:3000`
- [ ] Backend acessível em `http://localhost:3001`
- [ ] API respondendo corretamente
- [ ] Logs sem erros críticos
- [ ] Banco de dados conectando
- [ ] Redis funcionando

## 🔒 SSL/HTTPS (Opcional)

### Certificado SSL
- [ ] Domínio apontando para o servidor
- [ ] Nginx configurado
- [ ] Certbot instalado
- [ ] SSL configurado (`./setup-ssl.sh app.raunaimer.adv.br`)
- [ ] HTTPS funcionando
- [ ] Renovação automática configurada

## 📊 Monitoramento

### PM2
- [ ] Status das aplicações verificado (`pm2 status`)
- [ ] Logs monitorados (`pm2 logs`)
- [ ] Configuração salva (`pm2 save`)
- [ ] Startup automático configurado (`pm2 startup`)

### Logs
- [ ] Diretório `logs/` criado
- [ ] Logs sendo gerados
- [ ] Logs sem erros críticos
- [ ] Rotação de logs configurada (opcional)

## 🔄 Atualizações

### Processo de Atualização
- [ ] Backup do banco de dados
- [ ] Código atualizado via git
- [ ] Deploy executado
- [ ] Aplicações reiniciadas
- [ ] Funcionalidades testadas

## 🐛 Troubleshooting

### Problemas Comuns
- [ ] Portas em uso verificadas
- [ ] Permissões de arquivos corretas
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Banco de dados acessível

## 📞 Contatos de Emergência

- **Desenvolvedor**: [Seu contato]
- **DevOps**: [Contato DevOps]
- **Hosting**: [Contato do provedor]

## 📝 Notas Importantes

- Sempre faça backup antes de atualizações
- Monitore os logs regularmente
- Configure alertas de monitoramento
- Mantenha as dependências atualizadas
- Teste em ambiente de staging antes de produção

---

**Última atualização**: $(date)
**Versão do deploy**: [Versão atual] 