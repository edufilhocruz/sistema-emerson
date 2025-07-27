import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CondominiumChargeStatus } from "@/entities/dashboard/types";
import { Building2 } from "lucide-react";

interface Props {
  data: CondominiumChargeStatus[];
  loading: boolean;
}

const StatusItem = ({ item }: { item: CondominiumChargeStatus }) => {
  const percentage = item.totalUnits > 0 ? (item.chargesSent / item.totalUnits) * 100 : 0;
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="bg-gold/10 p-3 rounded-lg">
        <Building2 className="h-6 w-6 text-gold" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{item.chargesSent}</span> / {item.totalUnits} enviados
          </p>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
};

export const CondominiumStatusList = ({ data, loading }: Props) => {
  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle>Status de Cobranças por Condomínio</CardTitle>
        <CardDescription>Cobranças enviadas no mês atual.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {data.map(item => (
          <StatusItem key={item.id} item={item} />
        ))}
      </CardContent>
    </Card>
  );
};