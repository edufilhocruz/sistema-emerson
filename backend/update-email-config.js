const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://emersonadv1:qbO%23259Qq@emersonadv1.postgresql.dbaas.com.br:5432/emersonadv1'
    }
  }
});

async function updateEmailConfig() {
  try {
    // Buscar configuração existente
    const existingConfig = await prisma.emailConfig.findFirst();
    
    if (!existingConfig) {
      console.log('❌ Configuração de email não encontrada. Criando nova configuração...');
      
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
      
      console.log('✅ Configuração de email criada com sucesso:', emailConfig);
    } else {
      console.log('🔍 Configuração existente encontrada:', {
        id: existingConfig.id,
        user: existingConfig.user,
        from: existingConfig.from
      });
      
      // Atualizar email para Gmail
      const updatedConfig = await prisma.emailConfig.update({
        where: { id: existingConfig.id },
        data: {
          host: 'smtp.gmail.com',
          port: 587,
          user: 'juridico.emersonreis@gmail.com',
          pass: 'Juridico1010*',
          from: 'juridico.emersonreis@gmail.com',
          secure: false,
        },
      });
      
      console.log('✅ Configuração de email atualizada com sucesso:', {
        id: updatedConfig.id,
        user: updatedConfig.user,
        from: updatedConfig.from,
        host: updatedConfig.host,
        port: updatedConfig.port
      });
      console.log('📧 Email configurado: juridico.emersonreis@gmail.com');
      console.log('⚠️  IMPORTANTE: Para Gmail, você pode precisar de uma "App Password" se a autenticação de dois fatores estiver ativada.');
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração de email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmailConfig();

