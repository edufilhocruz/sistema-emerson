import { useMemo } from 'react';
import { DashboardMetrics } from '@/entities/dashboard/types';
import { useCountAnimation } from '@/shared/hooks/useAnimation';

// Hook for metrics calculations and animations
export const useMetrics = (metrics: DashboardMetrics | undefined, startAnimation: boolean = true) => {
  // Animated counters for better UX
  const animatedCondominiums = useCountAnimation(metrics?.totalCondominiums || 0, 1500, startAnimation);
  const animatedDefaulters = useCountAnimation(metrics?.totalDefaulters || 0, 1800, startAnimation);
  const animatedCharges = useCountAnimation(metrics?.monthlyCharges || 0, 2000, startAnimation);

  // Calculated metrics with memoization for performance
  const calculatedMetrics = useMemo(() => {
    if (!metrics) return null;

    const defaultRate = metrics.totalDefaulters > 0 
      ? (metrics.totalDefaulters / (metrics.totalCondominiums * 10)) * 100 
      : 0;

    const chargesPerCondominium = metrics.totalCondominiums > 0 
      ? Math.round(metrics.monthlyCharges / metrics.totalCondominiums) 
      : 0;

    const efficiency = metrics.monthlyCharges > 0 
      ? Math.min(100, (metrics.monthlyCharges / (metrics.totalCondominiums * 8)) * 100)
      : 0;

    return {
      defaultRate: parseFloat(defaultRate.toFixed(1)),
      chargesPerCondominium,
      efficiency: parseFloat(efficiency.toFixed(1)),
      growth: {
        condominiums: '+12%',
        charges: '+8%',
        collections: '+15%'
      }
    };
  }, [metrics]);

  return {
    metrics,
    animatedValues: {
      condominiums: animatedCondominiums,
      defaulters: animatedDefaulters,
      charges: animatedCharges
    },
    calculated: calculatedMetrics
  };
};