import { z } from "zod";

/**
 * Documentação: Modelo de Carta
 * - Adicionado o campo `conteudo` para o corpo da mensagem.
 */
export interface ModeloCarta {
  id: string;
  titulo: string;
  conteudo?: string; // Conteúdo da mensagem
}

/**
 * Documentação: Esquema de Validação para o Editor de Modelos
 * Define as regras para os campos do formulário de edição/criação.
 */
export const modeloSchema = z.object({
  titulo: z.string().min(5, { message: "O nome do modelo é obrigatório." }),
  conteudo: z.string().min(10, { message: "O conteúdo da mensagem é obrigatório." }),
});

export type ModeloFormData = z.infer<typeof modeloSchema>;