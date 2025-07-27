import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModelosList } from "@/features/modelos/components/ModelosList";

const ModelosDeCartaPage = () => (
  <div className="flex h-screen bg-bg-secondary">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header title="Modelos de Carta" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <ModelosList />
      </div>
    </main>
  </div>
);

export default ModelosDeCartaPage;