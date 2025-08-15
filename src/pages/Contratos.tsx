import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, FileText } from 'lucide-react';

const ContratosPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
        <p className="text-gray-600 mt-2">Gerenciamento de contratos e documentos</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Construction className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-800">Página em Construção</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Gerenciamento de contratos e documentos</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContratosPage;
