import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogs } from '../hooks/useLogs';
// CORREÇÃO AQUI: Garantindo que os nomes de arquivos e pastas correspondem exatamente.
import { LogsTable } from './Logs/LogsTable';
import { LogsFilters } from './Logs/LogsFilters';
import { LogsPagination } from './Logs/LogsPagination';

export const LogsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { logs, pageCount, loading } = useLogs(currentPage);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Logs e Auditoria</h3>
        <p className="text-muted-foreground">Acompanhe os eventos importantes que ocorrem no sistema.</p>
      </div>
      <LogsFilters />
      {loading ? <Skeleton className="h-96 w-full" /> : <LogsTable logs={logs} />}
      {pageCount > 0 && (
         <LogsPagination currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} />
      )}
    </div>
  );
};