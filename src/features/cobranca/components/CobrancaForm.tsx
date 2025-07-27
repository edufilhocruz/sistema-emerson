'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CobrancaFormData, cobrancaSchema } from '@/entities/cobranca/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Importamos a máscara de forma que o TypeScript entenda
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IMaskInput } from 'react-imask';

/**
 * Documentação: CobrancaForm (Versão Final e Estável)
 * - Usa o componente <Controller> para integrar com segurança o IMaskInput.
 * - Garante que todos os componentes necessários estão importados e usados corretamente.
 */
export const CobrancaForm = () => {
  const form = useForm<CobrancaFormData>({
    resolver: zodResolver(cobrancaSchema),
    defaultValues: {
      condominioId: undefined,
      morador: '',
      bloco: '',
      apto: '',
      valor: '',
    },
    mode: 'onBlur',
  });

  function onSubmit(data: CobrancaFormData) {
    console.log('Dados da cobrança válidos:', data);
    alert('Cobrança criada com sucesso! (Verifique o console)');
  }

  return (
    // Card aumentado para max-w-6xl e com bordas arredondadas consistentes
    <div className="max-w-6xl mx-auto bg-card p-8 rounded-2xl shadow-sm border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="condominioId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condomínio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o condomínio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Residencial das Flores</SelectItem>
                    <SelectItem value="2">Condomínio Vista Verde</SelectItem>
                    <SelectItem value="3">Parque das Águas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Controller
            name="morador"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Morador</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Controller
              name="bloco"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bloco</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: A (Opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Controller
              name="apto"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apartamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Controller
            name="valor"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Dívida</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">R$</span>
                    <IMaskInput
                      mask={Number}
                      radix="."
                      thousandsSeparator=","
                      scale={2}
                      padFractionalZeros={true}
                      normalizeZeros={true}
                      value={field.value || ''}
                      onAccept={field.onChange}
                      placeholder="0,00"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-gold hover:bg-gold-hover text-primary-foreground">Criar Cobrança</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};