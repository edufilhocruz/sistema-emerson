import { z } from "zod";

// Esquema para o formulário de NOVA cobrança (já existe)
export const cobrancaSchema = z.object({
  condominioId: z.string({ required_error: "Por favor, selecione um condomínio." }),
  morador: z.string().min(3, { message: "O nome do morador é obrigatório." }),
  bloco: z.string().optional(),
  apto: z.string().min(1, { message: "O número do apartamento é obrigatório." }),
  valor: z.string().min(1, { message: "O valor é obrigatório." }),
});

export type CobrancaFormData = z.infer<typeof cobrancaSchema>;
export type CobrancaStatus = 'Pago' | 'Atrasado' | 'Em Aberto';

export interface HistoricoCobranca {
  id: string;
  morador: string;
  condominio: string;
  valor: string;
  dataEnvio: string;
  status: CobrancaStatus;
}

export interface HistoricoCobranca {
  id: string;
  morador: string;
  condominio: string;
  valor: string;
  dataEnvio: string;
}
export interface CobrancaImportData {
  id: number;
  morador: string;
  unidade: string; // Bloco + Apto
  valor: number;
  vencimento: string;
  status: 'Válido' | 'Inválido'; // Para a pré-visualização
  erro?: string; // Mensagem de erro, se houver
}
export const enviarCobrancaSchema = z.object({
  condominioId: z.string({ required_error: "Selecione um condomínio." }),
  moradorId: z.string({ required_error: "Selecione um morador." }),
  modeloId: z.string({ required_error: "Selecione um modelo de carta." }),
});

export type EnviarCobrancaFormData = z.infer<typeof enviarCobrancaSchema>;
export const envioEmMassaSchema = z.object({
  condominioId: z.string({ required_error: "Selecione um condomínio." }),
  modeloId: z.string({ required_error: "Selecione um modelo de carta." }),
  // Valida que pelo menos um morador foi selecionado
  moradoresIds: z.array(z.string()).min(1, { message: "Selecione pelo menos um morador." }),
});

export type EnvioEmMassaFormData = z.infer<typeof envioEmMassaSchema>;

// Tipo para os moradores na tabela de seleção
export interface MoradorParaSelecao {
  id: string;
  nome: string;
  unidade: string;
  email: string;
}