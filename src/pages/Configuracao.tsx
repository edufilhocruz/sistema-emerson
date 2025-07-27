import { useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ConfiguracaoNavegacao } from '@/features/configuracao/components/ConfiguracaoNavegacao';

// Assegure que estes nomes de arquivo correspondam exatamente aos arquivos na sua pasta de componentes
import { UsuariosTab } from "@/features/configuracao/components/UsuariosTab";
import { EmailTab } from "@/features/configuracao/components/EmailTab";
import { LogsTab } from "@/features/configuracao/components/LogsTab";
import { SegurancaTab } from "@/features/configuracao/components/SegurancaTab";

const ConfiguracaoPage = () => {
  const [activeTab, setActiveTab] = useState('usuarios');

  const renderContent = () => {
    switch (activeTab) {
      case 'usuarios': return <UsuariosTab />;
      case 'email': return <EmailTab />;
      case 'logs': return <LogsTab />;
      case 'seguranca': return <SegurancaTab />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg-secondary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Configurações" />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <ConfiguracaoNavegacao activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="md:col-span-3">
              <Card className="rounded-2xl shadow-sm border min-h-[500px]">
                <CardContent className="p-6">
                  {renderContent()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracaoPage;