# Changelog - Suporte a Valores Nulos nas Cobranças

## 📋 Resumo das Mudanças

O cliente solicitou que o sistema aceite valores nulos nos envios de cobrança. As seguintes alterações foram implementadas:

## 🔧 Mudanças Técnicas

### 1. Schema do Prisma
- **Arquivo**: `prisma/schema.prisma`
- **Mudança**: Campo `valor` na tabela `Cobranca` agora aceita valores nulos (`Float?`)

### 2. DTO de Criação
- **Arquivo**: `src/cobranca/dto/create-cobranca.dto.ts`
- **Mudança**: Removida validação `@IsPositive()` do campo `valor`
- **Resultado**: Agora aceita valores negativos, zero e nulos

### 3. Repositório
- **Arquivo**: `src/cobranca/cobranca.repository.ts`
- **Mudança**: Removido `!` (non-null assertion) do campo `valor`
- **Resultado**: Permite valores nulos na criação

### 4. Serviço de Cobrança
- **Arquivo**: `src/cobranca/cobranca.service.ts`
- **Mudanças**:
  - Lógica atualizada para permitir valores nulos
  - Placeholders `{{valor}}` e `{{valor_formatado}}` agora exibem "Valor não informado" quando nulo
  - Não lança mais erro quando morador não tem valor de aluguel

### 5. Processador de Importação
- **Arquivo**: `src/cobranca/cobranca.processor.ts`
- **Mudanças**:
  - Validação atualizada: valor não é mais obrigatório
  - Tratamento adequado de valores nulos na importação
  - Placeholders atualizados para valores nulos

## 🗄️ Migração do Banco

### Arquivo de Migração
- **Caminho**: `prisma/migrations/20250731101800_allow_null_values_in_cobranca/migration.sql`
- **Comando**: `ALTER TABLE "Cobranca" ALTER COLUMN "valor" DROP NOT NULL;`

### Como Aplicar
```bash
cd backend
npx prisma migrate deploy
```

## 🎯 Comportamento Atual

### Criação de Cobrança Individual
1. Se `valor` é fornecido → usa o valor fornecido
2. Se `valor` é nulo e morador tem `valorAluguel` → usa `valorAluguel`
3. Se `valor` é nulo e morador não tem `valorAluguel` → mantém como nulo

### Importação em Massa
1. Campo `valor` é opcional na planilha
2. Se valor está vazio → cria cobrança com valor nulo
3. Se valor está preenchido → usa o valor da planilha

### Templates de Email
- `{{valor}}` → exibe valor formatado ou "Valor não informado"
- `{{valor_formatado}}` → exibe valor formatado ou "Valor não informado"

## ✅ Benefícios

1. **Flexibilidade**: Permite cobranças sem valor específico
2. **Compatibilidade**: Não quebra funcionalidades existentes
3. **Usabilidade**: Melhora experiência do usuário
4. **Escalabilidade**: Suporta diferentes tipos de cobrança

## 🔍 Testes Recomendados

1. Criar cobrança individual sem valor
2. Importar planilha com valores nulos
3. Verificar templates de email com valores nulos
4. Testar relatórios com valores nulos

## 📝 Notas Importantes

- Valores nulos são tratados graciosamente em toda a aplicação
- Templates de email exibem mensagem amigável para valores nulos
- Relatórios e dashboards devem ser testados com valores nulos
- Backup do banco é recomendado antes da migração 