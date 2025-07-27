# 🚀 Sistema Raunaimer – Gestão Inteligente de Condomínios

Bem-vindo ao **Sistema Raunaimer**, a solução definitiva para transformar a gestão do seu condomínio! 

Com uma plataforma moderna, intuitiva e 100% digital, você automatiza cobranças, reduz inadimplência, centraliza comunicação e tem controle total sobre tudo o que acontece no seu condomínio – tudo em um só lugar! 😍

---

## ✨ Principais Diferenciais

- 🏢 **Gestão Completa de Condomínios e Moradores**
- 💸 **Cobranças Automáticas** (individual e em massa) com envio por e-mail
- 📄 **Modelos de Carta Dinâmicos** com variáveis inteligentes
- 📊 **Dashboard em Tempo Real**: indicadores, inadimplência, cobranças e tarefas do dia
- 🔒 **Gestão de Usuários e Permissões** (Admin/Operador)
- 📬 **Configuração de E-mail SMTP** fácil e segura
- 🕵️‍♂️ **Logs e Auditoria**: tudo registrado, máxima transparência
- 📈 **Relatórios Profissionais** de inadimplência e cobranças

---

## 🚦 Como Começar

### 1. Backend (NestJS)
```bash
cd backend
npm install
npx prisma migrate dev # Gera as tabelas no banco
npm run start:dev
```
- Backend: http://localhost:3000
- Configure o arquivo `.env` com dados do banco e SMTP

### 2. Frontend (React + Vite)
```bash
npm install
npm run dev
```
- Frontend: http://localhost:8080

---

## ⚡️ Por que escolher o Raunaimer?
- **Reduza a inadimplência** com cobranças automáticas e comunicação eficiente
- **Economize tempo**: tudo digital, sem planilhas manuais
- **Tenha segurança jurídica**: histórico, logs e auditoria de todas as ações
- **Aumente a transparência**: moradores e administradores sempre informados
- **Escalável**: pronto para condomínios de qualquer porte

---

## 🛠️ Configuração de E-mail
- Menu **Configurações > E-mail**: cadastre SMTP, remetente e senha.
- O sistema usa sempre a configuração mais recente para enviar cobranças.

## 👥 Usuários e Permissões
- Crie usuários **Admin** (acesso total) ou **Operador** (restrito) em **Configurações > Usuários**.

---

## 💡 Observações
- Requer **PostgreSQL** e **Redis** instalados localmente.
- Stack moderna: Prisma ORM, NestJS, React, Vite, Radix UI, Lucide Icons e mais.

## 🚀 Deploy Teste - Sun Jul 27 20:48:06 -03 2025
