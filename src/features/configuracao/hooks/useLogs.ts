import { useState, useEffect, useCallback } from 'react';
import { LogEntry } from '../types';
import configuracaoService from '../services/configuracaoService';

export const useLogs = (currentPage: number, limit: number = 10) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true);
    const { logs: data, total: totalCount } = await configuracaoService.getLogs({ page, limit });
    setLogs(data);
    setTotal(totalCount);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, fetchLogs]);

  return { logs, total, loading, pageCount: Math.ceil(total / limit) };
};