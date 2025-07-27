import { useState, useEffect, useMemo, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { HistoricoCobranca, CobrancasKpis, CobrancaStatus } from '../types';
import cobrancaService from '../services/cobrancaService';

interface Filters {
  status: CobrancaStatus | 'todos';
  dateRange?: DateRange;
}

export const useCobrancasReport = (condominioId?: string) => {
  const [allData, setAllData] = useState<HistoricoCobranca[]>([]);
  const [filters, setFilters] = useState<Filters>({ status: 'todos' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await cobrancaService.getHistoricoCobrancas(condominioId);
        setAllData(reportData);
      } catch (err) {
        setError('Falha ao carregar o histórico de cobranças.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [condominioId]);

  // Lógica de filtragem corrigida e otimizada
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const statusMatch = filters.status === 'todos' || item.status === filters.status;
      
      // Se o status não corresponder, podemos parar aqui.
      if (!statusMatch) {
        return false;
      }

      // Se um filtro de data existir, aplicamos a lógica de data.
      if (filters.dateRange?.from) {
        const itemDate = new Date(item.dataEnvio);
        const fromDate = filters.dateRange.from;
        const toDate = filters.dateRange.to || fromDate;

        // Compara apenas a data, ignorando a hora, para evitar problemas de fuso horário.
        const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        return startOfDay(itemDate) >= startOfDay(fromDate) && startOfDay(itemDate) <= startOfDay(toDate);
      }
      
      // Se o status corresponde e não há filtro de data, o item é incluído.
      return true;
    });
  }, [allData, filters]);

  const kpis = useMemo<CobrancasKpis | null>(() => {
    const dataToCalculate = filteredData;
    if (dataToCalculate.length === 0 && !loading) return { totalArrecadado: 0, totalPendente: 0, taxaSucesso: 0 };
    if (dataToCalculate.length === 0) return null;
    
    const totalArrecadado = dataToCalculate.filter(c => c.status === 'Pago').reduce((acc, item) => acc + item.valor, 0);
    const totalPendente = dataToCalculate.filter(c => c.status !== 'Pago').reduce((acc, item) => acc + item.valor, 0);
    const totalCobrancas = totalArrecadado + totalPendente;
    const taxaSucesso = totalCobrancas > 0 ? (totalArrecadado / totalCobrancas) * 100 : 0;

    return { totalArrecadado, totalPendente, taxaSucesso };
  }, [filteredData, loading]);

  return {
    data: filteredData,
    kpis,
    loading,
    error,
    setFilters
  };
};