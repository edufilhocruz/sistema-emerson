import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Printer, Save, X, CheckCircle } from 'lucide-react';
import processoService, { Processo } from '../services/processoService';
import { ProcessoForm } from './ProcessoForm';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const SITUACAO_CORES = {
  'EM_ANDAMENTO': 'default',
  'ARQUIVADO': 'secondary',
  'SUSPENSO': 'destructive',
  'EVIDENCIDO': 'outline',
  'JULGADO': 'default',
  'CAUTELAR': 'secondary',
  'EXTINTO': 'destructive',
} as const;

const SITUACAO_LABELS = {
  'EM_ANDAMENTO': 'Em Andamento',
  'ARQUIVADO': 'Arquivado',
  'SUSPENSO': 'Suspenso',
  'EVIDENCIDO': 'Evidenciado',
  'JULGADO': 'Julgado',
  'CAUTELAR': 'Cautelar',
  'EXTINTO': 'Extinto',
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

  useEffect(() => {
    loadProcessos();
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
    setTimeout(() => {
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
          <div className="flex justify-between items-center">
            <CardTitle>Gestão de Processos Jurídicos</CardTitle>
            <ProcessoForm onSuccess={loadProcessos} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número do Processo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Condomínio</TableHead>
                  <TableHead>Ação De</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Valor da Dívida</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Nenhum processo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  processos.map((processo) => (
                    <TableRow key={processo.id}>
                      <TableCell className="font-medium">
                        {processo.numeroProcesso}
                      </TableCell>
                      <TableCell>{processo.nome}</TableCell>
                      <TableCell>{processo.unidade}</TableCell>
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
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-500 drop-shadow-lg" />
            </div>
            <p className="text-gray-800 font-bold text-xl">Processo excluído com sucesso!</p>
          </div>
        </div>
      )}

    </div>
  );
};
