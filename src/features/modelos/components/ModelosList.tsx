'use client';

import React, { useState } from 'react';
import { ModeloCarta } from '@/entities/modelos/types';
import { useModelos } from '../hooks/useModelos';
import { ModeloEditor } from './ModeloEditor';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText, Calendar, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

export const ModelosList = () => {
  const { modelos, loading, error, saving, createModelo, updateModelo, deleteModelo } = useModelos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Partial<ModeloCarta> | null>(null);

  const handleSave = async (data: { titulo: string; conteudo: string }) => {
    try {
      if (editingModelo?.id) {
        // Atualizando modelo existente
        const result = await updateModelo(editingModelo.id, data);
        if (result) {
          toast({
            title: '✅ Modelo atualizado com sucesso!',
            description: 'O modelo foi atualizado e está pronto para uso.',
          });
          setIsDialogOpen(false);
          setEditingModelo(null);
        }
      } else {
        // Criando novo modelo
        const result = await createModelo(data);
        if (result) {
          toast({
            title: '✅ Modelo criado com sucesso!',
            description: 'O novo modelo foi criado e está pronto para uso.',
          });
          setIsDialogOpen(false);
          setEditingModelo(null);
        }
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '❌ Erro ao salvar modelo',
        description: err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const success = await deleteModelo(id);
      if (success) {
        toast({
          title: '✅ Modelo excluído com sucesso!',
          description: 'O modelo foi removido permanentemente.',
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '❌ Erro ao excluir modelo',
        description: err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingModelo({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (modelo: ModeloCarta) => {
    setEditingModelo(modelo);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingModelo(null);
  };

  // Conta campos dinâmicos no conteúdo
  const countDynamicFields = (conteudo: string) => {
    const matches = conteudo.match(/\{\{[^}]+\}\}/g);
    return matches ? matches.length : 0;
  };

  // Formata data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Erro ao carregar modelos</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Modelos de Cobrança</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus modelos de cobrança personalizados com campos dinâmicos
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gold hover:bg-gold-hover">
          <Plus className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Modelos</p>
                <p className="text-2xl font-bold">{modelos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Modelos Ativos</p>
                <p className="text-2xl font-bold">{modelos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Última Atualização</p>
                <p className="text-sm font-bold">
                  {modelos.length > 0 ? formatDate(modelos[0].updatedAt) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Modelos */}
      {modelos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum modelo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro modelo de cobrança para começar
            </p>
            <Button onClick={openCreateDialog} className="bg-gold hover:bg-gold-hover">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Modelo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelos.map((modelo) => (
            <Card key={modelo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{modelo.titulo}</CardTitle>
                    <CardDescription className="mt-2">
                      Criado em {formatDate(modelo.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {countDynamicFields(modelo.conteudo)} campos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {modelo.conteudo.substring(0, 150)}...
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(modelo)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(modelo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog do Editor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModelo?.id ? 'Editar Modelo' : 'Criar Novo Modelo'}
            </DialogTitle>
          </DialogHeader>
          <ModeloEditor
            modelo={editingModelo || {}}
            onSave={handleSave}
            onDelete={handleDelete}
            isSaving={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};