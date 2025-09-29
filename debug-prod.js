const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugProd() {
  try {
    console.log('=== DEBUG PRODUÇÃO ===');
    
    // Verificar cobranças
    const cobrancas = await prisma.cobranca.findMany({
      include: { condominio: true, morador: true },
      orderBy: { dataEnvio: 'desc' }
    });
    
    console.log(`Total de cobranças: ${cobrancas.length}`);
    
    // Verificar condomínios
    const condominios = await prisma.condominio.findMany();
    console.log(`Total de condomínios: ${condominios.length}`);
    
    // Verificar moradores
    const moradores = await prisma.morador.findMany();
    console.log(`Total de moradores: ${moradores.length}`);
    
    // Verificar modelos
    const modelos = await prisma.modeloCarta.findMany();
    console.log(`Total de modelos: ${modelos.length}`);
    
    // Verificar cobranças enviadas no mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const cobrancasEnviadas = await prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: inicioMes, lte: fimMes },
        statusEnvio: 'ENVIADO',
      },
      include: { condominio: true },
    });
    
    console.log(`Cobranças enviadas no mês: ${cobrancasEnviadas.length}`);
    
    // Verificar condomínios únicos com cobranças enviadas
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
    
    console.log(`Condomínios com cobranças enviadas: ${condominiosComCobranca.length}`);
    condominiosComCobranca.forEach(c => {
      console.log(`  - ${c.condominio.nome} (ID: ${c.condominioId})`);
    });
    
    // Resumo do dashboard
    const totalCondominios = condominios.length;
    const cobrados = condominiosComCobranca.length;
    const pendentes = totalCondominios - cobrados;
    
    console.log(`\n📈 Resumo do Dashboard:`);
    console.log(`  Total: ${totalCondominios}`);
    console.log(`  Cobrados: ${cobrados}`);
    console.log(`  Pendentes: ${pendentes}`);
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProd();
