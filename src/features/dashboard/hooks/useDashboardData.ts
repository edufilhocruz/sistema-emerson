import { useState, useEffect } from 'react';
import { DashboardData, DateRangeFilter } from '@/entities/dashboard/types';
import dashboardService from '../services/dashboardService';

export const useDashboardData = (selectedCondominioId: string = 'todos', dateRange: DateRangeFilter = '30d') => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedCondominioId, dateRange]);

  return { data, loading, error };
};