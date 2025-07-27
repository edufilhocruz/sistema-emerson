import { InadimplenciaItem } from '../types';
import apiClient from '@/services/apiClient';

const relatoriosService = {
  getInadimplenciaReport: async (condominioId?: string): Promise<InadimplenciaItem[]> => {
    const params = condominioId ? { condominioId } : undefined;
    const response = await apiClient.get<InadimplenciaItem[]>('/cobranca/inadimplencia', { params });
    return response.data;
  }
};

export default relatoriosService;