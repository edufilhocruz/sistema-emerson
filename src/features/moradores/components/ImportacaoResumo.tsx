import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Users, Mail, Building } from 'lucide-react';

interface ImportacaoResumoProps {
  resumo: {
    importados: number;
    naoImportados: number;
    total: number;
  };
  naoImportados: Array<{ morador: any; motivo: string }>;
  onClose: () => void;
}

export const ImportacaoResumo: React.FC<ImportacaoResumoProps> = ({
  resumo,
  naoImportados,
  onClose
}) => {
  const percentualSucesso = resumo.total > 0 ? Math.round((resumo.importados / resumo.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resumo da Importação</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Importados</p>
                  <p className="text-2xl font-bold text-green-700">{resumo.importados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Não Importados</p>
                  <p className="text-2xl font-bold text-red-700">{resumo.naoImportados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total Processado</p>
                  <p className="text-2xl font-bold text-blue-700">{resumo.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Percentual de Sucesso */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Taxa de Sucesso</span>
              <span className="text-sm font-bold text-gray-900">{percentualSucesso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentualSucesso}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes dos Não Importados */}
        {naoImportados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Detalhes dos Não Importados
              </CardTitle>
              <CardDescription>
                Motivos pelos quais alguns moradores não foram importados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {naoImportados.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.morador.nome || 'Nome não informado'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          {item.morador.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {item.morador.email}
                            </span>
                          )}
                          {item.morador.condominio && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {item.morador.condominio}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {item.motivo}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão de Fechar */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
