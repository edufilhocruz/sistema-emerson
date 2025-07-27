import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moradorFormSchema, MoradorFormData, moradorEditSchema, Morador } from '../types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { IMaskInput } from 'react-imask';
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { toast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';

interface Props { 
  onSave: (data: MoradorFormData) => void; 
  defaultValues?: Partial<Morador>;
}

/**
 * MoradorForm: Componente de formulário para criar ou editar um morador.
 * Busca dinamicamente a lista de condomínios da API para popular o seletor.
 */
export const MoradorForm = ({ onSave, defaultValues }: Props) => {
  const { condominioOptions, loading: loadingCondominios } = useCondominios();
  
  const isEditMode = !!defaultValues?.id;
  const form = useForm<MoradorFormData>({ 
    resolver: zodResolver(isEditMode ? moradorEditSchema : moradorFormSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      condominioId: undefined,
      bloco: '',
      apartamento: '',
      valorAluguel: undefined,
      ...defaultValues,
    }
  });

  // Função para tratar conversão do valor do aluguel
  async function handleSubmit(data: MoradorFormData) {
    console.log('[MoradorForm] handleSubmit chamado:', data);
    let valorAluguel = data.valorAluguel;
    if (typeof valorAluguel === 'string') {
      valorAluguel = Number(valorAluguel.replace(/\./g, '').replace(',', '.'));
    }
    // Converter campos string vazia em undefined
    const dataLimpo = Object.fromEntries(
      Object.entries({ ...data, valorAluguel }).map(([k, v]) => [k, v === '' ? undefined : v])
    );
    onSave(dataLimpo as MoradorFormData);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Editar Morador' : 'Adicionar Novo Morador'}</DialogTitle>
        <DialogDescription>{isEditMode ? 'Altere os dados desejados e salve para atualizar o morador.' : 'Preencha os dados para cadastrar um novo morador no sistema.'}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <DialogTitle className="sr-only">Formulário de Morador</DialogTitle>
        <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.error('[MoradorForm] Erros de validação Zod:', errors);
          const camposInvalidos = Object.values(errors)
            .map((err: any) => err?.message)
            .filter(Boolean)
            .join(', ');
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: camposInvalidos ? `Corrija: ${camposInvalidos}` : 'Preencha os campos corretamente.'
          });
        })} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="condominioId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condomínio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCondominios}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCondominios ? "Carregando condomínios..." : "Selecione o condomínio"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {condominioOptions.map((condo) => (
                      <SelectItem key={condo.value} value={condo.value}>
                        {condo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bloco" render={({ field }) => ( <FormItem><FormLabel>Bloco</FormLabel><FormControl><Input placeholder="Ex: A" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="apartamento" render={({ field }) => ( <FormItem><FormLabel>Apartamento</FormLabel><FormControl><Input placeholder="Ex: 101" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
          <FormField control={form.control} name="valorAluguel" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Aluguel</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={field.value ?? ''}
                  onChange={e => {
                    const v = e.target.value;
                    field.onChange(v === '' ? undefined : Number(v));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="telefone" render={({ field }) => ( <FormItem><FormLabel>Telefone</FormLabel><FormControl><IMaskInput mask="(00) 00000-0000" placeholder="(11) 98765-4321" {...field} onAccept={field.onChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></FormControl><FormMessage /></FormItem> )} />
          
          <DialogFooter className="pt-4 sticky bottom-0 bg-background">
            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
            <Button type="submit" className="bg-gold hover:bg-gold-hover">Salvar</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};