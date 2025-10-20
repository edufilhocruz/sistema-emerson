-- Script simplificado para adicionar campos ao modelo Processo
-- Execute este script no PostgreSQL

-- Verificar se as colunas já existem antes de criar
DO $$ 
BEGIN
    -- Adicionar coluna bloco se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Processo' AND column_name = 'bloco') THEN
        ALTER TABLE "Processo" ADD COLUMN "bloco" TEXT;
        RAISE NOTICE 'Coluna bloco adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna bloco já existe';
    END IF;

    -- Criar o enum TipoParte se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoParte') THEN
        CREATE TYPE "TipoParte" AS ENUM ('AUTOR', 'REU', 'TERCEIRO_INTERESSADO');
        RAISE NOTICE 'Enum TipoParte criado com sucesso';
    ELSE
        RAISE NOTICE 'Enum TipoParte já existe';
    END IF;

    -- Adicionar coluna parte se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Processo' AND column_name = 'parte') THEN
        ALTER TABLE "Processo" ADD COLUMN "parte" "TipoParte" NOT NULL DEFAULT 'AUTOR';
        RAISE NOTICE 'Coluna parte adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna parte já existe';
    END IF;
END $$;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Processo' 
AND column_name IN ('bloco', 'parte')
ORDER BY column_name;
