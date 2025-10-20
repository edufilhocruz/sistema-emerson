import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Printer, Save, X, CheckCircle } from 'lucide-react';
import processoService, { Processo } from '../services/processoService';
import condominioService from '@/features/condominio/services/condominioService';
import { ProcessoForm } from './ProcessoForm';
import { ProcessoFilters } from './ProcessoFilters';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const SITUACAO_CORES = {
  'CITACAO': 'default',
  'CONTESTACAO': 'secondary',
  'REPLICA': 'outline',
  'SISBAJUD': 'default',
  'PENHORA_DA_UNIDADE': 'destructive',
  'ACORDO_PROTOCOLADO': 'secondary',
  'ACORDO_HOMOLOGADO': 'default',
  'ACORDO_QUEBRADO': 'destructive',
  'QUITACAO_DA_DIVIDA': 'default',
  'EXTINTO': 'secondary',
  'CUMP_SENTENCA': 'outline',
  'GRAU_DE_RECURSO': 'default',
} as const;

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

export const ProcessosTable: React.FC = () => {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSituacao, setEditingSituacao] = useState<string | null>(null);
  const [novaSituacao, setNovaSituacao] = useState<string>('');
  const [savingSituacao, setSavingSituacao] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [condominios, setCondominios] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    condominio: '',
    autor: '',
    numeroProcesso: '',
    acao: '',
    situacao: '',
  });

  const loadProcessos = async () => {
    try {
      setLoading(true);
      const data = await processoService.list();
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCondominios = async () => {
    try {
      const data = await condominioService.getCondominios();
      setCondominios(data);
    } catch (error) {
      console.error('Erro ao carregar condomínios:', error);
    }
  };

  useEffect(() => {
    loadProcessos();
    loadCondominios();
  }, []);

  const handleDeleteClick = (processo: Processo) => {
    setProcessoToDelete(processo);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!processoToDelete) return;
    await processoService.remove(processoToDelete.id);
    setDeleteModalOpen(false);
    setShowDeleteSuccess(true);
    
    // Mostrar animação de sucesso por 2 segundos
    setTimeout(async () => {
      setShowDeleteSuccess(false);
      await loadProcessos();
    }, 2000);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProcessoToDelete(null);
  };

  const handleEditSituacao = (id: string, situacaoAtual: string) => {
    setEditingSituacao(id);
    setNovaSituacao(situacaoAtual);
  };

  const handleSaveSituacao = async (id: string) => {
    try {
      setSavingSituacao(true);
      await processoService.update(id, { situacao: novaSituacao as any });
      await loadProcessos();
      setEditingSituacao(null);
    } catch (error) {
      console.error('Erro ao atualizar situação:', error);
    } finally {
      setSavingSituacao(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSituacao(null);
    setNovaSituacao('');
  };

  const handleGerarPdf = async (processo: Processo) => {
    try {
      const blob = await processoService.gerarPdf(processo.id);
      
      // Criar URL do blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `processo-${processo.numeroProcesso}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const SituacaoOptions = Object.entries(SITUACAO_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const handleFilterChange = (novosFiltros: any) => {
    setFiltros(novosFiltros);
  };

  const handleClearFilters = () => {
    setFiltros({
      condominio: '',
      autor: '',
      numeroProcesso: '',
      acao: '',
      situacao: '',
    });
  };

  // Filtrar processos por todos os critérios
  const processosFiltrados = processos.filter(processo => {
    // Filtro por condomínio
    if (filtros.condominio && processo.condominioId !== filtros.condominio) {
      return false;
    }

    // Filtro por autor (tipo de parte)
    if (filtros.autor && processo.parte !== filtros.autor) {
      return false;
    }

    // Filtro por número do processo (busca parcial)
    if (filtros.numeroProcesso && !processo.numeroProcesso.toLowerCase().includes(filtros.numeroProcesso.toLowerCase())) {
      return false;
    }

    // Filtro por ação (busca parcial)
    if (filtros.acao && !processo.acaoDe.toLowerCase().includes(filtros.acao.toLowerCase())) {
      return false;
    }

    // Filtro por situação
    if (filtros.situacao && processo.situacao !== filtros.situacao) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando processos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestão de Processos Jurídicos</CardTitle>
            <ProcessoForm onSuccess={loadProcessos} />
          </div>
        </CardHeader>
      </Card>

      {/* Componente de Filtros */}
      <ProcessoFilters
        condominios={condominios}
        filtros={filtros}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número do Processo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Bloco</TableHead>
                  <TableHead>Parte</TableHead>
                  <TableHead>Condomínio</TableHead>
                  <TableHead>Ação De</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Valor da Dívida</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center text-gray-500">
                      {Object.values(filtros).some(f => f && f.trim() !== '') 
                        ? 'Nenhum processo encontrado com os filtros aplicados' 
                        : 'Nenhum processo encontrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  processosFiltrados.map((processo) => (
                    <TableRow key={processo.id}>
                      <TableCell className="font-medium">
                        {processo.numeroProcesso}
                      </TableCell>
                      <TableCell>{processo.nome}</TableCell>
                      <TableCell>{processo.unidade}</TableCell>
                      <TableCell>{processo.bloco || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {processo.parte === 'AUTOR' ? 'Autor' : 
                           processo.parte === 'REU' ? 'Réu' : 
                           'Terceiro Interessado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(processo as any).condominio?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>{processo.acaoDe}</TableCell>
                      <TableCell>
                        {editingSituacao === processo.id ? (
                          <div className="flex items-center space-x-2">
                            <Select value={novaSituacao} onValueChange={setNovaSituacao}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SituacaoOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveSituacao(processo.id)}
                              disabled={savingSituacao}
                            >
                              <Save className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Badge variant={SITUACAO_CORES[processo.situacao as keyof typeof SITUACAO_CORES] as any}>
                              {SITUACAO_LABELS[processo.situacao as keyof typeof SITUACAO_LABELS]}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSituacao(processo.id, processo.situacao)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(processo.valorDivida)}</TableCell>
                      <TableCell>
                        {new Date(processo.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-1">
                          <ProcessoForm processo={processo} onSuccess={loadProcessos} />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleGerarPdf(processo)}
                            title="Gerar PDF"
                          >
                            <Printer className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(processo)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        processo={processoToDelete}
      />

      {/* Overlay de Sucesso da Exclusão */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center p-8 space-y-4 transition-all duration-300 ease-in-out transform bg-white shadow-2xl rounded-2xl">
            <div className="animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-500 drop-shadow-lg" />
            </div>
            <p className="text-xl font-bold text-gray-800">Processo excluído com sucesso!</p>
          </div>
        </div>
      )}

    </div>
  );
};
