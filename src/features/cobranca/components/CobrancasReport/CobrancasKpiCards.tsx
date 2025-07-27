import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { CobrancasKpis } from '../../types';

const KpiCard = ({ title, value }: { title: string, value: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-3xl">{value}</CardTitle>
    </CardHeader>
  </Card>
);

interface Props {
  kpis: CobrancasKpis | null;
  loading: boolean;
}

export const CobrancasKpiCards = ({ kpis, loading }: Props) => {
  if (loading) {
    return Array.from({ length: 3 }).map((_, index) => (
      <Skeleton key={index} className="h-[105px] w-full" />
    ));
  }

  if (!kpis) return null;

  return (
    <>
      <KpiCard title="Total Arrecadado" value={kpis.totalArrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      <KpiCard title="Total Pendente" value={kpis.totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      <KpiCard title="Taxa de Sucesso" value={`${kpis.taxaSucesso.toFixed(1)}%`} />
    </>
  );
};