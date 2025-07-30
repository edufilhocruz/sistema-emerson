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
  createdAt: Date;
  updatedAt: Date;
}
