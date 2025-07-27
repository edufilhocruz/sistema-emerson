import { ChartDataPoint } from '@/entities/dashboard/types';

// Chart utilities following clean code principles
export class ChartCalculator {
  static calculatePath(points: ChartDataPoint[], width: number, height: number): string {
    if (points.length === 0) return '';

    const maxValue = Math.max(...points.map(p => p.value));
    const minValue = Math.min(...points.map(p => p.value));
    const range = maxValue - minValue || 1;

    const stepX = width / (points.length - 1);
    const padding = height * 0.1;

    const pathPoints = points.map((point, index) => {
      const x = index * stepX;
      const normalizedY = (point.value - minValue) / range;
      const y = height - (normalizedY * (height - 2 * padding) + padding);
      return `${x},${y}`;
    });

    return pathPoints.join(' ');
  }

  static generateGradientStops(color: string, opacity: number = 0.4): string[] {
    return [
      `stop-color: ${color}; stop-opacity: ${opacity}`,
      `stop-color: ${color}; stop-opacity: 0`
    ];
  }

  static calculateYAxisLabels(maxValue: number, steps: number = 5): number[] {
    const step = Math.ceil(maxValue / steps);
    return Array.from({ length: steps + 1 }, (_, i) => i * step);
  }
}

export class CircularProgressCalculator {
  static calculateStrokeDasharray(percentage: number, radius: number): string {
    const circumference = 2 * Math.PI * radius;
    const strokeLength = (percentage * circumference) / 100;
    return `${strokeLength} ${circumference}`;
  }

  static calculateStrokeDashoffset(startAngle: number, radius: number): number {
    const circumference = 2 * Math.PI * radius;
    return -((startAngle * circumference) / 100);
  }
}