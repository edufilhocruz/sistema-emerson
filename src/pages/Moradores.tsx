import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useMoradores } from '@/features/moradores/hooks/useMoradores';
import { MoradoresTable } from '@/features/moradores/components/MoradoresTable';
import { MoradoresActions } from '@/features/moradores/components/MoradoresActions';
import { MoradorForm } from '@/features/moradores/components/MoradorForm';
import { MoradorFormData } from '@/features/moradores/types';
import { MoradoresFilters } from '@/features/moradores/components/MoradoresFilters';
import moradorService from '@/features/moradores/services/moradorService';
import { toast } from '@/components/ui/use-toast';
import cobrancaService from '@/features/cobranca/services/cobrancaService';

const MoradoresPage = () => {
    const { moradores, loading, error, refresh } = useMoradores();
    const [forceUpdate, setForceUpdate] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedMorador, setSelectedMorador] = useState<any | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [filtros, setFiltros] = useState({
        statusPagamento: undefined,
        tipoCobranca: undefined,
        condominioId: undefined,
        statusEnvio: undefined,
    });
    const [historicoOpen, setHistoricoOpen] = useState(false);
    const [moradorHistorico, setMoradorHistorico] = useState<any | null>(null);
    const [historico, setHistorico] = useState<any[]>([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);


    const filteredMoradores = useMemo(() => {
        return moradores.filter(morador => {
            const searchMatch = !searchTerm ||
                morador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                morador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (morador.condominio?.nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                morador.apartamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                morador.bloco.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro avançado
            const statusPagamentoMatch = !filtros.statusPagamento || morador.statusPagamento === filtros.statusPagamento;
            const tipoCobrancaMatch = !filtros.tipoCobranca || morador.ultimaCobrancaTipo === filtros.tipoCobranca;
            const condominioMatch = !filtros.condominioId || morador.condominio?.id === filtros.condominioId;
            const statusEnvioMatch = !filtros.statusEnvio || morador.ultimaCobrancaStatusEnvio === filtros.statusEnvio;

            return searchMatch && statusPagamentoMatch && tipoCobrancaMatch && condominioMatch && statusEnvioMatch;
        });
    }, [moradores, searchTerm, filtros]);

    const handleSaveMorador = async (data: any) => {
        console.log('Tentando salvar morador:', data, 'editId:', editId);
        try {
            if (editId) {
                const res = await moradorService.updateMorador(editId, data);
                console.log('Resposta updateMorador:', res);
                toast({ title: 'Morador atualizado com sucesso!' });
            } else {
                const res = await moradorService.createMorador(data);
                console.log('Resposta createMorador:', res);
                toast({ title: 'Morador criado com sucesso!' });
            }
            
            // Fechar formulário e limpar estados
            setIsFormOpen(false);
            setEditId(null);
            setSelectedMorador(null);
            
            // Atualizar lista
            await refresh();
            
        } catch (err) {
            console.error('❌ Erro ao salvar morador:', err);
            let description = 'Não foi possível salvar o morador.';
            if (err?.response?.data?.message) {
                description = err.response.data.message;
            }
            toast({ variant: 'destructive', title: 'Erro', description });
            throw err; // Re-throw para o hook tratar
        }
    };

    const handleEdit = (morador: any) => {
        setSelectedMorador({
            ...morador,
            condominioId: morador.condominioId || morador.condominio?.id,
        });
        setEditId(morador.id);
        setIsFormOpen(true);
    };

    const handleDelete = async (morador: any) => {
        try {
            await moradorService.deleteMorador(morador.id);
            toast({ title: 'Morador excluído com sucesso!' });
            refresh();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o morador.' });
        }
    };

    const handleFiltros = (f: any) => setFiltros(f);
    const handleLimparFiltros = () => setFiltros({ statusPagamento: undefined, tipoCobranca: undefined, condominioId: undefined, statusEnvio: undefined });

    const handleVerHistorico = async (morador: any) => {
        setMoradorHistorico(morador);
        setHistoricoOpen(true);
        setLoadingHistorico(true);
        try {
            const data = await cobrancaService.getHistoricoCobrancasPorMorador(morador.id);
            setHistorico(data);
        } catch (err) {
            setHistorico([]);
        } finally {
            setLoadingHistorico(false);
        }
    };

    return (
        <>
            <div className="flex h-screen bg-bg-secondary">
                <Sidebar />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Gestão de Moradores" />
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                        <MoradoresActions 
                            onAddClick={() => setIsFormOpen(true)}
                            onSearchChange={setSearchTerm}
                        />
                        <Card className="rounded-2xl shadow-sm border">
                            <CardHeader>
                                <CardTitle>Lista de Moradores</CardTitle>
                                <div className="flex justify-between items-center">
                                  <CardDescription>Visualize e gerencie todos os moradores cadastrados.</CardDescription>
                                  <MoradoresFilters onFilter={handleFiltros} onClear={handleLimparFiltros} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading && <Skeleton className="h-[300px] w-full" />}
                                {!loading && !error && <MoradoresTable 
                                    moradores={filteredMoradores} 
                                    onEdit={handleEdit} 
                                    onDelete={handleDelete} 
                                    onVerHistorico={handleVerHistorico}
                                />}
                                {error && <p className="text-destructive text-center py-10">{error}</p>}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            <MoradorForm
                mode={editId ? 'edit' : 'create'}
                initialData={selectedMorador || undefined}
                onSubmit={handleSaveMorador}
                onCancel={() => {
                    setIsFormOpen(false);
                    setEditId(null);
                    setSelectedMorador(null);
                }}
                open={isFormOpen}
            />
            <Dialog open={historicoOpen} onOpenChange={(open) => { setHistoricoOpen(open); if (!open) { setMoradorHistorico(null); setHistorico([]); } }}>
                <DialogContent className="max-w-2xl">
                    <Card className="rounded-2xl shadow-sm border">
                        <CardHeader>
                            <CardTitle>Histórico de Cobranças</CardTitle>
                            <CardDescription>
                                {moradorHistorico?.nome} - {moradorHistorico?.bloco}-{moradorHistorico?.apartamento}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingHistorico ? (
                                <Skeleton className="h-[120px] w-full" />
                            ) : historico.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">Nenhuma cobrança encontrada para este morador.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left font-semibold p-2">Data e Horário de Envio</th>
                                            <th className="text-left font-semibold p-2">Vencimento</th>
                                            <th className="text-left font-semibold p-2">Valor</th>
                                            <th className="text-left font-semibold p-2">Status</th>
                                            <th className="text-left font-semibold p-2">Status Envio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historico.map((c) => (
                                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-2">
                                                    {c.dataEnvio ? 
                                                        new Date(c.dataEnvio).toLocaleString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) 
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="p-2">
                                                    {c.vencimento ? 
                                                        new Date(c.vencimento).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        }) 
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="p-2 font-medium">
                                                    R$ {Number(c.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        c.status === 'PAGO' ? 'bg-green-100 text-green-800' :
                                                        c.status === 'ATRASADO' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        c.statusEnvio === 'ENVIADO' ? 'bg-green-100 text-green-800' :
                                                        c.statusEnvio === 'ERRO' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {c.statusEnvio}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default MoradoresPage;