'use client';

import React, { useState } from 'react';
import { ModeloCarta, ModeloFormData } from "@/entities/modelos/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModeloEditor } from './ModeloEditor';
import { useModelos } from '../hooks/useModelos';
import { Skeleton } from '@/components/ui/skeleton';

export const ModelosList = () => {
  const { modelos, loading, saveModelo, deleteModelo } = useModelos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Partial<ModeloCarta> | null>(null);

  const handleEdit = (modelo: ModeloCarta) => {
    setSelectedModel(modelo);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedModel({}); // Define um objeto vazio para indicar a criação de um novo modelo
    setIsModalOpen(true);
  };

  const handleSave = async (data: ModeloFormData) => {
    if (selectedModel) {
      setIsSaving(true);
      try {
        await saveModelo(selectedModel, data);
        setIsModalOpen(false);
        setSelectedModel(null);
      } catch (error) {
        // O erro já é tratado no hook, mas podemos adicionar lógica extra aqui se necessário
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este modelo?")) {
      await deleteModelo(id);
      setIsModalOpen(false);
      setSelectedModel(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      );
    }
    
    if (modelos.length === 0) {
      return (
        <div className="text-center py-10 border-dashed border-2 rounded-lg col-span-full">
          <p className="text-muted-foreground">Nenhum modelo de carta encontrado.</p>
          <Button className="mt-4 bg-gold hover:bg-gold-hover" onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar seu primeiro modelo
          </Button>
        </div>
      );
    }

    return modelos.map((modelo) => (
      <Card key={modelo.id} className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-gold/10 p-3 rounded-lg"><FileText className="h-6 w-6 text-gold" /></div>
            <CardTitle>{modelo.titulo}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow"><CardDescription>{modelo.conteudo?.substring(0, 100)}...</CardDescription></CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => handleEdit(modelo)}>
            Editar Modelo
          </Button>
        </CardFooter>
      </Card>
    ));
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gerir Modelos de Carta</h2>
            <p className="text-muted-foreground">Crie e edite os modelos de carta para as suas cobranças.</p>
          </div>
          <Button className="bg-gold hover:bg-gold-hover" onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Modelo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderContent()}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          {selectedModel && <ModeloEditor modelo={selectedModel} onSave={handleSave} onDelete={handleDelete} isSaving={isSaving} />}
        </DialogContent>
      </Dialog>
    </>
  );
};