export class Condominio {
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
  createdAt: Date;
  updatedAt: Date;
}
