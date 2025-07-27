'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CondominioFormData, condominioFormSchema, condominioEditSchema } from '@/entities/condominio/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IMaskInput } from 'react-imask';

interface CondominioFormProps {
  onSave: (data: CondominioFormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
  defaultValues?: Partial<CondominioFormData>;
}

export const CondominioForm = ({ onSave, onCancel, isSaving, defaultValues }: CondominioFormProps) => {
  const isEditMode = !!defaultValues?.id;
  const form = useForm<CondominioFormData>({
    resolver: zodResolver(isEditMode ? condominioEditSchema : condominioFormSchema),
    defaultValues: {
      nome: '', cnpj: '', cep: '', logradouro: '', numero: '',
      complemento: '', bairro: '', cidade: '', estado: '', administradora: '',
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  const handleCepBlur = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      
      const data = await response.json();
      if (data.erro) {
         form.setError('cep', { message: 'CEP não localizado.' });
      } else {
        form.setValue('logradouro', data.logradouro || '', { shouldValidate: true });
        form.setValue('bairro', data.bairro || '', { shouldValidate: true });
        form.setValue('cidade', data.localidade || '', { shouldValidate: true });
        form.setValue('estado', data.uf || '', { shouldValidate: true });
        form.setFocus('numero');
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      form.setError('cep', { message: 'Erro ao buscar CEP.' });
    }
  };

  function handleSubmit(data: CondominioFormData) {
    // Converter campos string vazia em undefined
    const dataLimpo = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v])
    );
    onSave(dataLimpo as CondominioFormData);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Adicionar Novo Condomínio</DialogTitle>
        <DialogDescription>
          Preencha os dados completos para o novo condomínio.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="nome" render={({ field }) => ( <FormItem><FormLabel>Nome do Condomínio</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="Residencial das Flores" /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="cnpj" render={({ field }) => ( <FormItem><FormLabel>CNPJ</FormLabel><FormControl><IMaskInput mask="00.000.000/0000-00" {...field} value={field.value ?? ''} onAccept={field.onChange} placeholder="00.000.000/0000-00" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></FormControl><FormMessage /></FormItem> )} />
          </div>

          <FormField control={form.control} name="cep" render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <IMaskInput mask="00000-000" value={field.value ?? ''} onAccept={(value) => { field.onChange(value); if (String(value).replace(/\D/g, '').length === 8) { handleCepBlur(String(value)); } }} placeholder="00000-000" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="logradouro" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Endereço</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="numero" render={({ field }) => ( <FormItem className="md:col-span-1"><FormLabel>Número</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="complemento" render={({ field }) => ( <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="Apto, Bloco, etc. (Opcional)" /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="bairro" render={({ field }) => ( <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="cidade" render={({ field }) => ( <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="estado" render={({ field }) => ( <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
           </div>
          
          <DialogFooter className="pt-6 sticky bottom-0 bg-background">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" className="bg-gold hover:bg-gold-hover" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Condomínio"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};