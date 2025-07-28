import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@raunaimer.adv.br' },
    update: {},
    create: {
      id: 'admin-001',
      nome: 'Administrador',
      email: 'admin@raunaimer.adv.br',
      senha: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Usuário administrador criado:', adminUser.email);
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