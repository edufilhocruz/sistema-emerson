import { useState, useEffect } from 'react';
import { ModeloCarta, ModeloFormData } from '@/entities/modelos/types';
import { modeloCartaService } from '../services/modeloCartaService';

export const useModelos = () => {
  const [modelos, setModelos] = useState<ModeloCarta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carrega todos os modelos
  const loadModelos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await modeloCartaService.getAll();
      setModelos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar modelos');
      console.error('Erro ao carregar modelos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carrega um modelo específico
  const loadModelo = async (id: string): Promise<ModeloCarta | null> => {
    try {
      setError(null);
      const data = await modeloCartaService.getById(id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar modelo');
      console.error('Erro ao carregar modelo:', err);
      return null;
    }
  };

  // Cria um novo modelo
  const createModelo = async (data: ModeloFormData): Promise<ModeloCarta | null> => {
    try {
      setSaving(true);
      setError(null);
      const novoModelo = await modeloCartaService.create(data);
      setModelos(prev => [novoModelo, ...prev]);
      return novoModelo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar modelo');
      console.error('Erro ao criar modelo:', err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Atualiza um modelo existente
  const updateModelo = async (id: string, data: ModeloFormData): Promise<ModeloCarta | null> => {
    try {
      setSaving(true);
      setError(null);
      const modeloAtualizado = await modeloCartaService.update(id, data);
      setModelos(prev => prev.map(m => m.id === id ? modeloAtualizado : m));
      return modeloAtualizado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar modelo');
      console.error('Erro ao atualizar modelo:', err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Remove um modelo
  const deleteModelo = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await modeloCartaService.delete(id);
      setModelos(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir modelo');
      console.error('Erro ao excluir modelo:', err);
      return false;
    }
  };

  // Carrega os modelos na inicialização
  useEffect(() => {
    loadModelos();
  }, []);

  return {
    modelos,
    loading,
    error,
    saving,
    loadModelos,
    loadModelo,
    createModelo,
    updateModelo,
    deleteModelo,
  };
};