import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugDashboard() {
  try {
    console.log('=== DEBUG DASHBOARD - DADOS DO BANCO ===');
    
    // Verificar todas as cobranças
    const todasCobrancas = await prisma.cobranca.findMany({
      select: {
        id: true,
        condominioId: true,
        statusEnvio: true,
        dataEnvio: true,
        createdAt: true,
        condominio: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Total de cobranças no banco:', todasCobrancas.length);
    console.log('Cobranças por status:', {
      ENVIADO: todasCobrancas.filter(c => c.statusEnvio === 'ENVIADO').length,
      ERRO: todasCobrancas.filter(c => c.statusEnvio === 'ERRO').length,
      NAO_ENVIADO: todasCobrancas.filter(c => c.statusEnvio === 'NAO_ENVIADO').length,
    });
    
    // Verificar cobranças dos últimos 30 dias
    const data30DiasAtras = new Date();
    data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);
    
    const cobrancas30Dias = await prisma.cobranca.findMany({
      where: {
        createdAt: { gte: data30DiasAtras },
      },
      select: {
        id: true,
        condominioId: true,
        statusEnvio: true,
        dataEnvio: true,
        createdAt: true,
        condominio: {
          select: {
            nome: true,
          },
        },
      },
    });
    
    console.log('\n=== COBRANÇAS ÚLTIMOS 30 DIAS ===');
    console.log('Cobranças criadas nos últimos 30 dias:', cobrancas30Dias.length);
    console.log('Cobranças por status (últimos 30 dias):', {
      ENVIADO: cobrancas30Dias.filter(c => c.statusEnvio === 'ENVIADO').length,
      ERRO: cobrancas30Dias.filter(c => c.statusEnvio === 'ERRO').length,
      NAO_ENVIADO: cobrancas30Dias.filter(c => c.statusEnvio === 'NAO_ENVIADO').length,
    });
    
    // Verificar condomínios únicos com cobranças enviadas
    const condominiosComCobranca = await prisma.cobranca.findMany({
      where: {
        createdAt: { gte: data30DiasAtras },
        statusEnvio: 'ENVIADO',
      },
      select: {
        condominioId: true,
        condominio: {
          select: {
            nome: true,
          },
        },
      },
      distinct: ['condominioId'],
    });
    
    console.log('\n=== CONDOMÍNIOS COM COBRANÇAS ENVIADAS ===');
    console.log('Condomínios únicos com cobranças enviadas:', condominiosComCobranca.length);
    console.log('Lista de condomínios:', condominiosComCobranca.map(c => ({
      id: c.condominioId,
      nome: c.condominio.nome,
    })));
    
    // Verificar total de condomínios
    const totalCondominios = await prisma.condominio.count();
    console.log('\n=== TOTAL DE CONDOMÍNIOS ===');
    console.log('Total de condomínios cadastrados:', totalCondominios);
    
    // Verificar cobranças por dataEnvio vs createdAt
    const cobrancasPorDataEnvio = await prisma.cobranca.findMany({
      where: {
        dataEnvio: { gte: data30DiasAtras },
        statusEnvio: 'ENVIADO',
      },
      select: {
        condominioId: true,
        condominio: {
          select: {
            nome: true,
          },
        },
      },
      distinct: ['condominioId'],
    });
    
    console.log('\n=== COMPARAÇÃO: dataEnvio vs createdAt ===');
    console.log('Condomínios por dataEnvio:', cobrancasPorDataEnvio.length);
    console.log('Condomínios por createdAt:', condominiosComCobranca.length);
    
    // Mostrar algumas cobranças de exemplo
    console.log('\n=== EXEMPLOS DE COBRANÇAS ===');
    const exemplos = todasCobrancas.slice(0, 5);
    exemplos.forEach(c => {
      console.log({
        id: c.id,
        condominio: c.condominio.nome,
        statusEnvio: c.statusEnvio,
        dataEnvio: c.dataEnvio,
        createdAt: c.createdAt,
        diferenca: c.dataEnvio && c.createdAt ? 
          Math.abs(new Date(c.dataEnvio).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 'N/A'
      });
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDashboard();
