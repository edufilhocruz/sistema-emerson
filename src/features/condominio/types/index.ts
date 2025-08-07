import { z } from "zod";

/**
 * Representa a entidade principal de um Condomínio, como viria do banco de dados.
 */
export interface Condominio {
  id: string;
  nome: string;
  cnpj: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  administradora?: string;
  tipoServico: 'ASSESSORIA_MENSAL' | 'SOMENTE_COBRANCAS';
  sindicoNome: string;
  sindicoCpf: string;
  sindicoEmail: string;
  sindicoTelefone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Esquema de validação para o formulário de criação/edição de condomínio.
 */
export const condominioFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome do condomínio é obrigatório." }),
  cnpj: z.string().min(18, { message: "CNPJ inválido, preencha todos os números." }),
  cep: z.string().min(9, { message: "CEP inválido, preencha todos os números." }),
  logradouro: z.string().min(1, { message: "O logradouro é obrigatório." }),
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  complemento: z.string().optional(),
  bairro: z.string().min(1, { message: "O bairro é obrigatório." }),
  cidade: z.string().min(1, { message: "A cidade é obrigatória." }),
  estado: z.string().min(2, { message: "O estado é obrigatório." }),
  administradora: z.string().optional(),
  tipoServico: z.enum(['ASSESSORIA_MENSAL', 'SOMENTE_COBRANCAS']).default('ASSESSORIA_MENSAL'),
  sindicoNome: z.string().min(1, { message: "O nome do síndico é obrigatório." }),
  sindicoCpf: z.string().min(14, { message: "CPF inválido, preencha todos os números." }),
  sindicoEmail: z.string().email({ message: "Email inválido." }),
  sindicoTelefone: z.string().min(1, { message: "O telefone do síndico é obrigatório." }),
});

export type CondominioFormData = z.infer<typeof condominioFormSchema>;