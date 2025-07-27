# 🌐 Configuração do Domínio - app.raunaimer.adv.br

## 📋 Configurações do Domínio

### DNS Configuration

Configure os seguintes registros DNS para o domínio `raunaimer.adv.br`:

```
# Registro A para o subdomínio app
app.raunaimer.adv.br.    A    [IP_DO_SERVIDOR]

# Registro CNAME (alternativa)
app.raunaimer.adv.br.    CNAME    raunaimer.adv.br.
```

### SSL Certificate

O certificado SSL será configurado automaticamente via Let's Encrypt:

```bash
# Configurar SSL
./setup-ssl.sh app.raunaimer.adv.br
```

### URLs de Acesso

- **Frontend**: https://app.raunaimer.adv.br
- **Backend API**: https://app.raunaimer.adv.br/api
- **Swagger Docs**: https://app.raunaimer.adv.br/api/docs

### Configurações de Ambiente

```bash
# Frontend
VITE_API_URL=https://app.raunaimer.adv.br/api
VITE_APP_NAME=Sistema Raunaimer

# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://raunaimer:qbO#259Qq@localhost:5432/raunaimer
REDIS_URL=redis://localhost:6379
```

### Nginx Configuration

O Nginx está configurado para:
- Redirecionar HTTP → HTTPS
- Servir frontend na raiz (/)
- Proxy API para /api/
- Configuração SSL automática
- Compressão gzip habilitada
- Headers de segurança

### Portas Utilizadas

- **80**: HTTP (redireciona para HTTPS)
- **443**: HTTPS (SSL)
- **3000**: Frontend (interno)
- **3001**: Backend (interno)
- **5432**: PostgreSQL
- **6379**: Redis

### Monitoramento

```bash
# Verificar status do domínio
curl -I https://app.raunaimer.adv.br

# Verificar certificado SSL
openssl s_client -connect app.raunaimer.adv.br:443 -servername app.raunaimer.adv.br

# Verificar DNS
nslookup app.raunaimer.adv.br
dig app.raunaimer.adv.br
```

### Troubleshooting

#### Problemas comuns:

1. **DNS não resolve**:
   ```bash
   # Verificar propagação DNS
   dig app.raunaimer.adv.br +trace
   ```

2. **SSL não funciona**:
   ```bash
   # Renovar certificado
   sudo certbot renew --dry-run
   ```

3. **Site não carrega**:
   ```bash
   # Verificar Nginx
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **API não responde**:
   ```bash
   # Verificar PM2
   pm2 status
   pm2 logs
   ```

### Backup e Restore

```bash
# Backup do certificado SSL
sudo tar -czf ssl-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/live/app.raunaimer.adv.br/

# Backup da configuração Nginx
sudo cp /etc/nginx/sites-available/sistema_raunaimer /backup/nginx-sistema_raunaimer-$(date +%Y%m%d).conf
```

### Segurança

- ✅ HTTPS obrigatório
- ✅ Headers de segurança configurados
- ✅ Firewall configurado
- ✅ Certificado SSL válido
- ✅ Redirecionamento HTTP → HTTPS 