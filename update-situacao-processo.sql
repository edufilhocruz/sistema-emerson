-- Script para atualizar o enum SituacaoProcesso no banco de dados
-- Execute este script no servidor PostgreSQL

-- 1. Primeiro, criar o novo enum
CREATE TYPE "SituacaoProcesso_New" AS ENUM (
  'CITACAO',
  'CONTESTACAO', 
  'REPLICA',
  'SISBAJUD',
  'PENHORA_DA_UNIDADE',
  'ACORDO_PROTOCOLADO',
  'ACORDO_HOMOLOGADO',
  'ACORDO_QUEBRADO',
  'QUITACAO_DA_DIVIDA',
  'EXTINTO',
  'CUMP_SENTENCA',
  'GRAU_DE_RECURSO'
);

-- 2. Adicionar uma nova coluna temporária com o novo tipo
ALTER TABLE "Processo" ADD COLUMN "situacao_new" "SituacaoProcesso_New";

-- 3. Mapear os valores antigos para os novos (mantendo apenas EXTINTO)
UPDATE "Processo" SET "situacao_new" = 'CITACAO' WHERE "situacao" = 'EM_ANDAMENTO';
UPDATE "Processo" SET "situacao_new" = 'CITACAO' WHERE "situacao" = 'ARQUIVADO';
UPDATE "Processo" SET "situacao_new" = 'CITACAO' WHERE "situacao" = 'SUSPENSO';
UPDATE "Processo" SET "situacao_new" = 'CITACAO' WHERE "situacao" = 'EVIDENCIDO';
UPDATE "Processo" SET "situacao_new" = 'CITACAO' WHERE "situacao" = 'JULGADO';
UPDATE "Processo" SET "situacao_new" = 'CITACAO' WHERE "situacao" = 'CAUTELAR';
UPDATE "Processo" SET "situacao_new" = 'EXTINTO' WHERE "situacao" = 'EXTINTO';

-- 4. Remover a coluna antiga
ALTER TABLE "Processo" DROP COLUMN "situacao";

-- 5. Renomear a nova coluna para o nome original
ALTER TABLE "Processo" RENAME COLUMN "situacao_new" TO "situacao";

-- 6. Definir NOT NULL e valor padrão
ALTER TABLE "Processo" ALTER COLUMN "situacao" SET NOT NULL;
ALTER TABLE "Processo" ALTER COLUMN "situacao" SET DEFAULT 'CITACAO';

-- 7. Remover o enum antigo
DROP TYPE "SituacaoProcesso";

-- 8. Renomear o novo enum para o nome original
ALTER TYPE "SituacaoProcesso_New" RENAME TO "SituacaoProcesso";

-- Verificar se a atualização foi bem-sucedida
SELECT "situacao", COUNT(*) FROM "Processo" GROUP BY "situacao";
