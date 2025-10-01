-- CreateTable Processo
CREATE TABLE "Processo" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "unidade" TEXT NOT NULL,
  "acaoDe" TEXT NOT NULL,
  "situacao" TEXT NOT NULL,
  "numeroProcesso" TEXT NOT NULL,
  "valorDivida" DOUBLE PRECISION,
  "movimentacoes" TEXT,
  "condominioId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
