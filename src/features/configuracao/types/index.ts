import { z } from 'zod';

//======== 1. USUÁRIOS E PERMISSÕES ========
export type UsuarioRole = 'Admin' | 'Operador';
export type UsuarioStatus = 'Ativo' | 'Inativo';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UsuarioRole;
  status: UsuarioStatus;
  foto?: string; // Foto de perfil (base64 ou URL)
}

export const usuarioFormSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres.").optional(),
  role: z.enum(['Admin', 'Operador'], { required_error: "Selecione um tipo de acesso." }),
  foto: z.string().optional(), // Foto de perfil
});
export type UsuarioFormData = z.infer<typeof usuarioFormSchema>;


//======== 2. E-MAIL E ENVIO ========
export const emailFormSchema = z.object({
  tipoEnvio: z.enum(['SMTP', 'API']),
  servidorSmtp: z.string().min(1, 'Endereço do servidor é obrigatório.'),
  porta: z.number().min(1, 'Porta é obrigatória.'),
  tipoSeguranca: z.enum(['TLS', 'SSL', 'Nenhuma']),
  emailRemetente: z.string().email('Email do remetente inválido.'),
  senhaRemetente: z.string().min(1, 'Senha é obrigatória.'),
  nomeRemetente: z.string().min(1, 'Nome do remetente é obrigatório.'),
  assinatura: z.string().min(1, 'Assinatura padrão é obrigatória.'),
});
export type EmailFormData = z.infer<typeof emailFormSchema>;


//======== 3. LOGS E AUDITORIA ========
export interface LogEntry {
  id: string;
  dataHora: Date;
  usuario: string;
  acao: string;
  ip: string;
}


//======== 4. SEGURANÇA ========
export const segurancaFormSchema = z.object({
  expiracaoSessao: z.number().min(5, 'O tempo mínimo é 5 minutos.'),
  tentativasLogin: z.number().min(3, 'O mínimo de tentativas é 3.'),
  minCaracteresSenha: z.number().min(8, 'O mínimo é 8 caracteres.'),
  requerNumero: z.boolean(),
  requerEspecial: z.boolean(),
});
export type SegurancaFormData = z.infer<typeof segurancaFormSchema>;