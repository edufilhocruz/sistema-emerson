import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { InadimplenciaKpis } from '../types';

const KpiCard = ({ title, value }: { title: string, value: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-3xl">{value}</CardTitle>
    </CardHeader>
  </Card>
);

interface Props {
  kpis: InadimplenciaKpis | null;
  loading: boolean;
}

export const InadimplenciaKpiCards = ({ kpis, loading }: Props) => {
  if (loading) {
    return (
      <>
        <Skeleton className="h-[105px] w-full" />
        <Skeleton className="h-[105px] w-full" />
        <Skeleton className="h-[105px] w-full" />
      </>
    );
  }

  if (!kpis) return null;

  return (
    <>
      <KpiCard title="Valor Total Inadimplente" value={kpis.totalInadimplente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      <KpiCard title="Unidades Inadimplentes" value={String(kpis.totalUnidades)} />
      <KpiCard title="Média de Dias em Atraso" value={`${kpis.mediaDiasAtraso} dias`} />
    </>
  );
};