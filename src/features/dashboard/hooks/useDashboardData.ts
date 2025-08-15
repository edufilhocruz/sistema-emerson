import { useState, useEffect } from 'react';
import { DashboardData, DateRangeFilter, PeriodFilter } from '@/entities/dashboard/types';
import dashboardService from '../services/dashboardService';

export const useDashboardData = (
  selectedCondominioId: string = 'todos', 
  dateRange: DateRangeFilter = 'mes_atual',
  periodFilter?: PeriodFilter
) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Se temos um filtro de período específico, usa ele
        if (periodFilter && periodFilter.tipo === 'mes_especifico') {
          const dashboardData = await dashboardService.getDashboardDataByPeriod(
            periodFilter.mes,
            periodFilter.ano
          );
          setData(dashboardData);
        } else {
          // Caso contrário, usa o método padrão
          const dashboardData = await dashboardService.getDashboardData();
          setData(dashboardData);
        }
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedCondominioId, dateRange, periodFilter]);

  return { data, loading, error };
};