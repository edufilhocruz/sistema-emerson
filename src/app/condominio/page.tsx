import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CondominioForm } from "@/features/condominio/components/CondominioForm";

export const CondominioDashboardPage = () => {
    return (
        <div className="flex h-screen bg-bg-secondary">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title="Novo Condomínio" />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <CondominioForm />
                </div>
            </main>
        </div>
    );
};