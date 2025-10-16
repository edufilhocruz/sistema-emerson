import { InadimplenciaItem } from '../types';
import apiClient from '@/services/apiClient';

const relatoriosService = {
  getInadimplenciaReport: async (condominioId?: string, minDiasAtraso?: number): Promise<InadimplenciaItem[]> => {
    const params: Record<string, string | number> = {};
    if (condominioId) params.condominioId = condominioId;
    if (typeof minDiasAtraso === 'number') params.minDiasAtraso = minDiasAtraso;
    const response = await apiClient.get<InadimplenciaItem[]>('/cobranca/inadimplencia', { params });
    return response.data;
  }
};

export default relatoriosService;