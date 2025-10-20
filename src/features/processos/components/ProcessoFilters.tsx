import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Filter } from 'lucide-react';

interface ProcessoFiltersProps {
  condominios: any[];
  filtros: {
    condominio: string;
    autor: string;
    numeroProcesso: string;
    acao: string;
    situacao: string;
  };
  onFilterChange: (filtros: any) => void;
  onClearFilters: () => void;
}

const SITUACAO_LABELS = {
  'CITACAO': 'Citação',
  'CONTESTACAO': 'Contestação',
  'REPLICA': 'Réplica',
  'SISBAJUD': 'Sisbajud',
  'PENHORA_DA_UNIDADE': 'Penhorada da Unidade',
  'ACORDO_PROTOCOLADO': 'Acordo Protocolado',
  'ACORDO_HOMOLOGADO': 'Acordo Homologado',
  'ACORDO_QUEBRADO': 'Acordo Quebrado',
  'QUITACAO_DA_DIVIDA': 'Quitação da Dívida',
  'EXTINTO': 'Extinto',
  'CUMP_SENTENCA': 'Cump. de Sentença',
  'GRAU_DE_RECURSO': 'Grau de Recurso',
} as const;

const TIPO_PARTE_LABELS = {
  'AUTOR': 'Autor',
  'REU': 'Réu',
  'TERCEIRO_INTERESSADO': 'Terceiro Interessado',
} as const;

export const ProcessoFilters: React.FC<ProcessoFiltersProps> = ({
  condominios,
  filtros,
  onFilterChange,
  onClearFilters,
}) => {
  const handleInputChange = (field: string, value: string) => {
    onFilterChange({
      ...filtros,
      [field]: value,
    });
  };

  const hasActiveFilters = Object.values(filtros).some(value => value && value.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros de Busca</span>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro por Condomínio */}
          <div className="space-y-2">
            <Label htmlFor="filtro-condominio">Condomínio</Label>
            <Select 
              value={filtros.condominio} 
              onValueChange={(value) => handleInputChange('condominio', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os condomínios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os condomínios</SelectItem>
                {condominios.map((condominio) => (
                  <SelectItem key={condominio.id} value={condominio.id}>
                    {condominio.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Autor */}
          <div className="space-y-2">
            <Label htmlFor="filtro-autor">Autor</Label>
            <Select 
              value={filtros.autor} 
              onValueChange={(value) => handleInputChange('autor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os autores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os autores</SelectItem>
                {Object.entries(TIPO_PARTE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Número do Processo */}
          <div className="space-y-2">
            <Label htmlFor="filtro-numero">Número do Processo</Label>
            <Input
              id="filtro-numero"
              placeholder="Digite o número do processo..."
              value={filtros.numeroProcesso}
              onChange={(e) => handleInputChange('numeroProcesso', e.target.value)}
            />
          </div>

          {/* Filtro por Ação */}
          <div className="space-y-2">
            <Label htmlFor="filtro-acao">Ação</Label>
            <Input
              id="filtro-acao"
              placeholder="Digite a ação..."
              value={filtros.acao}
              onChange={(e) => handleInputChange('acao', e.target.value)}
            />
          </div>

          {/* Filtro por Situação */}
          <div className="space-y-2">
            <Label htmlFor="filtro-situacao">Situação</Label>
            <Select 
              value={filtros.situacao} 
              onValueChange={(value) => handleInputChange('situacao', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as situações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as situações</SelectItem>
                {Object.entries(SITUACAO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo dos filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Filtros ativos:</div>
            <div className="flex flex-wrap gap-2">
              {filtros.condominio && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Condomínio: {condominios.find(c => c.id === filtros.condominio)?.nome || filtros.condominio}
                </span>
              )}
              {filtros.autor && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  Autor: {TIPO_PARTE_LABELS[filtros.autor as keyof typeof TIPO_PARTE_LABELS]}
                </span>
              )}
              {filtros.numeroProcesso && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  Processo: {filtros.numeroProcesso}
                </span>
              )}
              {filtros.acao && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  Ação: {filtros.acao}
                </span>
              )}
              {filtros.situacao && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  Situação: {SITUACAO_LABELS[filtros.situacao as keyof typeof SITUACAO_LABELS]}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
