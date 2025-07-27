import { EvolutionData } from '@/entities/dashboard/types';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface EvolutionChartProps {
  data: EvolutionData | undefined;
  loading?: boolean;
}

/**
 * Documentação: EvolutionChart (com Recharts)
 * - Utiliza a biblioteca `recharts` para criar um gráfico profissional.
 * - `ResponsiveContainer` garante que o gráfico ocupe todo o espaço do card.
 * - `AreaChart` desenha o gráfico de área com curvas suaves (`type="natural"`).
 * - `CartesianGrid` cria as linhas de grade horizontais.
 * - `XAxis` e `YAxis` criam os eixos com base nos dados.
 */
export const EvolutionChart = ({ data, loading }: EvolutionChartProps) => {
  // Configuração de cores e estilos para o ChartContainer
  const chartConfig = {
    inadimplencia: {
      label: "Inadimplência",
      color: "hsl(var(--primary-gold))",
    },
  };

  if (loading) {
    return (
      <div className="lg:col-span-2 card-enhanced animate-pulse p-6">
        <div className="h-6 bg-border rounded mb-4 w-48"></div>
        <div className="h-80 bg-border rounded"></div>
      </div>
    );
  }

  if (!data || !data.dataPoints || data.dataPoints.length === 0) {
    return (
      <div className="lg:col-span-2 card-enhanced flex h-[400px] items-center justify-center">
        <p className="text-text-muted">Sem dados para exibir.</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 card-enhanced">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Evolução da Inadimplência
        </h3>
        <div className="h-80 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer>
              <AreaChart data={data.dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillInadimplencia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-inadimplencia)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-inadimplencia)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickCount={5}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="value"
                  type="natural" // Isso cria as curvas suaves
                  fill="url(#fillInadimplencia)"
                  stroke="var(--color-inadimplencia)"
                  strokeWidth={2}
                  dot={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};