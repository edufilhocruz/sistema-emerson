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

  // Função para formatar valor para exibição
  const formatCurrencyForDisplay = (value: number | undefined): string => {
    if (value === undefined || value === null) return '';
    // Garantir que o valor seja um número
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Função para tratar conversão do valor do aluguel
  async function handleSubmit(data: MoradorFormData) {
    console.log('[MoradorForm] handleSubmit chamado:', data);
    
    // Tratar valor do aluguel
    let valorAluguel = data.valorAluguel;
    if (typeof valorAluguel === 'string') {
      // Se for string vazia ou "0", definir como undefined
      if (!valorAluguel || valorAluguel === '' || valorAluguel === '0') {
        valorAluguel = undefined;
      } else {
        valorAluguel = Number(valorAluguel.replace(/\./g, '').replace(',', '.'));
      }
    }
    
    // Converter campos string vazia em undefined e tratar valores especiais
    const dataLimpo = Object.fromEntries(
      Object.entries({ ...data, valorAluguel }).map(([k, v]) => {
        if (v === '' || v === null || v === undefined || v === '0' || v === '0,00') {
          return [k, undefined];
        }
        // Se for string, remover espaços em branco
        if (typeof v === 'string') {
          const trimmed = v.trim();
          return [k, trimmed === '' ? undefined : trimmed];
        }
        return [k, v];
      })
    );
    
    console.log('[MoradorForm] Dados limpos:', dataLimpo);
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
                <IMaskInput
                  mask={Number}
                  scale={2}
                  radix=","
                  mapToRadix={["."]}
                  placeholder="0,00"
                  value={formatCurrencyForDisplay(field.value)}
                  onAccept={(value) => {
                    // Se o valor estiver vazio, definir como undefined
                    if (!value || value === '' || value === '0' || value === '0,00') {
                      field.onChange(undefined);
                      return;
                    }
                    // Converter para número antes de salvar
                    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
                    field.onChange(isNaN(numValue) ? undefined : numValue);
                  }}
                  onBlur={(e) => {
                    // Se o campo ficar vazio no blur, definir como undefined
                    if (!e.target.value || e.target.value === '' || e.target.value === '0,00') {
                      field.onChange(undefined);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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