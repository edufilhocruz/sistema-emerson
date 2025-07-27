import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetrics } from "@/entities/dashboard/types";
import { Building, UserX, FileText } from "lucide-react";

const Stat = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: number }) => (
  <div className="flex items-center gap-4">
    <Icon className="h-8 w-8 text-muted-foreground" />
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export const IndicadoresGeraisCard = ({ metrics, loading }: { metrics?: DashboardMetrics, loading: boolean }) => {
  if (loading) return <Skeleton className="h-full w-full" />;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">📊 Indicadores Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Stat icon={Building} label="Total de Condomínios" value={metrics?.totalCondominiums || 0} />
        <Stat icon={UserX} label="Inadimplentes" value={metrics?.totalDefaulters || 0} />
        <Stat icon={FileText} label="Cobranças no mês" value={metrics?.monthlyCharges || 0} />
      </CardContent>
    </Card>
  );
};