import apiClient from '@/services/apiClient';
import { DashboardData } from '@/entities/dashboard/types';
import { MOCK_DASHBOARD_DATA } from '@/entities/dashboard/constants';

// Interface para definir o contrato do serviço
interface IDashboardService {
  getDashboardData(): Promise<DashboardData>;
  getDashboardDataByPeriod(mes?: number, ano?: number): Promise<DashboardData>;
  getCondominiosPendentes(mes?: number, ano?: number): Promise<any>;
  getCobrancasEnviadasPorCondominio(mes?: number, ano?: number): Promise<any>;
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

  getDashboardDataByPeriod: async (mes?: number, ano?: number): Promise<DashboardData> => {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes.toString());
      if (ano) params.append('ano', ano.toString());
      
      const response = await apiClient.get<DashboardData>(`/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard por período:', error);
      throw new Error('Não foi possível carregar os dados do dashboard para o período selecionado.');
    }
  },

  getCondominiosPendentes: async (mes?: number, ano?: number): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes.toString());
      if (ano) params.append('ano', ano.toString());
      
      const response = await apiClient.get(`/dashboard/condominios-pendentes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar condomínios pendentes:', error);
      throw new Error('Não foi possível carregar os condomínios pendentes.');
    }
  },

  getCobrancasEnviadasPorCondominio: async (mes?: number, ano?: number): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes.toString());
      if (ano) params.append('ano', ano.toString());
      
      const response = await apiClient.get(`/dashboard/cobrancas-enviadas-por-condominio?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças enviadas por condomínio:', error);
      throw new Error('Não foi possível carregar as cobranças enviadas por condomínio.');
    }
  },
};

export default dashboardService;