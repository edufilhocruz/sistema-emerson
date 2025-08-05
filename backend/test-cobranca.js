const axios = require('axios');

// Dados de teste para criar uma cobrança
const testCobranca = {
  vencimento: new Date().toISOString(),
  status: 'PENDENTE',
  condominioId: '8cd107df-89b4-436b-8d25-e948702f62bb', // Substitua por um ID real
  moradorId: '6759df5e-3e9a-4b8c-9f1a-2b3c4d5e6f7a', // Substitua por um ID real
  modeloCartaId: '12345678-1234-1234-1234-123456789abc', // Substitua por um ID real
};

async function testCobrancaCreation() {
  try {
    console.log('=== TESTANDO CRIAÇÃO DE COBRANÇA ===');
    console.log('Dados de teste:', JSON.stringify(testCobranca, null, 2));
    
    // Testa a criação de cobrança
    const response = await axios.post('http://localhost:3001/api/cobranca', testCobranca, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cobrança criada com sucesso!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao criar cobrança:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data);
    console.error('Erro completo:', error.message);
  }
}

// Executa o teste
testCobrancaCreation(); 