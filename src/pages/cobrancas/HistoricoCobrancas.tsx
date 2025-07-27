import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Imports atualizados para a feature 'cobranca'
import { CobrancasKpiCards } from "@/features/cobranca/components/CobrancasReport/CobrancasKpiCards";
import { CobrancasTable } from "@/features/cobranca/components/CobrancasReport/CobrancasTable";
import { useCobrancasReport } from "@/features/cobranca/hooks/useCobrancasReport";

const HistoricoCobrancasPage = () => {
    const { data, kpis, loading, error, refresh } = useCobrancasReport();

    const renderContent = () => {
        if (loading && data.length === 0) {
            return <Skeleton className="h-[300px] w-full" />;
        }
        if (error) {
            return <p className="text-destructive text-center py-10">{error}</p>;
        }
        if (data.length === 0 && !loading) {
            return <p className="text-muted-foreground text-center py-10">Nenhum dado de cobrança encontrado.</p>;
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
                    
                    <Card className="rounded-2xl shadow-sm border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Histórico de Cobranças Enviadas</CardTitle>
                                <CardDescription>Detalhes de todas as cobranças processadas.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={refresh} disabled={loading}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    Atualizar
                                </Button>
                                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                            </div>
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