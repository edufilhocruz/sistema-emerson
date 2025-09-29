const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDashboard() {
  try {
    console.log('=== DEBUG DASHBOARD ===');
    
    // 1. Verificar todas as cobranças
    const todasCobrancas = await prisma.cobranca.findMany({
      include: {
        condominio: true,
        morador: true,
      },
      orderBy: { dataEnvio: 'desc' }
    });
    
    console.log(`\n📊 Total de cobranças: ${todasCobrancas.length}`);
    console.log('Cobranças por status:');
    const statusCount = {};
    todasCobrancas.forEach(c => {
      statusCount[c.statusEnvio] = (statusCount[c.statusEnvio] || 0) + 1;
    });
    console.log(statusCount);
    
    // 2. Verificar cobranças enviadas no mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
    
    console.log(`\n📅 Período atual: ${inicioMes.toISOString()} até ${fimMes.toISOString()}`);
    
    const cobrancasEnviadas = await prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: inicioMes, lte: fimMes },
        statusEnvio: 'ENVIADO',
      },
      include: {
        condominio: true,
      },
    });
    
    console.log(`\n✅ Cobranças enviadas no mês: ${cobrancasEnviadas.length}`);
    
    // 3. Verificar condomínios únicos com cobranças enviadas
    const condominiosComCobranca = await prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: inicioMes, lte: fimMes },
        statusEnvio: 'ENVIADO',
      },
      select: {
        condominioId: true,
        condominio: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      distinct: ['condominioId'],
    });
    
    console.log(`\n🏢 Condomínios com cobranças enviadas: ${condominiosComCobranca.length}`);
    condominiosComCobranca.forEach(c => {
      console.log(`  - ${c.condominio.nome} (ID: ${c.condominioId})`);
    });
    
    // 4. Verificar todos os condomínios
    const todosCondominios = await prisma.condominio.findMany({
      select: {
        id: true,
        nome: true,
      },
    });
    
    console.log(`\n🏘️ Total de condomínios: ${todosCondominios.length}`);
    todosCondominios.forEach(c => {
      console.log(`  - ${c.nome} (ID: ${c.id})`);
    });
    
    // 5. Verificar condomínios pendentes
    const condominiosCobradosIds = condominiosComCobranca.map(c => c.condominioId);
    const condominiosPendentes = todosCondominios.filter(condo => 
      !condominiosCobradosIds.includes(condo.id)
    );
    
    console.log(`\n⏳ Condomínios pendentes: ${condominiosPendentes.length}`);
    condominiosPendentes.forEach(c => {
      console.log(`  - ${c.nome} (ID: ${c.id})`);
    });
    
    // 6. Verificar dados do dashboard
    const dashboardData = {
      totalCondominios: todosCondominios.length,
      cobrados: condominiosCobradosIds.length,
      pendentes: condominiosPendentes.length,
    };
    
    console.log(`\n📈 Resumo do Dashboard:`);
    console.log(`  Total: ${dashboardData.totalCondominios}`);
    console.log(`  Cobrados: ${dashboardData.cobrados}`);
    console.log(`  Pendentes: ${dashboardData.pendentes}`);
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDashboard();
