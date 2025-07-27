import { useState, useEffect, useCallback } from 'react';
import { SegurancaFormData } from '../types';
import configuracaoService from '../services/configuracaoService';

export const useSegurancaConfig = () => {
  const [config, setConfig] = useState<Partial<SegurancaFormData>>({});
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const data = await configuracaoService.getSegurancaConfig();
    setConfig(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading };
};