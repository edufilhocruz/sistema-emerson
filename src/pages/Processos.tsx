import React from 'react';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProcessosTable } from "@/features/processos/components/ProcessosTable";

const ProcessosPage = () => {
  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Gestão de Processos" />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <ProcessosTable />
        </div>
      </main>
    </div>
  );
};

export default ProcessosPage;

