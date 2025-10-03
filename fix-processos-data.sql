-- Script para corrigir os dados existentes na tabela Processo
-- Execute este script no servidor para corrigir dados antigos

-- 1. Ver quais valores únicos já existem
SELECT DISTINCT situacao, COUNT(*) as quantidade 
FROM "Processo" 
GROUP BY situacao 
ORDER BY quantidade DESC;

-- 2. Atualizar valores existentes para valores válidos do enum
UPDATE "Processo" 
SET situacao = 'EM_ANDAMENTO' 
WHERE situacao NOT IN ('EM_ANDAMENTO', 'ARQUIVADO', 'SUSPENSO', 'EVIDENCIDO', 'JULGADO', 'CAUTELAR', 'EXTINTO')
  AND situacao IS NOT NULL;

-- 3. Conversões específicas baseadas nos dados encontrados anteriormente
UPDATE "Processo" SET situacao = 'JULGADO' WHERE situacao ILIKE '%acordo%' OR situacao ILIKE '%homologado%';
UPDATE "Processo" SET situacao = 'EM_ANDAMENTO' WHERE situacao ILIKE '%andamento%' OR situacao ILIKE '%tramitando%';
UPDATE "Processo" SET situacao = 'ARQUIVADO' WHERE situacao ILIKE '%extinto%' OR situacao ILIKE '%arquivado%';
UPDATE "Processo" SET situacao = 'SUSPENSO' WHERE situacao ILIKE '%suspenso%' OR situacao ILIKE '%paralisado%';

-- 4. Garantir que todos os registros tenham uma situação válida
UPDATE "Processo" SET situacao = 'EM_ANDAMENTO' 
WHERE situacao IS NULL OR situacao = '';

-- 5. Verificar se ainda há valores inválidos
SELECT DISTINCT situacao, COUNT(*) as quantidade 
FROM "Processo" 
WHERE situacao NOT IN ('EM_ANDAMENTO', 'ARQUIVADO', 'SUSPENSO', 'EVIDENCIDO', 'JULGADO', 'CAUTELAR', 'EXTINTO')
GROUP BY situacao;

-- 6. Agora tentar converter para o enum
DO $$
BEGIN
    BEGIN
        ALTER TABLE "Processo" 
        ALTER COLUMN "situacao" TYPE "SituacaoProcesso" USING "situacao"::text::"SituacaoProcesso";
        
        ALTER TABLE "Processo" 
        ALTER COLUMN "situacao" SET DEFAULT 'EM_ANDMENTO';
        
        RAISE NOTICE '✅ Coluna situacao convertida para enum com sucesso!';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Erro ao converter: %', SQLERRM;
    END;
END $$;

-- 7. Verificar estrutura final
SELECT 'ESTRUTURA FINAL:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Processo' 
ORDER BY ordinal_position;

-- 8. Teste rápido
SELECT 'TESTE - PROCESSOS EXISTENTES:' as info;
SELECT situacao, COUNT(*) as total FROM "Processo" GROUP BY situacao ORDER BY total DESC;