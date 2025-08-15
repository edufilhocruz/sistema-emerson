import React from 'react';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, FileText } from 'lucide-react';

const ContratosPage = () => {
  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Gestão de Contratos" />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle>Módulo de Contratos</CardTitle>
              <CardDescription>Gerenciamento de contratos e documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-yellow-100 rounded-full">
                    <Construction className="h-16 w-16 text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                  Módulo em Construção
                </h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  O módulo de contratos está sendo desenvolvido e estará disponível em breve.
                  Aqui você poderá gerenciar todos os contratos e documentos relacionados aos condomínios.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>Funcionalidades em desenvolvimento</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContratosPage;
