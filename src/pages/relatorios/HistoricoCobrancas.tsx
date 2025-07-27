import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CobrancasKpiCards } from "@/features/cobranca/components/CobrancasReport/CobrancasKpiCards";
import { CobrancasTable } from "@/features/cobranca/components/CobrancasReport/CobrancasTable";
import { useCobrancasReport } from "@/features/cobranca/hooks/useCobrancasReport";
import { CobrancasReportFilters } from "@/features/cobranca/components/CobrancasReport/CobrancasReportFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const HistoricoCobrancasPage = () => {
    const [condominioId, setCondominioId] = useState<string | undefined>();
    const { data, kpis, loading, error, setFilters } = useCobrancasReport(condominioId);

    const handleFilterChange = (filters: any) => {
        setFilters(filters);
        setCondominioId(filters.condominioId);
    };

    const renderContent = () => {
        if (loading) {
            return <Skeleton className="h-[300px] w-full" />;
        }
        if (error) {
            return <p className="text-destructive text-center py-10">{error}</p>;
        }
        if (data.length === 0) {
            return <p className="text-center text-muted-foreground py-10">Nenhuma cobrança encontrada para o filtro selecionado.</p>
        }
        return <CobrancasTable data={data} />;
    };

    return (
        <div className="flex h-screen bg-bg-secondary">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title="Relatório de Cobranças" />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CobrancasKpiCards kpis={kpis} loading={loading} />
                    </section>
                    
                    <CobrancasReportFilters onFilterChange={handleFilterChange} />

                    <Card className="rounded-2xl shadow-sm border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Cobranças Enviadas</CardTitle>
                                <CardDescription>Detalhes das cobranças processadas com base no filtro aplicado.</CardDescription>
                            </div>
                            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                        </CardHeader>
                        <CardContent>
                            {renderContent()}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default HistoricoCobrancasPage;