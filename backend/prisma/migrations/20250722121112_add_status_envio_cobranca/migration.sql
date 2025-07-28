-- CreateEnum
CREATE TYPE "StatusEnvio" AS ENUM ('ENVIADO', 'ERRO', 'NAO_ENVIADO');

-- AlterTable
ALTER TABLE "Cobranca" ADD COLUMN     "statusEnvio" "StatusEnvio" NOT NULL DEFAULT 'NAO_ENVIADO';
