import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, FileText, Printer, Save, X } from 'lucide-react';
import processoService, { Processo } from '../services/processoService';
import { ProcessoForm } from './ProcessoForm';

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

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este processo?')) {
      try {
        await processoService.remove(id);
        await loadProcessos();
      } catch (error) {
        console.error('Erro ao excluir processo:', error);
      }
    }
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
                            onClick={() => handleDelete(processo.id)}
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

      {/* Modal para visualizar detalhes */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mr-2">
            <FileText className="w-4 h-4 mr-1" />
            Ver Detalhes
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Processo</DialogTitle>
          </DialogHeader>
          {/* Implementar detalhes do processo */}
        </DialogContent>
      </Dialog>
    </div>
  );
};
