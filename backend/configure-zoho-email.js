const axios = require('axios');

// Configuração do Zoho Mail
const zohoConfig = {
  host: 'smtp.zoho.com',
  port: 587,
  user: 'seu-email@zoho.com', // Substitua pelo email real do Zoho
  pass: 'sua-senha-de-app-zoho', // Substitua pela senha real do Zoho
  from: 'seu-email@zoho.com', // Substitua pelo email real do Zoho
  secure: false, // TLS
  tipoEnvio: 'SMTP',
  servidorSmtp: 'smtp.zoho.com',
  porta: 587,
  tipoSeguranca: 'TLS',
  nomeRemetente: 'Sistema Raunaimer',
  emailRemetente: 'seu-email@zoho.com', // Substitua pelo email real do Zoho
  senhaRemetente: 'sua-senha-de-app-zoho', // Substitua pela senha real do Zoho
  assinatura: 'Sistema Raunaimer - Gestão de Condomínios'
};

async function configureZohoEmail() {
  try {
    console.log('Configurando email do Zoho...');
    
    // Faz a requisição para configurar o email
    const response = await axios.post('http://localhost:3001/api/email-config', zohoConfig, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Configuração de email salva com sucesso!');
    console.log('Resposta:', response.data);
    
    // Testa o envio de email
    console.log('\nTestando envio de email...');
    const testResponse = await axios.post('http://localhost:3001/api/email-config/test', {
      to: 'teste@exemplo.com', // Substitua por um email real para teste
      subject: 'Teste de Configuração - Sistema Raunaimer',
      text: 'Este é um email de teste para verificar se a configuração do Zoho está funcionando corretamente.'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log('Resposta do teste:', testResponse.data);
    
  } catch (error) {
    console.error('❌ Erro ao configurar email:', error.response?.data || error.message);
  }
}

// Executa a configuração
configureZohoEmail(); 