'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModeloCarta, ModeloFormData, modeloSchema } from '@/entities/modelos/types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2, Copy, Save } from 'lucide-react';

interface Props {
  modelo: Partial<ModeloCarta>;
  onSave: (data: ModeloFormData) => void;
  onDelete: (id: string) => void;
  isSaving?: boolean;
}

const variaveisDisponiveis = [
  '{{nome_morador}}', '{{nome_condominio}}', '{{endereco_condominio}}',
  '{{bloco}}', '{{apartamento}}', '{{valor}}', '{{mes_referencia}}',
];

export const ModeloEditor = ({ modelo, onSave, onDelete, isSaving }: Props) => {
  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: { titulo: modelo.titulo || '', conteudo: modelo.conteudo || '' },
  });

  const conteudoValue = form.watch('conteudo');
  const tituloValue = form.watch('titulo');

  const handleVariableClick = (variavel: string) => {
    const currentValue = form.getValues('conteudo') || '';
    const newValue = currentValue ? `${currentValue} ${variavel}` : variavel;
    form.setValue('conteudo', newValue, { shouldValidate: true });
  };

  /**
   * Renderiza a pré-visualização, destacando as variáveis com uma cor
   * para que o utilizador saiba que são campos dinâmicos.
   */
  const renderPreview = () => {
    let previewText = conteudoValue || '';
    // Itera sobre as variáveis disponíveis para encontrá-las e estilizá-las
    variaveisDisponiveis.forEach(variavel => {
      const regex = new RegExp(variavel.replace(/\{/g, '{{').replace(/\}/g, '}}'), 'g');
      previewText = previewText.replace(regex, `<span class="font-semibold text-gold bg-gold/10 px-1 rounded">${variavel}</span>`);
    });
    return { __html: previewText };
  };

  /**
   * Gera um preview realista substituindo as variáveis por exemplos fictícios.
   */
  const gerarPreviewDinamico = (texto: string) => {
    return texto
      .replace(/{{nome_morador}}/gi, 'João da Silva')
      .replace(/{{nome_condominio}}/gi, 'Residencial Jardim das Acácias')
      .replace(/{{endereco_condominio}}/gi, 'Rua das Flores, 123, Centro, Cidade - UF')
      .replace(/{{bloco}}/gi, 'A')
      .replace(/{{apartamento}}/gi, '101')
      .replace(/{{valor}}/gi, 'R$ 1.234,56')
      .replace(/{{mes_referencia}}/gi, '07/2025');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {modelo.id ? 'Editar Modelo de Cobrança' : 'Criar Novo Modelo de Cobrança'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto pr-4">
          {/* Coluna da Esquerda: Formulário */}
          <div className="space-y-6">
            <FormField control={form.control} name="titulo" render={({ field }) => ( <FormItem><FormLabel>Nome do Modelo</FormLabel><FormControl><Input placeholder="Ex: Cobrança Padrão Mensal" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="conteudo" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Conteúdo da Mensagem</FormLabel><FormControl><Textarea placeholder="Digite sua mensagem aqui..." {...field} className="h-48 resize-none" /></FormControl><FormMessage /></FormItem> )} />
            <div>
              <FormLabel>Variáveis Disponíveis</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {variaveisDisponiveis.map(v => (
                  <Button key={v} type="button" variant="outline" size="sm" className="h-auto py-1 px-2" onClick={() => handleVariableClick(v)}>
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          {/* Coluna da Direita: Pré-visualização 100% Dinâmica */}
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-semibold mb-4 text-foreground">Pré-visualização Dinâmica</h3>
            <div className="space-y-2 text-sm text-muted-foreground whitespace-pre-wrap">
              <p><span className="font-semibold text-foreground">Assunto: {gerarPreviewDinamico(tituloValue)}</span></p>
              <div>{gerarPreviewDinamico(conteudoValue || '')}</div>
            </div>
          </div>
        </div>
        <DialogFooter className="justify-between pt-6">
          <div>
            <Button variant="destructive" type="button" onClick={() => onDelete(modelo.id!)} disabled={!modelo.id || isSaving}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
            <Button variant="outline" type="button" className="ml-2" disabled={isSaving}>
              <Copy className="mr-2 h-4 w-4" /> Duplicar
            </Button>
          </div>
          <Button type="submit" className="bg-gold hover:bg-gold-hover" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Modelo"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
