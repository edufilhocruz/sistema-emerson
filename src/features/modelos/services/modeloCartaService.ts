import apiClient from '@/services/apiClient';
import { ModeloCarta, ModeloFormData } from '@/entities/modelos/types';

const modeloCartaService = {
  getModelos: async (): Promise<ModeloCarta[]> => {
    const response = await apiClient.get<ModeloCarta[]>('/modelo-carta');
    return response.data;
  },

  createModelo: async (data: ModeloFormData): Promise<ModeloCarta> => {
    const response = await apiClient.post<ModeloCarta>('/modelo-carta', data);
    return response.data;
  },

  updateModelo: async (id: string, data: ModeloFormData): Promise<ModeloCarta> => {
    const response = await apiClient.patch<ModeloCarta>(`/modelo-carta/${id}`, data);
    return response.data;
  },

  deleteModelo: async (id: string): Promise<void> => {
    await apiClient.delete(`/modelo-carta/${id}`);
  },
};

export default modeloCartaService;