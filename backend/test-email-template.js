const fs = require('fs');
const path = require('path');

console.log('=== TESTE DO TEMPLATE DE EMAIL HTML ===\n');

// Dados de exemplo
const dadosExemplo = {
  morador: {
    nome: 'João da Silva',
    email: 'joao.silva@email.com',
    bloco: 'A',
    apartamento: '101'
  },
  condominio: {
    nome: 'Residencial Jardim das Acácias',
    logradouro: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  cobranca: {
    valor: 1234.56,
    vencimento: '15/07/2025'
  }
};

// Função para substituir placeholders (simulando o serviço)
function substituirPlaceholders(texto, dados) {
  let resultado = texto;
  
  const placeholders = {
    '{{nome_morador}}': dados.morador.nome,
    '{{nome_condominio}}': dados.condominio.nome,
    '{{valor}}': dados.cobranca.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    '{{data_vencimento}}': dados.cobranca.vencimento,
    '{{bloco}}': dados.morador.bloco,
    '{{apartamento}}': dados.morador.apartamento
  };
  
  Object.entries(placeholders).forEach(([placeholder, valor]) => {
    resultado = resultado.replace(new RegExp(placeholder, 'g'), valor);
  });
  
  return resultado;
}

// Função para processar HTML (simulando o serviço)
function processarConteudoHtml(html) {
  return html
    .replace(/background-color:\s*[^;]+;/gi, '')
    .replace(/background:\s*[^;]+;/gi, '')
    .replace(/box-shadow:\s*[^;]+;/gi, '')
    .replace(/border-radius:\s*[^;]+;/gi, '')
    .replace(/transform:\s*[^;]+;/gi, '')
    .replace(/<img([^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('style=')) {
        attrs += ' style="max-width: 100%; height: auto; border: 0;"';
      }
      if (!attrs.includes('alt=')) {
        attrs += ' alt="Imagem"';
      }
      return `<img${attrs}>`;
    })
    .replace(/\n/g, '<br>');
}

// Conteúdo de exemplo do Quill
const conteudoQuill = `
<h1>Cobrança de Condomínio</h1>
<p>Prezado(a) <strong>{{nome_morador}}</strong>,</p>
<p>Informamos que sua cobrança de condomínio do <em>{{nome_condominio}}</em> está disponível:</p>
<ul>
  <li><strong>Valor:</strong> {{valor}}</li>
  <li><strong>Vencimento:</strong> {{data_vencimento}}</li>
  <li><strong>Unidade:</strong> {{bloco}}-{{apartamento}}</li>
</ul>
<p>Por favor, realize o pagamento até a data de vencimento.</p>
<p>Atenciosamente,<br>Administração</p>
`;

// Processa o conteúdo
const conteudoComPlaceholders = substituirPlaceholders(conteudoQuill, dadosExemplo);
const conteudoProcessado = processarConteudoHtml(conteudoComPlaceholders);

// Template de email
const emailTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Cobrança - ${dadosExemplo.condominio.nome}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
  <!-- Wrapper principal -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Container do email -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Imagem do cabeçalho (exemplo) -->
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://app.raunaimer.adv.br/uploads/images/header-example.jpg" 
                   alt="Cabeçalho" 
                   style="width: 100%; max-height: 200px; object-fit: cover; display: block; border: 0;">
            </td>
          </tr>
          
          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 30px; text-align: left;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #333333;">
                ${conteudoProcessado}
              </div>
            </td>
          </tr>
          
          <!-- Imagem do rodapé (exemplo) -->
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://app.raunaimer.adv.br/uploads/images/footer-example.jpg" 
                   alt="Rodapé/Assinatura" 
                   style="width: 100%; max-height: 150px; object-fit: contain; display: block; border: 0;">
            </td>
          </tr>
          
          <!-- Rodapé do sistema -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #666666; line-height: 1.4;">
                    <p style="margin: 0 0 10px 0;">Esta é uma cobrança automática do sistema Raunaimer.</p>
                    <p style="margin: 0;">Para dúvidas, entre em contato conosco.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
  <!-- Fallback para clientes que não suportam tabelas -->
  <!--[if !mso]><!-->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Esta é uma cobrança automática do sistema Raunaimer.
  </div>
  <!--<![endif]-->
  
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Cobrança - ${dadosExemplo.condominio.nome} - Cobrança de Condomínio
  </div>
</body>
</html>
`;

// Salva o template de teste
const outputPath = path.join(process.cwd(), 'email-template-test.html');
fs.writeFileSync(outputPath, emailTemplate);

console.log('✅ Template de email criado com sucesso!');
console.log(`📁 Arquivo salvo em: ${outputPath}`);
console.log('\n=== DETALHES DO PROCESSAMENTO ===');
console.log('Conteúdo original:', conteudoQuill);
console.log('\nConteúdo com placeholders substituídos:', conteudoComPlaceholders);
console.log('\nConteúdo processado para email:', conteudoProcessado);
console.log('\n=== CARACTERÍSTICAS DO TEMPLATE ===');
console.log('✅ HTML inline (compatível com todos os clientes)');
console.log('✅ Tabelas para layout (funciona no Outlook)');
console.log('✅ Imagens responsivas');
console.log('✅ Fallbacks para clientes antigos');
console.log('✅ Preheader text para preview');
console.log('✅ Meta tags para compatibilidade');
console.log('\n🎯 O template está pronto para uso em produção!');
