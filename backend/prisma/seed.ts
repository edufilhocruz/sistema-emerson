import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('Raunaimer1010*', 10);
  
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@raunaimer.adv.br' },
    update: {
      senha: adminPassword,
      role: 'ADMIN',
    },
    create: {
      id: 'admin-001',
      nome: 'Administrador',
      email: 'admin@raunaimer.adv.br',
      senha: adminPassword,
      role: 'ADMIN',
    },
  });

  // Criar condomínio de teste
  const condominio = await prisma.condominio.upsert({
    where: { id: '8cd107df-89b4-436b-8d25-e948702f62bb' },
    update: {},
    create: {
      id: '8cd107df-89b4-436b-8d25-e948702f62bb',
      nome: 'Condomínio Teste',
      cnpj: '12.345.678/0001-90',
      cep: '01234-567',
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      administradora: 'Administradora Teste',
    },
  });

  // Criar morador de teste
  const morador = await prisma.morador.upsert({
    where: { id: '6759df5e-3e9a-4f8a-a93d-578a6355bd3b' },
    update: {},
    create: {
      id: '6759df5e-3e9a-4f8a-a93d-578a6355bd3b',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      bloco: 'A',
      apartamento: '101',
      condominioId: condominio.id,
      statusPagamento: 'PENDENTE',
    },
  });

  // Criar modelo de carta de teste
  const modeloCarta = await prisma.modeloCarta.upsert({
    where: { id: '12c96b40-9237-4277-abe4-0b9aba60e670' },
    update: {},
    create: {
      id: '12c96b40-9237-4277-abe4-0b9aba60e670',
      titulo: 'Cobrança de Aluguel',
      conteudo: 'Prezado(a) morador(a),\n\nInformamos que o aluguel do mês está em atraso.\n\nAtenciosamente,\nAdministração',
    },
  });

  // Criar configuração de email
  const emailConfig = await prisma.emailConfig.upsert({
    where: { id: 'email-config-001' },
    update: {
      host: 'smtp.zoho.com',
      port: 587,
      user: 'contato@raunaimer.adv.br',
      pass: 'Raunaimer1010*',
      from: 'contato@raunaimer.adv.br',
      secure: false,
    },
    create: {
      id: 'email-config-001',
      host: 'smtp.zoho.com',
      port: 587,
      user: 'contato@raunaimer.adv.br',
      pass: 'Raunaimer1010*',
      from: 'contato@raunaimer.adv.br',
      secure: false,
    },
  });

  console.log('Usuário administrador criado:', adminUser.email);
  console.log('Condomínio criado:', condominio.nome);
  console.log('Morador criado:', morador.nome);
  console.log('Modelo de carta criado:', modeloCarta.titulo);
  console.log('Configuração de email criada:', emailConfig.user);
  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 