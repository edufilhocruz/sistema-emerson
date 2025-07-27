import { PaymentStats } from '@/entities/dashboard/types';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface PaymentChartProps {
  data: PaymentStats | undefined;
  loading?: boolean;
}

/**
 * Documentação: PaymentChart (Versão com Fonte Maior)
 * - A fonte do subtítulo "Pagos" foi aumentada para 'text-lg' para maior destaque.
 */
export const PaymentChart = ({ data, loading }: PaymentChartProps) => {
  const chartConfig = {
    pagos: {
      label: "Pagos",
      color: "hsl(var(--primary-gold))",
    },
    inadimplentes: {
      label: "Inadimplentes",
      color: "hsl(var(--chart-secondary))",
    },
  };

  if (loading) {
    return (
      <div className="card-enhanced animate-pulse p-6">
        <div className="h-6 bg-border rounded mb-4 w-48"></div>
        <div className="h-48 w-48 bg-border rounded-full mx-auto"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card-enhanced flex h-[350px] items-center justify-center">
        <p className="text-text-muted">Sem dados para exibir.</p>
      </div>
    );
  }

  const chartData = [
    { name: 'pagos', value: data.paidPercentage, fill: "var(--color-pagos)" },
    { name: 'inadimplentes', value: data.defaultPercentage, fill: "var(--color-inadimplentes)" },
  ];

  return (
    <div className="card-enhanced flex flex-col">
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-foreground mb-4">Proporção de Pagamentos</h3>
        <div className="relative flex-grow flex items-center justify-center min-h-[240px]">
          <ChartContainer config={chartConfig} className="absolute inset-0">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="70%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={450}
                  cornerRadius={5}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">
              {data.paidPercentage}%
            </span>
            {/* Alteração aqui: Tamanho da fonte aumentado para 'text-lg' */}
            <span className="text-lg text-text-muted">Pagos</span>
          </div>
        </div>

        <div className="flex justify-around mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-gold"></span>
            <span>Pagos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-chart-secondary"></span>
            <span>Inadimplentes</span>
          </div>
        </div>
      </div>
    </div>
  );
};