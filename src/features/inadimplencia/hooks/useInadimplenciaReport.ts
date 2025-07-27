import { useState, useEffect, useMemo } from 'react';
import { InadimplenciaItem, InadimplenciaKpis } from '../types';
import relatoriosService from '../services/relatoriosService';

export const useInadimplenciaReport = (condominioId?: string) => {
  const [data, setData] = useState<InadimplenciaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await relatoriosService.getInadimplenciaReport(condominioId);
        setData(reportData);
      } catch (err) {
        setError('Falha ao carregar o relatório de inadimplência.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [condominioId]);

  const kpis = useMemo<InadimplenciaKpis | null>(() => {
    if (data.length === 0) return null;

    const totalInadimplente = data.reduce((acc, item) => acc + item.valor, 0);
    const totalUnidades = data.length;
    const mediaDiasAtraso = Math.round(data.reduce((acc, item) => acc + item.diasAtraso, 0) / totalUnidades);

    return { totalInadimplente, totalUnidades, mediaDiasAtraso };
  }, [data]);

  return {
    data,
    kpis,
    loading,
    error,
    setData,
  };
};