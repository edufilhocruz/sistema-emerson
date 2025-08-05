const axios = require('axios');

// ⚠️ IMPORTANTE: Substitua estes valores pelos dados reais do Zoho Mail
const zohoConfig = {
  // Configurações SMTP do Zoho
  host: 'smtp.zoho.com',
  port: 587,
  user: 'contato@raunaimer.adv.br', // ⚠️ Substitua pelo email real do Zoho
  pass: 'sua-senha-de-app-zoho', // ⚠️ Substitua pela senha real do Zoho
  from: 'contato@raunaimer.adv.br', // ⚠️ Substitua pelo email real do Zoho
  secure: false, // TLS
  
  // Configurações do formulário (para compatibilidade)
  tipoEnvio: 'SMTP',
  servidorSmtp: 'smtp.zoho.com',
  porta: 587,
  tipoSeguranca: 'TLS',
  nomeRemetente: 'Raunaimer Monfre Advocacia',
  emailRemetente: 'contato@raunaimer.adv.br', // ⚠️ Substitua pelo email real do Zoho
  senhaRemetente: 'sua-senha-de-app-zoho', // ⚠️ Substitua pela senha real do Zoho
  assinatura: 'Raunaimer Monfre Advocacia - Especialistas em Direito Condominial'
};

async function configureZohoEmail() {
  try {
    console.log('=== CONFIGURANDO EMAIL DO ZOHO EM PRODUÇÃO ===');
    console.log('⚠️  IMPORTANTE: Verifique se os dados do Zoho estão corretos no script!');
    console.log('Dados de configuração:', JSON.stringify(zohoConfig, null, 2));
    
    // Faz a requisição para configurar o email
    const response = await axios.post('https://app.raunaimer.adv.br/api/email-config', zohoConfig, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Configuração de email salva com sucesso!');
    console.log('Resposta:', response.data);
    
    // Testa o envio de email
    console.log('\n=== TESTANDO ENVIO DE EMAIL ===');
    const testResponse = await axios.post('https://app.raunaimer.adv.br/api/email-config/test', {
      to: 'contato@raunaimer.adv.br', // ⚠️ Substitua por um email real para teste
      subject: 'Teste de Configuração - Sistema Raunaimer',
      text: 'Este é um email de teste para verificar se a configuração do Zoho está funcionando corretamente.'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log('Resposta do teste:', testResponse.data);
    
    console.log('\n=== CONFIGURAÇÃO CONCLUÍDA ===');
    console.log('🎉 O sistema agora está configurado para usar o Zoho Mail!');
    console.log('📧 Landing page e sistema principal usarão esta configuração.');
    console.log('🌐 Formulário da landing page (raunaimer.adv.br) enviará emails via Zoho!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar email:', error.response?.data || error.message);
    console.log('\n💡 Dicas para resolver:');
    console.log('1. Verifique se o servidor está rodando');
    console.log('2. Confirme se os dados do Zoho estão corretos');
    console.log('3. Verifique se a senha de app do Zoho está correta');
    console.log('4. Teste se o endpoint está acessível: https://app.raunaimer.adv.br/api/email-config');
  }
}

// Executa a configuração
configureZohoEmail(); 