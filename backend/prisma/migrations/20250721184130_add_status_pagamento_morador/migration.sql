-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('EM_DIA', 'ATRASADO', 'PENDENTE');

-- AlterTable
ALTER TABLE "Morador" ADD COLUMN     "statusPagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE';
