const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCobrancas() {
  try {
    console.log('=== CRIANDO COBRANÇAS DE TESTE ===');
    
    // 1. Buscar dados existentes
    const condominio = await prisma.condominio.findFirst();
    const morador = await prisma.morador.findFirst();
    const modeloCarta = await prisma.modeloCarta.findFirst();
    
    if (!condominio || !morador || !modeloCarta) {
      console.log('❌ Dados necessários não encontrados');
      console.log('Condomínio:', !!condominio);
      console.log('Morador:', !!morador);
      console.log('Modelo:', !!modeloCarta);
      return;
    }
    
    console.log('✅ Dados encontrados:');
    console.log(`  Condomínio: ${condominio.nome}`);
    console.log(`  Morador: ${morador.nome}`);
    console.log(`  Modelo: ${modeloCarta.titulo}`);
    
    // 2. Criar cobrança de teste
    const cobranca = await prisma.cobranca.create({
      data: {
        valor: 150.00,
        vencimento: new Date(),
        status: 'PENDENTE',
        statusEnvio: 'NAO_ENVIADO',
        condominioId: condominio.id,
        moradorId: morador.id,
        modeloCartaId: modeloCarta.id,
      },
    });
    
    console.log('✅ Cobrança criada:', cobranca.id);
    
    // 3. Simular envio (atualizar status)
    await prisma.cobranca.update({
      where: { id: cobranca.id },
      data: {
        statusEnvio: 'ENVIADO',
        dataEnvio: new Date(),
      },
    });
    
    console.log('✅ Status atualizado para ENVIADO');
    
    // 4. Verificar resultado
    const cobrancaAtualizada = await prisma.cobranca.findUnique({
      where: { id: cobranca.id },
      include: {
        condominio: true,
        morador: true,
      },
    });
    
    console.log('✅ Cobrança final:');
    console.log(`  ID: ${cobrancaAtualizada.id}`);
    console.log(`  Status: ${cobrancaAtualizada.statusEnvio}`);
    console.log(`  Data Envio: ${cobrancaAtualizada.dataEnvio}`);
    console.log(`  Condomínio: ${cobrancaAtualizada.condominio.nome}`);
    console.log(`  Morador: ${cobrancaAtualizada.morador.nome}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar cobranças de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCobrancas();
