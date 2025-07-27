import React from 'react';

export default function DashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Bem-vindo ao Dashboard!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded shadow flex flex-col items-center">
          <span className="text-lg font-semibold">Cobranças Pendentes</span>
          <span className="text-3xl font-bold text-blue-600 mt-2">12</span>
        </div>
        <div className="p-6 bg-white rounded shadow flex flex-col items-center">
          <span className="text-lg font-semibold">Moradores Ativos</span>
          <span className="text-3xl font-bold text-green-600 mt-2">34</span>
        </div>
        <div className="p-6 bg-white rounded shadow flex flex-col items-center">
          <span className="text-lg font-semibold">Condomínios</span>
          <span className="text-3xl font-bold text-purple-600 mt-2">5</span>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Resumo Financeiro</h2>
        <div className="text-gray-600">Aqui você pode adicionar gráficos, tabelas ou outros componentes do dashboard.</div>
      </div>
    </div>
  );
} 