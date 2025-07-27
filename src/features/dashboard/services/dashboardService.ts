import apiClient from '@/services/apiClient';
import { DashboardData } from '@/entities/dashboard/types';
import { MOCK_DASHBOARD_DATA } from '@/entities/dashboard/constants';

// Interface para definir o contrato do serviço
interface IDashboardService {
  getDashboardData(): Promise<DashboardData>;
}

// Implementação do serviço
const dashboardService: IDashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get<DashboardData>('/dashboard'); // endpoint relativo
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw new Error('Não foi possível carregar os dados do dashboard.');
    }
  },
};

export default dashboardService;