import { useMemo } from 'react';
import { EvolutionData, PaymentStats } from '@/entities/dashboard/types';
import { ChartCalculator, CircularProgressCalculator } from '@/shared/libs/chart-utils';

// Hook for chart data processing and calculations
export const useCharts = (evolution: EvolutionData | undefined, payments: PaymentStats | undefined) => {
  // Evolution chart calculations
  const evolutionChart = useMemo(() => {
    if (!evolution) return null;

    const chartWidth = 420;
    const chartHeight = 200;
    const pathPoints = ChartCalculator.calculatePath(evolution.dataPoints, chartWidth, chartHeight);
    const maxValue = Math.max(...evolution.dataPoints.map(p => p.value));
    const yAxisLabels = ChartCalculator.calculateYAxisLabels(maxValue);

    return {
      pathPoints,
      maxValue,
      yAxisLabels,
      trend: evolution.trend,
      gradientId: 'evolutionGradient'
    };
  }, [evolution]);

  // Payment chart calculations
  const paymentChart = useMemo(() => {
    if (!payments) return null;

    const radius = 80;
    const strokeDasharray = CircularProgressCalculator.calculateStrokeDasharray(payments.paidPercentage, radius);
    const strokeDashoffset = CircularProgressCalculator.calculateStrokeDashoffset(25, radius);

    return {
      radius,
      strokeDasharray,
      strokeDashoffset,
      percentage: payments.paidPercentage,
      centerText: `${payments.paidPercentage}%`,
      subtitle: 'Pagos'
    };
  }, [payments]);

  // Chart performance insights
  const insights = useMemo(() => {
    if (!evolution || !payments) return null;

    const recentTrend = evolution.dataPoints.slice(-3);
    const avgRecent = recentTrend.reduce((sum, point) => sum + point.value, 0) / recentTrend.length;
    const firstHalf = evolution.dataPoints.slice(0, 3);
    const avgFirstHalf = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;

    const improvement = ((avgRecent - avgFirstHalf) / avgFirstHalf) * 100;

    return {
      improvement: parseFloat(improvement.toFixed(1)),
      paymentHealth: payments.paidPercentage >= 70 ? 'good' : payments.paidPercentage >= 50 ? 'average' : 'poor',
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable'
    };
  }, [evolution, payments]);

  return {
    evolutionChart,
    paymentChart,
    insights
  };
};