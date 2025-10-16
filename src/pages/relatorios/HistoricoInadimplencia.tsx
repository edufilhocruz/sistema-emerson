import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InadimplenciaFilters } from "@/features/inadimplencia/components/InadimplenciaFilters";
import { InadimplenciaKpiCards } from "@/features/inadimplencia/components/InadimplenciaKpiCards";
import { InadimplenciaTable } from "@/features/inadimplencia/components/InadimplenciaTable";
import { useInadimplenciaReport } from "@/features/inadimplencia/hooks/useInadimplenciaReport";
import { useState } from "react";

const HistoricoInadimplenciaPage = () => {
  const [condominioId, setCondominioId] = useState<string | undefined>();
  const [minDiasAtraso, setMinDiasAtraso] = useState<number | undefined>(undefined);
  const { data, kpis, loading, error } = useInadimplenciaReport(condominioId, minDiasAtraso);

  const renderContent = () => {
    if (error) {
      return <p className="text-destructive text-center">{error}</p>;
    }

    return (
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detalhes da Inadimplência</CardTitle>
            <CardDescription>Lista de todos os moradores com pendências financeiras.</CardDescription>
          </div>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button>
        </CardHeader>
        <CardContent>
          <InadimplenciaTable data={data} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Relatório de Inadimplência" />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InadimplenciaKpiCards kpis={kpis} loading={loading} />
          </section>
          
          <InadimplenciaFilters onFilter={(id, dias) => { setCondominioId(id); setMinDiasAtraso(dias); }} />

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HistoricoInadimplenciaPage;