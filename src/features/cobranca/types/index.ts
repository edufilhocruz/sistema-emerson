import { z } from "zod";

// --- Manter todos os outros tipos existentes ---

export const cobrancaSchema = z.object({
  condominioId: z.string({ required_error: "Por favor, selecione um condomínio." }),
  morador: z.string().min(3, { message: "O nome do morador é obrigatório." }),
  bloco: z.string().optional(),
  apto: z.string().min(1, { message: "O número do apartamento é obrigatório." }),
  valor: z.string().optional(),
});
export type CobrancaFormData = z.infer<typeof cobrancaSchema>;

export const enviarCobrancaSchema = z.object({
  condominioId: z.string({ required_error: "Selecione um condomínio." }),
  moradorId: z.string({ required_error: "Selecione um morador." }),
  modeloId: z.string({ required_error: "Selecione um modelo de carta." }),
});
export type EnviarCobrancaFormData = z.infer<typeof enviarCobrancaSchema>;


/**
 * Representa os dados de uma única linha lida de uma planilha de importação.
 * Este é o único tipo correto para esta funcionalidade.
 */
export interface CobrancaImportada {
  id: number;
  nome: string;
  email: string;
  bloco: string;
  apto: string;
  valor: number;
  status: 'Válido' | 'Inválido' | 'Aviso';
  mensagem?: string;
}
export type CobrancaStatus = 'ENVIADO' | 'ERRO' | 'NAO_ENVIADO';
export interface HistoricoCobranca {
  id: string;
  morador: string;
  condominio: string;
  valor: number;
  dataEnvio: string; // Formato ISO 8601 (ex: '2025-07-15T10:30:00Z')
  status: CobrancaStatus;
}
export interface CobrancasKpis {
  totalArrecadado: number;
  totalPendente: number;
  taxaSucesso: number; // Armazenado como um valor de 0 a 100
}