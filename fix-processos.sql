-- Script para corrigir tabela Processo no banco de dados
-- Execute estes comandos no servidor

-- 1. Criar o enum se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SituacaoProcesso') THEN
        CREATE TYPE "SituacaoProcesso" AS ENUM ('EM_ANDAMENTO', 'ARQUIVADO', 'SUSPENSO', 'EVIDENCIDO', 'JULGADO', 'CAUTELAR', 'EXTINTO');
        RAISE NOTICE 'Enum SituacaoProcesso criado com sucesso';
    ELSE
        RAISE NOTICE 'Enum SituacaoProcesso já existe';
    END IF;
END $$;

-- 2. Verificar se a tabela Processo existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Processo') THEN
        CREATE TABLE "Processo" (
            "id" TEXT NOT NULL,
            "nome" TEXT NOT NULL,
            "unidade" TEXT NOT NULL,
            "acaoDe" TEXT NOT NULL,
            "situacao" TEXT NOT NULL,
            "numeroProcesso" TEXT NOT NULL,
            "valorDivida" DOUBLE PRECISION,
            "movimentacoes" TEXT,
            "condominioId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Processo_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'Tabela Processo criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela Processo já existe';
    END IF;
END $$;

-- 3. Alterar coluna situacao para usar o enum (se existir dados)
DO $$
BEGIN
    BEGIN
        ALTER TABLE "Processo" 
        ALTER COLUMN "situacao" TYPE "SituacaoProcesso" USING "situacao"::text::"SituacaoProcesso";
        
        ALTER TABLE "Processo" 
        ALTER COLUMN "situacao" SET DEFAULT 'EM_ANDAMENTO';
        
        RAISE NOTICE 'Coluna situacao convertida para enum';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao converter situacao para enum: %', SQLERRM;
    END;
END $$;

-- 4. Adicionar constraint de foreign key (se condominioId existir)
DO $$
BEGIN
    BEGIN
        ALTER TABLE "Processo" 
        ADD CONSTRAINT "Processo_condominioId_fkey" 
        FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE SET NULL;
        
        RAISE NOTICE 'Constraint de foreign key adicionada';
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'Constraint já existe';
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro não esperado: %', SQLERRM;
    END;
END $$;

-- 5. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Processo' 
ORDER BY ordinal_position;
