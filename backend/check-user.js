const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Busca o usuário
    const user = await prisma.usuario.findUnique({
      where: { email: 'admin@raunaimer.adv.br' }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('ID:', user.id);
    console.log('Nome:', user.nome);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Senha hash:', user.senha);
    
    // Testa a senha
    const senhaTeste = 'Raunaimer1010*';
    const senhaValida = await bcrypt.compare(senhaTeste, user.senha);
    
    console.log('\n🔐 Teste de senha:');
    console.log('Senha testada:', senhaTeste);
    console.log('Senha válida:', senhaValida);
    
    if (senhaValida) {
      console.log('✅ Senha está correta!');
    } else {
      console.log('❌ Senha incorreta!');
      
      // Recria a senha
      console.log('\n🔄 Recriando senha...');
      const novaSenhaHash = await bcrypt.hash(senhaTeste, 10);
      
      await prisma.usuario.update({
        where: { email: 'admin@raunaimer.adv.br' },
        data: { senha: novaSenhaHash }
      });
      
      console.log('✅ Senha recriada com sucesso!');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 