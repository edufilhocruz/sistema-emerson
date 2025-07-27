import { Morador } from '../types';
import apiClient from '@/services/apiClient'; // Importa o nosso cliente Axios

const moradorService = {
  getMoradores: async (): Promise<Morador[]> => {
    // A simulação de dados é removida...
    // await new Promise(resolve => setTimeout(resolve, 500));
    // return mockMoradores;

    // ...e substituída pela chamada de API real.
    const response = await apiClient.get<Morador[]>('/morador');
    return response.data;
  },
  updateMorador: async (id: string, data: any): Promise<Morador> => {
    const response = await apiClient.patch<Morador>(`/morador/${id}`, data);
    return response.data;
  },

  deleteMorador: async (id: string): Promise<void> => {
    await apiClient.delete(`/morador/${id}`);
  },
  createMorador: async (data: any): Promise<Morador> => {
    const response = await apiClient.post<Morador>('/morador', data);
    return response.data;
  },
  // ... (outras funções do serviço)
};

export default moradorService;