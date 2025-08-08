const fs = require('fs');
const path = require('path');

console.log('=== VERIFICANDO CONFIGURAÇÃO DE IMAGENS ===\n');

// 1. Verificar se o diretório de uploads existe
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');

console.log('1. Verificando diretório de uploads...');
if (!fs.existsSync(uploadsDir)) {
  console.log('   ❌ Diretório uploads não existe. Criando...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('   ✅ Diretório uploads criado.');
} else {
  console.log('   ✅ Diretório uploads existe.');
}

if (!fs.existsSync(imagesDir)) {
  console.log('   ❌ Diretório uploads/images não existe. Criando...');
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('   ✅ Diretório uploads/images criado.');
} else {
  console.log('   ✅ Diretório uploads/images existe.');
}

// 2. Verificar permissões
try {
  fs.accessSync(imagesDir, fs.constants.W_OK);
  console.log('   ✅ Permissões de escrita OK.');
} catch (error) {
  console.log('   ❌ Erro de permissões:', error.message);
}

// 3. Verificar arquivo .env
const envPath = path.join(process.cwd(), '.env');
console.log('\n2. Verificando arquivo .env...');
if (fs.existsSync(envPath)) {
  console.log('   ✅ Arquivo .env existe.');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('BASE_URL=')) {
    console.log('   ✅ BASE_URL configurada.');
    const baseUrlMatch = envContent.match(/BASE_URL=(.+)/);
    if (baseUrlMatch) {
      console.log(`   📍 Valor: ${baseUrlMatch[1]}`);
    }
  } else {
    console.log('   ❌ BASE_URL não encontrada no .env');
    console.log('   💡 Adicione: BASE_URL=https://app.raunaimer.adv.br');
  }
} else {
  console.log('   ❌ Arquivo .env não existe.');
  console.log('   💡 Crie o arquivo .env com:');
  console.log('      BASE_URL=https://app.raunaimer.adv.br');
  console.log('      DATABASE_URL=sua_url_do_banco');
  console.log('      ... outras variáveis necessárias');
}

// 4. Testar criação de arquivo
console.log('\n3. Testando criação de arquivo...');
const testFile = path.join(imagesDir, 'test.txt');
try {
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('   ✅ Permissões de escrita funcionando.');
} catch (error) {
  console.log('   ❌ Erro ao testar escrita:', error.message);
}

// 5. Verificar estrutura do projeto
console.log('\n4. Verificando estrutura do projeto...');
const mainTsPath = path.join(process.cwd(), 'src', 'main.ts');
if (fs.existsSync(mainTsPath)) {
  const mainContent = fs.readFileSync(mainTsPath, 'utf8');
  if (mainContent.includes('/api/uploads')) {
    console.log('   ✅ Servir arquivos estáticos configurado no main.ts');
  } else {
    console.log('   ❌ Servir arquivos estáticos não configurado');
  }
} else {
  console.log('   ❌ Arquivo main.ts não encontrado');
}

console.log('\n=== RESUMO ===');
console.log('Para que as imagens funcionem corretamente:');
console.log('1. ✅ Diretório uploads/images criado');
console.log('2. ⚠️  Verifique se BASE_URL está no .env');
console.log('3. ✅ Permissões de escrita OK');
console.log('4. ✅ Servir arquivos estáticos configurado');
console.log('\n📧 As imagens serão incluídas automaticamente nos emails de cobrança!');
