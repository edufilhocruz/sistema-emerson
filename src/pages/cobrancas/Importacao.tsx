import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImportacaoForm } from "@/features/cobranca/components/ImportacaoForm";

const ImportacaoEmMassaPage = () => (
  <div className="flex h-screen bg-bg-secondary">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header title="Importação em Massa de Cobranças" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <ImportacaoForm />
      </div>
    </main>
  </div>
);

export default ImportacaoEmMassaPage;