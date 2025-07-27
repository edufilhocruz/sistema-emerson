import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { EnvioEmMassaForm } from "@/features/cobranca/components/EnvioEmMassaForm";

const EnvioEmMassaPage = () => (
  <div className="flex h-screen bg-bg-secondary">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header title="Envio de Cobrança em Massa" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <EnvioEmMassaForm />
      </div>
    </main>
  </div>
);

export default EnvioEmMassaPage;