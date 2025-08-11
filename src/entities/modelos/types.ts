import { z } from "zod";

/**
 * Documentação: Modelo de Carta
 * - Adicionado o campo `conteudo` para o corpo da mensagem.
 * - Suporte a campos dinâmicos como {{nome_morador}}, {{valor}}, etc.
 * - Suporte a imagens no cabeçalho e rodapé.
 */
export interface ModeloCarta {
  id: string;
  titulo: string;
  conteudo?: string; // Conteúdo da mensagem com suporte a campos dinâmicos
  headerImage?: string; // Base64 da imagem do cabeçalho
  footerImage?: string; // Base64 da imagem do rodapé/assinatura
  headerImageUrl?: string; // URL da imagem do cabeçalho (fallback)
  footerImageUrl?: string; // URL da imagem do rodapé (fallback)
}

/**
 * Documentação: Esquema de Validação para o Editor de Modelos
 * Define as regras para os campos do formulário de edição/criação.
 * Permite campos dinâmicos no conteúdo.
 */
export const modeloSchema = z.object({
  titulo: z.string()
    .min(5, { message: "O nome do modelo deve ter pelo menos 5 caracteres." })
    .max(100, { message: "O nome do modelo deve ter no máximo 100 caracteres." }),
  conteudo: z.string()
    .min(10, { message: "O conteúdo da mensagem deve ter pelo menos 10 caracteres." })
    .max(10000, { message: "O conteúdo da mensagem deve ter no máximo 10000 caracteres." })
    .refine((content) => {
      // Verifica se há pelo menos um campo dinâmico básico
      const hasBasicFields = /{{(nome_morador|valor|mes_referencia)}}/i.test(content);
      return hasBasicFields || content.length >= 20;
    }, { message: "O conteúdo deve incluir pelo menos um campo dinâmico básico ou ter pelo menos 20 caracteres." }),
  headerImage: z.string().optional(),
  footerImage: z.string().optional(),
  headerImageUrl: z.string().optional(),
  footerImageUrl: z.string().optional(),
});

export type ModeloFormData = z.infer<typeof modeloSchema>;