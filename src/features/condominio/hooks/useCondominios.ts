import { useState, useEffect, useCallback, useMemo } from 'react';
import { Condominio } from '../types';
import condominioService from '../services/condominioService';

/**
 * Hook centralizado para gerenciar todos os dados de condomínios.
 * Ele busca os dados da API e também fornece uma lista formatada
 * para uso em componentes de formulário (selects).
 */
export const useCondominios = () => {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCondominios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await condominioService.getCondominios();
      setCondominios(data);
    } catch (err) {
      setError('Falha ao carregar a lista de condomínios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCondominios();
  }, [fetchCondominios]);

  // NOVO: Memoizamos a lista formatada para performance.
  const condominioOptions = useMemo(() => {
    return condominios.map((condo) => ({
      value: condo.id,
      label: condo.nome,
    }));
  }, [condominios]);

  return { 
    condominios,          // Lista completa para tabelas
    condominioOptions,    // Lista formatada para selects
    loading, 
    error, 
    refresh: fetchCondominios 
  };
};