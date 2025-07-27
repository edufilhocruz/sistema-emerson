import { z } from "zod";

/**
 * Representa a entidade principal de um Condomínio, como viria do banco de dados.
 */
export interface Condominio {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
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
});

export type CondominioFormData = z.infer<typeof condominioFormSchema>;