import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const SemCobrancaPage = () => (
  <div className="flex h-screen bg-bg-secondary">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header title="Relatórios: Sem Cobrança no Mês" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <h1 className="text-2xl font-bold">Página de Relatório de Moradores Sem Cobrança</h1>
        <p>O conteúdo deste relatório aparecerá aqui.</p>
      </div>
    </main>
  </div>
);

export default SemCobrancaPage;