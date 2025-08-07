import { z } from "zod";

export const TipoServicoEnum = z.enum(['ASSESSORIA_MENSAL', 'SOMENTE_COBRANCAS']);

// Renomeado para 'condominioFormSchema' para consistência
export const condominioFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome do condomínio é obrigatório." }).nullable().optional(),
  cnpj: z.string().min(18, { message: "CNPJ inválido, preencha todos os números." }).or(z.literal('')).nullable().optional(),
  cep: z.string().min(9, { message: "CEP inválido, preencha todos os números." }).nullable().optional(),
  logradouro: z.string().min(1, { message: "O logradouro é obrigatório." }).nullable().optional(),
  numero: z.string().min(1, { message: "O número é obrigatório." }).nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().min(1, { message: "O bairro é obrigatório." }).nullable().optional(),
  cidade: z.string().min(1, { message: "A cidade é obrigatória." }).nullable().optional(),
  estado: z.string().min(2, { message: "O estado é obrigatório." }).nullable().optional(),
  administradora: z.string().nullable().optional(),
  tipoServico: TipoServicoEnum.default('ASSESSORIA_MENSAL'),
  sindicoNome: z.string().min(1, { message: "O nome do síndico é obrigatório." }),
  sindicoCpf: z.string().min(14, { message: "CPF inválido, preencha todos os números." }),
  sindicoEmail: z.string().email({ message: "Email inválido." }),
  sindicoTelefone: z.string().min(1, { message: "O telefone do síndico é obrigatório." }),
});

export const condominioEditSchema = condominioFormSchema.partial();

export type CondominioFormData = z.infer<typeof condominioFormSchema>;

export interface Condominio {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  tipoServico: 'ASSESSORIA_MENSAL' | 'SOMENTE_COBRANCAS';
  sindicoNome: string;
  sindicoCpf: string;
  sindicoEmail: string;
  sindicoTelefone: string;
}