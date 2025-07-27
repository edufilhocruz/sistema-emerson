import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CobrancaForm } from "@/features/cobranca/components/CobrancaForm";

export const CobrancaDashboardPage = () => {
    return (
        <div className="flex h-screen bg-bg-secondary">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title="Nova Cobrança" />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <CobrancaForm />
                </div>
            </main>
        </div>
    );
};