'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters";
import { MOCK_DASHBOARD_DATA } from '@/entities/dashboard/constants';
import { DateRangeFilter } from '@/entities/dashboard/types';

// Componentes do novo layout do Dashboard
import { MetricsSection } from '@/features/dashboard/components/MetricsSection';
import { SituacaoFinanceiraCard } from '@/features/dashboard/components/SituacaoFinanceiraCard';
import { AFazerCard } from '@/features/dashboard/components/AFazerCard';
import { CondominiumStatusList } from '@/features/dashboard/components/CondominiumStatusList';
import { RecentChargesTable } from '@/features/dashboard/components/RecentChargesTable';

export const DashboardPage = () => {
  const [selectedCondominioId, setSelectedCondominioId] = useState('todos');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');
  const { data, loading, error } = useDashboardData(selectedCondominioId, dateRange);

  // A lista de condomínios para o dropdown de filtros é sempre a lista completa.
  const allCondominios = (data?.condominios || []).map(c => ({ id: c.id, name: c.nome }));

  if (error) {
    return (
      <div className="flex h-screen bg-bg-secondary">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Erro ao carregar dashboard</h3>
            <p className="text-text-muted">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Visão Geral" />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <ErrorBoundary>
            <DashboardFilters 
              condominios={allCondominios}
              onCondominioChange={setSelectedCondominioId} 
              onDateRangeChange={setDateRange}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <MetricsSection metrics={data?.metrics} loading={loading} />
          </ErrorBoundary>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ErrorBoundary>
                <SituacaoFinanceiraCard 
                  data={data?.situacaoFinanceira} 
                  erros={data?.enviosComErro} 
                  loading={loading} 
                />
             </ErrorBoundary>
             <ErrorBoundary>
                <AFazerCard data={data?.statusCobrancaMensal} loading={loading} />
             </ErrorBoundary>
             <ErrorBoundary>
                <CondominiumStatusList data={data?.condominiumStatus || []} loading={loading} />
             </ErrorBoundary>
             <ErrorBoundary>
               <RecentChargesTable recentCharges={data?.recentCharges || []} />
             </ErrorBoundary>
          </section>
        </div>
      </main>
    </div>
  );
};