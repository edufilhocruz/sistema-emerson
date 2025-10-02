import React, { useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Search } from "lucide-react";
import { CobrancasReportFilters } from "@/features/cobranca/components/CobrancasReport/CobrancasReportFilters";
import { CobrancasTable } from "@/features/cobranca/components/CobrancasReport/CobrancasTable";
import { useCobrancasReport } from "@/features/cobranca/hooks/useCobrancasReport";
import { Skeleton } from "@/components/ui/skeleton";

const ImprimirCobrancaPage = () => {
    const [condominioId, setCondominioId] = useState<string | undefined>();
    const { data, loading, error, setFilters } = useCobrancasReport(condominioId);

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
            return (
                <div className="text-center py-16">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Nenhuma cobrança encontrada
                    </h3>
                    <p className="text-muted-foreground">
                        Aplique filtros ou verifique se há cobranças enviadas no período selecionado.
                    </p>
                </div>
            );
        }
        return <CobrancasTable data={data} />;
    };

    return (
        <div className="flex h-screen bg-bg-secondary">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title="Imprimir Cobranças" />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                    
                    {/* Instruções */}
                    <Card className="rounded-2xl shadow-sm border border-primary/20 bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Printer className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-primary mb-1">
                                        Como imprimir cobranças
                                    </h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>1. Use os filtros para encontrar as cobranças desejadas</p>
                                        <p>2. Selecione as cobranças marcando os checkboxes</p>
                                        <p>3. Clique em "Imprimir Cartas" para gerar as cartas formatadas</p>
                                        <p>4. Revise no modal e imprima em formato A4</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Filtros */}
                    <CobrancasReportFilters onFilterChange={handleFilterChange} />

                    {/* Tabela de Cobranças */}
                    <Card className="rounded-2xl shadow-sm border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Printer className="h-5 w-5" />
                                    Selecionar Cobranças para Impressão
                                </CardTitle>
                                <CardDescription>
                                    Selecione as cobranças que deseja imprimir em formato de carta
                                </CardDescription>
                            </div>
                            {data.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    {data.length} cobrança{data.length !== 1 ? 's' : ''} encontrada{data.length !== 1 ? 's' : ''}
                                </div>
                            )}
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

export default ImprimirCobrancaPage;
