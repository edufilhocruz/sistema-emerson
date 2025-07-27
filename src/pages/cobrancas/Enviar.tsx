import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { EnviarCobrancaForm } from "@/features/cobranca/components/EnviarCobrancaForm";

const EnviarCobrancaPage = () => (
  <div className="flex h-screen bg-bg-secondary">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header title="Enviar Nova Cobrança" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <EnviarCobrancaForm />
      </div>
    </main>
  </div>
);

export default EnviarCobrancaPage;