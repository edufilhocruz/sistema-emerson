import { z } from 'zod';

// ============================================================================
// ENUMS E TIPOS BASE
// ============================================================================

export type StatusPagamento = 'EM_DIA' | 'ATRASADO' | 'PENDENTE';
export type StatusCobranca = 'Enviado' | 'Erro' | 'Pendente';

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

/**
 * Representa a entidade principal de um Morador, conforme os dados
 * que vêm da API, incluindo o objeto aninhado do condomínio.
 */
export interface Morador {
  id: string;
  nome: string;
  email: string;
  emailsAdicionais?: string | null;
  bloco: string;
  apartamento: string;
  telefone: string | null;
  valorAluguel: number | null;
  statusPagamento: StatusPagamento;
  ultimaCobrancaStatus: StatusCobranca;
  ultimaCobrancaData: string | null;
  ultimaCobrancaTipo?: string | null;
  ultimaCobrancaStatusEnvio?: string | null;
  condominio: {
    id: string;
    nome: string;
  };
}

// ============================================================================
// SCHEMAS DE VALIDAÇÃO ROBUSTOS
// ============================================================================

/**
 * Schema base para validação de campos comuns
 */
const baseFields = {
  nome: z
    .string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres." })
    .trim(),
  
  email: z
    .string()
    .email({ message: "Insira um e-mail válido." })
    .max(100, { message: "E-mail deve ter no máximo 100 caracteres." })
    .toLowerCase()
    .trim(),
  
  emailsAdicionais: z
    .string()
    .optional()
    .or(z.literal(''))
    .or(z.literal(null))
    .or(z.literal(undefined))
    .transform((val) => {
      if (!val || val === '' || val === null || val === undefined) {
        return null;
      }
      // Valida se todos os emails são válidos
      const emails = val.split(',').map(email => email.trim());
      const emailsInvalidos = emails.filter(email => email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (emailsInvalidos.length > 0) {
        throw new Error(`Emails inválidos: ${emailsInvalidos.join(', ')}`);
      }
      return val.trim();
    }),
  
  telefone: z
    .string()
    .optional()
    .or(z.literal(''))
    .or(z.literal(null))
    .or(z.literal(undefined))
    .transform((val) => {
      if (!val || val === '' || val === null || val === undefined) {
        return null;
      }
      return val.trim();
    }),
  
  condominioId: z
    .string({ required_error: "Selecione um condomínio." })
    .uuid({ message: "ID do condomínio inválido." }),
  
  bloco: z
    .string()
    .min(1, { message: "Bloco é obrigatório." })
    .max(10, { message: "Bloco deve ter no máximo 10 caracteres." })
    .trim(),
  
  apartamento: z
    .string()
    .min(1, { message: "Apartamento é obrigatório." })
    .max(10, { message: "Apartamento deve ter no máximo 10 caracteres." })
    .trim(),
  
  valorAluguel: z
    .union([
      z.number().positive({ message: "Valor deve ser positivo." }),
      z.string().transform((val) => {
        if (!val || val === '' || val === '0' || val === '0,00') {
          return null;
        }
        const num = parseFloat(val.replace(/\./g, '').replace(',', '.'));
        return isNaN(num) ? null : num;
      }),
      z.literal(''),
      z.literal(null),
      z.literal(undefined)
    ])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === '' || val === null || val === undefined) {
        return null;
      }
      return typeof val === 'number' ? val : null;
    })
};

/**
 * Schema para criação de morador
 */
export const moradorCreateSchema = z.object({
  ...baseFields,
  valorAluguel: baseFields.valorAluguel.optional().nullable()
});

/**
 * Schema para edição de morador (todos os campos opcionais)
 */
export const moradorEditSchema = moradorCreateSchema.partial();

/**
 * Schema para validação de dados do formulário
 */
export const moradorFormSchema = z.object({
  ...baseFields,
  valorAluguel: baseFields.valorAluguel.optional().nullable()
});

// ============================================================================
// TIPOS INFERIDOS DOS SCHEMAS
// ============================================================================

export type MoradorCreateData = z.infer<typeof moradorCreateSchema>;
export type MoradorEditData = z.infer<typeof moradorEditSchema>;
export type MoradorFormData = z.infer<typeof moradorFormSchema>;

// ============================================================================
// TIPOS PARA ESTADO DO FORMULÁRIO
// ============================================================================

export interface MoradorFormState {
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface MoradorFormContext {
  mode: 'create' | 'edit';
  initialData?: Partial<Morador>;
  onSubmit: (data: MoradorFormData) => Promise<void>;
  onCancel: () => void;
}

// ============================================================================
// TIPOS PARA VALIDAÇÃO DE CAMPOS ESPECÍFICOS
// ============================================================================

export interface FieldValidation {
  isValid: boolean;
  message?: string;
  isRequired: boolean;
}

export interface FormValidation {
  [key: string]: FieldValidation;
}
