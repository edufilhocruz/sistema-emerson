import { useState, useEffect, useCallback } from 'react';
import { Morador } from '../types';
import moradorService from '../services/moradorService';

export const useMoradores = () => {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoradores = useCallback(async () => {
    try {
      console.log('🔄 fetchMoradores: Iniciando busca de moradores...');
      setLoading(true);
      const data = await moradorService.getMoradores();
      console.log('✅ fetchMoradores: Dados recebidos:', data.length, 'moradores');
      setMoradores(data);
    } catch (err) {
      console.error('❌ fetchMoradores: Erro ao buscar moradores:', err);
      setError('Falha ao carregar a lista de moradores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoradores();
  }, [fetchMoradores]);

  return { moradores, loading, error, refresh: fetchMoradores };
};