-- Criar enum SituacaoProcesso
CREATE TYPE "SituacaoProcesso" AS ENUM ('EM_ANDAMENTO', 'ARQUIVADO', 'SUSPENSO', 'EVIDENCIDO', 'JULGADO', 'CAUTELAR', 'EXTINTO');

-- Atualizar tabela Processo
ALTER TABLE "Processo" 
ALTER COLUMN "situacao" TYPE "SituacaoProcesso" USING "situacao"::text::"SituacaoProcesso";

ALTER TABLE "Processo" 
ALTER COLUMN "situacao" SET DEFAULT 'EM_ANDAMENTO';

-- Adicionar relacionamento com condomínio (fk já existe, só adicionar constraint se necessário)
ALTER TABLE "Processo" 
ADD CONSTRAINT "Processo_condominioId_fkey" 
FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE SET NULL;
