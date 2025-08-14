'use client';

import React, { useState, useEffect } from 'react';
import { ModeloCarta } from '@/entities/modelos/types';
import { modeloCartaService } from '../services/modeloCartaService';
import { AdvancedModeloEditor } from './AdvancedModeloEditor';
import { EmailPreview } from './EmailPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Trash2, Eye, Copy, Download, 
  FileText, Calendar, User, Building, Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ModelosList: React.FC = () => {
  const { toast } = useToast();
  const [modelos, setModelos] = useState<ModeloCarta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelo, setSelectedModelo] = useState<ModeloCarta | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar modelos
  useEffect(() => {
    loadModelos();
  }, []);

  const loadModelos = async () => {
    try {
      setLoading(true);
      const data = await modeloCartaService.getAll();
      setModelos(data);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar modelos de carta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreate = () => {
    setSelectedModelo({} as ModeloCarta);
    setIsEditorOpen(true);
  };

  const handleEdit = (modelo: ModeloCarta) => {
    setSelectedModelo(modelo);
    setIsEditorOpen(true);
  };

  const handlePreview = (modelo: ModeloCarta) => {
    setSelectedModelo(modelo);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return;

    try {
      await modeloCartaService.delete(id);
      await loadModelos();
      toast({
        title: "Sucesso",
        description: "Modelo excluído com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao excluir modelo:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir modelo",
        variant: "destructive"
      });
    }
  };

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true);
      
      if (selectedModelo?.id) {
        await modeloCartaService.update(selectedModelo.id, data);
        toast({
          title: "Sucesso",
          description: "Modelo atualizado com sucesso",
          variant: "default"
        });
      } else {
        await modeloCartaService.create(data);
        toast({
          title: "Sucesso",
          description: "Modelo criado com sucesso",
          variant: "default"
        });
      }
      
      await loadModelos();
      setIsEditorOpen(false);
      setSelectedModelo(null);
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar modelo",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (modelo: ModeloCarta) => {
    try {
      await navigator.clipboard.writeText(modelo.conteudo || '');
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar conteúdo",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (modelo: ModeloCarta) => {
    try {
      const blob = new Blob([modelo.conteudo || ''], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelo.titulo || 'modelo'}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download",
        description: "Arquivo HTML baixado com sucesso",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao baixar arquivo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 mr-2 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
        <span>Carregando modelos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <FileText className="w-8 h-8" />
            Modelos de Carta
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus templates de email para cobranças
          </p>
        </div>
        
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Modelo
        </Button>
      </div>

      {/* Lista de Modelos */}
      {modelos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">Nenhum modelo encontrado</h3>
            <p className="mb-4 text-muted-foreground">
              Crie seu primeiro modelo de carta para começar
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Modelo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modelos.map((modelo) => (
            <Card key={modelo.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {modelo.titulo || 'Modelo sem título'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Criado em {new Date(modelo.createdAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(modelo)}
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(modelo)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(modelo.id)}
                      title="Excluir"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações do Modelo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Atualizado: {new Date(modelo.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {modelo.headerImageUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>Com imagem de cabeçalho</span>
                    </div>
                  )}
                  
                  {modelo.footerImageUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>Com imagem de rodapé</span>
                    </div>
                  )}
                </div>

                {/* Preview do Conteúdo */}
                <div className="text-sm text-gray-600 line-clamp-3">
                  {modelo.conteudo?.replace(/<[^>]*>/g, '').substring(0, 150) || 'Sem conteúdo'}
                  {(modelo.conteudo?.length || 0) > 150 && '...'}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(modelo)}
                    className="flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(modelo)}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog do Editor */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto" aria-describedby="editor-description">
          <DialogHeader>
            <DialogTitle>
              {selectedModelo?.id ? 'Editar Modelo' : 'Novo Modelo'}
            </DialogTitle>
            <div id="editor-description" className="sr-only">
              Editor avançado para criação e edição de modelos de carta com preview em tempo real
            </div>
          </DialogHeader>
          
          {selectedModelo && (
            <AdvancedModeloEditor
              modelo={selectedModelo}
              onSave={handleSave}
              onDelete={selectedModelo.id ? () => handleDelete(selectedModelo.id) : () => {}}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog do Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="preview-description">
          <DialogHeader>
            <DialogTitle>Preview do Modelo</DialogTitle>
            <div id="preview-description" className="sr-only">
              Visualização do modelo de carta em diferentes modos
            </div>
          </DialogHeader>
          
          {selectedModelo && (
            <EmailPreview
              htmlContent={selectedModelo.conteudo || ''}
              headerImageUrl={selectedModelo.headerImageUrl}
              footerImageUrl={selectedModelo.footerImageUrl}
              showPreview={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};