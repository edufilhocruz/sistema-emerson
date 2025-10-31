const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createEmailConfig() {
  try {
    // Primeiro, verifica se já existe uma configuração
    const existingConfig = await prisma.emailConfig.findFirst();
    
    if (existingConfig) {
      console.log('Configuração de email já existe:', existingConfig);
      return;
    }
    
    const emailConfig = await prisma.emailConfig.create({
      data: {
        host: 'smtp.gmail.com',
        port: 587,
        user: 'juridico.emersonreis@gmail.com',
        pass: 'Juridico1010*',
        from: 'juridico.emersonreis@gmail.com',
        secure: false,
      },
    });
    
    console.log('Configuração de email criada com sucesso:', emailConfig);
  } catch (error) {
    console.error('Erro ao criar configuração de email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmailConfig(); 