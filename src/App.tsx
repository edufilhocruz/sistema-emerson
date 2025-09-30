import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
// A importação de 'ModelosDeCartaProvider' foi removida, pois não é mais necessária.

import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Lazy Loading das Páginas
const IndexPage = React.lazy(() => import("./pages/Index"));
const CondominiosPage = React.lazy(() => import("./pages/Condominio"));
const MoradoresPage = React.lazy(() => import("./pages/Moradores"));
const ProcessosPage = React.lazy(() => import("./pages/Processos"));
const ConfiguracaoPage = React.lazy(() => import("./pages/Configuracao"));
const NotFoundPage = React.lazy(() => import("./pages/NotFound"));
const EnviarCobrancaPage = React.lazy(() => import("./pages/cobrancas/Enviar"));
const ImportacaoEmMassaPage = React.lazy(() => import("./pages/cobrancas/Importacao"));
const ModelosDeCartaPage = React.lazy(() => import("./pages/cobrancas/Modelos"));
const EnvioEmMassaPage = React.lazy(() => import("./pages/cobrancas/EnvioEmMassa"));
const HistoricoInadimplenciaPage = React.lazy(() => import("./pages/relatorios/HistoricoInadimplencia"));
const SemCobrancaPage = React.lazy(() => import("./pages/relatorios/SemCobranca"));
const HistoricoCobrancasPage = React.lazy(() => import("./pages/relatorios/HistoricoCobrancas"));


const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

const App = () => {
  // Debug: log da URL atual
  console.log('App renderizando, URL atual:', window.location.pathname);
  
  const suspenseFallback = (
    <div className="flex items-center justify-center w-full h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* O <ModelosDeCartaProvider> foi removido daqui */}
            <React.Suspense fallback={suspenseFallback}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><IndexPage /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><IndexPage /></PrivateRoute>} />
                <Route path="/condominios" element={<PrivateRoute><CondominiosPage /></PrivateRoute>} />
                <Route path="/moradores" element={<PrivateRoute><MoradoresPage /></PrivateRoute>} />
                <Route path="/processos" element={<PrivateRoute><ProcessosPage /></PrivateRoute>} />
                <Route path="/configuracoes" element={<PrivateRoute><ConfiguracaoPage /></PrivateRoute>} />
                
                <Route path="/cobranca/nova" element={<PrivateRoute><EnviarCobrancaPage /></PrivateRoute>} />
                <Route path="/cobrancas/importacao" element={<PrivateRoute><ImportacaoEmMassaPage /></PrivateRoute>} />
                <Route path="/cobrancas/modelos" element={<PrivateRoute><ModelosDeCartaPage /></PrivateRoute>} />
                <Route path="/cobrancas/envio-em-massa" element={<PrivateRoute><EnvioEmMassaPage /></PrivateRoute>} />
                <Route path="/cobrancas/historico" element={<PrivateRoute><HistoricoCobrancasPage /></PrivateRoute>} />

                <Route path="/inadimplencia/relatorio" element={<PrivateRoute><HistoricoInadimplenciaPage /></PrivateRoute>} />
                
                <Route path="/relatorios/sem-cobranca" element={<PrivateRoute><SemCobrancaPage /></PrivateRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </React.Suspense>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
