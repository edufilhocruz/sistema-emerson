import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { Morador } from '../types';

export const useMoradoresPorCondominio = (condominioId: string | null) => {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!condominioId) {
      setMoradores([]);
      return;
    }
    const fetchMoradores = async () => {
      setLoading(true);
      try {
        // Assumindo que o backend terá uma rota /morador/por-condominio/:id
        // Por agora, vamos filtrar do lado do cliente
        const response = await apiClient.get<Morador[]>(`/morador`);
        const filtered = response.data.filter(m => (m as any).condominioId === condominioId);
        setMoradores(filtered);
      } catch (error) {
        console.error("Falha ao buscar moradores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMoradores();
  }, [condominioId]);

  return { moradores, loading };
};
