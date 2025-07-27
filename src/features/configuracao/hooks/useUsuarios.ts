import { useState, useEffect, useCallback } from 'react';
import { Usuario } from '../types';
import usuarioService from '../services/usuarioService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usuarioService.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, loading, refresh: fetchUsuarios };
};