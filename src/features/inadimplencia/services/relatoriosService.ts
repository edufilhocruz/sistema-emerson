import { InadimplenciaItem } from '../types';
import apiClient from '@/services/apiClient';

const relatoriosService = {
  getInadimplenciaReport: async (condominioId?: string, minDiasAtraso?: number, dataRef?: Date): Promise<InadimplenciaItem[]> => {
    const params: Record<string, string | number> = {};
    if (condominioId) params.condominioId = condominioId;
    if (typeof minDiasAtraso === 'number') params.minDiasAtraso = minDiasAtraso;
    if (dataRef) params.dataRef = dataRef.toISOString();
    const response = await apiClient.get<InadimplenciaItem[]>('/cobranca/inadimplencia', { params });
    return response.data;
  }
};

export default relatoriosService;