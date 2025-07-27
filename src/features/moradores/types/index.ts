import { z } from 'zod';

// Tipos de Enum para garantir consistência de dados
export type StatusPagamento = 'EM_DIA' | 'ATRASADO' | 'PENDENTE';
export type StatusCobranca = 'Enviado' | 'Erro' | 'Pendente';

/**
 * Representa a entidade principal de um Morador, conforme os dados
 * que vêm da API, incluindo o objeto aninhado do condomínio.
 */
export interface Morador {
  id: string;
  nome: string;
  email: string;
  bloco: string;
  apartamento: string;
  telefone: string;
  valorAluguel: number;
  statusPagamento: StatusPagamento;
  ultimaCobrancaStatus: StatusCobranca;
  ultimaCobrancaData: string | null;
  ultimaCobrancaTipo?: string | null;
  ultimaCobrancaStatusEnvio?: string | null;
  condominio: {
    nome: string;
  };
}

/**
 * Esquema de validação Zod para o formulário de criação/edição de morador.
 */
export const moradorFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome é obrigatório." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  telefone: z.string().min(14, { message: "Telefone inválido." }).or(z.literal('')),
  condominioId: z.string({ required_error: "Selecione um condomínio." }),
  bloco: z.string().min(1, { message: "O bloco é obrigatório." }),
  apartamento: z.string().min(1, { message: "O apartamento é obrigatório." }),
  valorAluguel: z.number().min(0.01, { message: "O valor do aluguel é obrigatório." }).nullable().optional(),
});

export type MoradorFormData = z.infer<typeof moradorFormSchema>;

export const moradorEditSchema = moradorFormSchema.partial();
