import { DashboardMetrics } from '@/entities/dashboard/types';
import { useMetrics } from '../hooks/useMetrics';

interface MetricsSectionProps {
  metrics: DashboardMetrics | undefined;
  loading?: boolean;
}

/**
 * Documentação: MetricCard (Versão Simplificada)
 * - Removemos toda a lógica de animação. O card é sempre visível.
 */
const MetricCard = ({ title, value, trend }: { title: string; value: number; trend?: string; }) => (
  <div className="card-enhanced">
    <div className="p-6">
      <h3 className="text-base font-medium text-text-secondary mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">
          {value.toLocaleString('pt-BR')}
        </p>
        {trend && (
          <span className="text-sm font-medium text-success">
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

/**
 * Documentação: MetricsSection (Versão Robusta e Simplificada)
 * - Toda a lógica de animação (useIntersectionAnimation, useStaggeredAnimation) foi removida.
 * - O componente foca-se apenas em renderizar os dados após o carregamento.
 */
export const MetricsSection = ({ metrics, loading }: MetricsSectionProps) => {
  // Passamos 'true' para o hook de métricas para que a contagem comece imediatamente.
  const { animatedValues, calculated } = useMetrics(metrics, true);

  // Renderiza o esqueleto de carregamento
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card-enhanced animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-border rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-border rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total de Condomínios"
        value={animatedValues.condominiums}
        trend={calculated?.growth.condominiums}
      />
      <MetricCard
        title="Total de Inadimplentes"
        value={animatedValues.defaulters}
      />
      <MetricCard
        title="Cobranças Enviadas"
        value={animatedValues.charges}
        trend={calculated?.growth.charges}
      />
    </section>
  );
};