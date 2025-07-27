import { useState, useEffect, useCallback } from 'react';
import { EmailFormData } from '../types';
import configuracaoService from '../services/configuracaoService';

export const useEmailConfig = () => {
  const [config, setConfig] = useState<Partial<EmailFormData>>({});
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const data = await configuracaoService.getEmailConfig();
    setConfig(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, refresh: fetchConfig };
};