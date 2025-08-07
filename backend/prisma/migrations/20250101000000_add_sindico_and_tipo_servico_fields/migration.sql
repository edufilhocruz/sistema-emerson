-- CreateEnum
CREATE TYPE "TipoServico" AS ENUM ('ASSESSORIA_MENSAL', 'SOMENTE_COBRANCAS');

-- AlterTable
ALTER TABLE "Condominio" ADD COLUMN "tipoServico" "TipoServico" NOT NULL DEFAULT 'ASSESSORIA_MENSAL',
ADD COLUMN "sindicoNome" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sindicoCpf" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sindicoEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sindicoTelefone" TEXT NOT NULL DEFAULT '';

-- Update existing records to have default values
UPDATE "Condominio" SET 
  "sindicoNome" = 'Síndico não informado',
  "sindicoCpf" = '000.000.000-00',
  "sindicoEmail" = 'sindico@condominio.com',
  "sindicoTelefone" = '(00) 00000-0000'
WHERE "sindicoNome" = '';

-- Remove default constraints after updating existing data
ALTER TABLE "Condominio" ALTER COLUMN "sindicoNome" DROP DEFAULT,
ALTER COLUMN "sindicoCpf" DROP DEFAULT,
ALTER COLUMN "sindicoEmail" DROP DEFAULT,
ALTER COLUMN "sindicoTelefone" DROP DEFAULT;
