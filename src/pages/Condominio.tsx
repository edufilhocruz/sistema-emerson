import { useState, useMemo } from 'react';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { CondominiosTable } from '@/features/condominio/components/CondominiosTable';
import { CondominiosActions } from '@/features/condominio/components/CondominiosActions';
import { CondominioForm } from '@/features/condominio/components/CondominioForm';
import { CondominioFormData } from '@/features/condominio/types';
import condominioService from '@/features/condominio/services/condominioService';

const CondominiosPage = () => {
    const { condominios, loading, error, refresh } = useCondominios();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCondominio, setSelectedCondominio] = useState<CondominioFormData | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [salvoOpen, setSalvoOpen] = useState(false);

    const filteredCondominios = useMemo(() => {
        if (!searchTerm) return condominios;
        return condominios.filter(condo =>
            condo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (condo.cnpj && condo.cnpj.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
        );
    }, [condominios, searchTerm]);

    const handleSave = async (data: CondominioFormData) => {
        setIsSaving(true);
        try {
            if (editId) {
                await condominioService.updateCondominio(editId, data);
                toast({ title: "Sucesso!", description: `O condomínio "${data.nome}" foi atualizado.` });
            } else {
                await condominioService.createCondominio(data);
                toast({ title: "Sucesso!", description: `O condomínio "${data.nome}" foi criado.` });
            }
            setSalvoOpen(true);
            setTimeout(() => setSalvoOpen(false), 2000);
            setIsFormOpen(false);
            setEditId(null);
            setSelectedCondominio(null);
            refresh();
        } catch (err) {
            console.error("Falha ao salvar condomínio:", err);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o condomínio. Verifique os dados e tente novamente." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (condo: any) => {
        setSelectedCondominio({ ...condo });
        setEditId(condo.id);
        setIsFormOpen(true);
    };

    const handleDelete = async (condo: any) => {
        if (!window.confirm(`Tem certeza que deseja excluir o condomínio "${condo.nome}"?`)) return;
        try {
            await condominioService.deleteCondominio(condo.id);
            toast({ title: "Condomínio excluído com sucesso!" });
            refresh();
        } catch (err) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o condomínio." });
        }
    };

    return (
        <>
            <div className="flex h-screen bg-bg-secondary">
                <Sidebar />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Gestão de Condomínios" />
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                        <CondominiosActions 
                            onAddClick={() => setIsFormOpen(true)}
                            onSearchChange={setSearchTerm}
                        />
                        <Card className="rounded-2xl shadow-sm border">
                            <CardHeader>
                                <CardTitle>Lista de Condomínios</CardTitle>
                                <CardDescription>Visualize e gerencie todos os condomínios cadastrados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading && <Skeleton className="h-[300px] w-full" />}
                                {!loading && !error && <CondominiosTable condominios={filteredCondominios} onEdit={handleEdit} onDelete={handleDelete} />}
                                {error && <p className="text-destructive text-center py-10">{error}</p>}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) { setEditId(null); setSelectedCondominio(null); } }}>
                <DialogContent className="max-w-4xl">
                    <CondominioForm 
                        onSave={handleSave} 
                        isSaving={isSaving} 
                        onCancel={() => { setIsFormOpen(false); setEditId(null); setSelectedCondominio(null); }}
                        defaultValues={selectedCondominio || undefined}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={salvoOpen} onOpenChange={setSalvoOpen}>
              <DialogContent className="max-w-xs">
                <div className="flex flex-col items-center gap-4 p-6">
                  <CheckCircle2 className="h-14 w-14 text-green-600" />
                  <span className="text-green-700 text-xl font-bold">Condomínio salvo!</span>
                </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CondominiosPage;