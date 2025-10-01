import apiClient from '@/services/apiClient';

export interface Processo {
  id: string;
  nome: string;
  unidade: string;
  acaoDe: string;
  situacao: string;
  numeroProcesso: string;
  valorDivida?: number | null;
  movimentacoes?: string | null;
  condominioId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProcessoCreate = Omit<Processo, 'id' | 'createdAt' | 'updatedAt'>;
export type ProcessoUpdate = Partial<ProcessoCreate>;

const processoService = {
  list: async (): Promise<Processo[]> => {
    const res = await apiClient.get('/processos');
    return res.data;
  },
  create: async (data: ProcessoCreate): Promise<Processo> => {
    const res = await apiClient.post('/processos', data);
    return res.data;
  },
  update: async (id: string, data: ProcessoUpdate): Promise<Processo> => {
    const res = await apiClient.patch(`/processos/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/processos/${id}`);
  },
};

export default processoService;


