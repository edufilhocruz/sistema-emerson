-- Script para adicionar novos campos ao modelo Processo
-- Execute este script no PostgreSQL após fazer o deploy das mudanças

-- Adicionar coluna bloco (opcional)
ALTER TABLE "Processo" ADD COLUMN "bloco" TEXT;

-- Adicionar coluna parte com valor padrão AUTOR
ALTER TABLE "Processo" ADD COLUMN "parte" "TipoParte" NOT NULL DEFAULT 'AUTOR';

-- Criar o enum TipoParte se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoParte') THEN
        CREATE TYPE "TipoParte" AS ENUM ('AUTOR', 'REU', 'TERCEIRO_INTERESSADO');
    END IF;
END $$;

-- Atualizar registros existentes para terem parte = 'AUTOR' (já é o padrão)
-- Não é necessário fazer UPDATE pois o DEFAULT já aplica o valor

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Processo' 
AND column_name IN ('bloco', 'parte');

-- Verificar se o enum foi criado
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TipoParte');
