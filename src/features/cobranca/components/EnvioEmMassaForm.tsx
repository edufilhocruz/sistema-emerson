'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnvioEmMassaFormData, envioEmMassaSchema, MoradorParaSelecao } from '@/entities/cobranca/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useModelos } from '@/features/modelos/hooks/useModelos';
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { useMoradoresPorCondominio } from '@/features/moradores/hooks/useMoradoresPorCondominio';
import { useState } from 'react';
import cobrancaService from '../services/cobrancaService';

export const EnvioEmMassaForm = () => {
  const [statusEnvio, setStatusEnvio] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const form = useForm<EnvioEmMassaFormData>({
    resolver: zodResolver(envioEmMassaSchema),
    defaultValues: { moradoresIds: [] },
  });

  const selectedCondominioId = form.watch('condominioId');
  const { condominioOptions, loading: loadingCondos } = useCondominios();
  const { moradores, loading: loadingMoradores } = useMoradoresPorCondominio(selectedCondominioId || null);
  const { modelos } = useModelos();

  async function onSubmit(data: EnvioEmMassaFormData) {
    setStatusEnvio('loading');
    try {
      // Envia uma cobrança para cada morador selecionado
      await Promise.all(data.moradoresIds.map(moradorId =>
        cobrancaService.criarCobranca({
          vencimento: new Date().toISOString(),
          status: 'PENDENTE',
          condominioId: data.condominioId,
          moradorId,
          modeloCartaId: data.modeloId,
        })
      ));
      setStatusEnvio('success');
      setTimeout(() => setStatusEnvio('idle'), 2500);
    } catch (err) {
      setStatusEnvio('error');
      setTimeout(() => setStatusEnvio('idle'), 3500);
    }
  }

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Loader e blur */}
      {statusEnvio === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-10 bg-white/90 rounded-2xl shadow-lg min-w-[340px] min-h-[220px]">
            <Loader2 className="animate-spin h-14 w-14 text-gold" />
            <span className="text-gold text-xl font-bold">Processando...</span>
          </div>
        </div>
      )}
      {/* Sucesso */}
      {statusEnvio === 'success' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-10 bg-white/90 rounded-2xl shadow-lg min-w-[340px] min-h-[220px]">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <span className="text-green-700 text-xl font-bold">Cobranças enviadas!</span>
          </div>
        </div>
      )}
      {/* Erro */}
      {statusEnvio === 'error' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-10 bg-white/90 rounded-2xl shadow-lg border-2 border-destructive min-w-[340px] min-h-[220px]">
            <XCircle className="h-14 w-14 text-destructive" />
            <span className="text-destructive text-xl font-bold">Erro: cobranças não enviadas</span>
          </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className={statusEnvio !== 'idle' ? 'rounded-2xl shadow-sm border pointer-events-none select-none blur-sm' : 'rounded-2xl shadow-sm border'}>
            <CardHeader>
              <CardTitle>Envio de Cobrança em Massa</CardTitle>
              <CardDescription>
                Selecione o condomínio, o modelo e os moradores para enviar as cobranças.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="condominioId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Selecione o Condomínio</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('moradoresIds', []); }} defaultValue={field.value} disabled={loadingCondos}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingCondos ? 'Carregando...' : 'Escolha um condomínio...'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {condominioOptions.map(condo => (
                          <SelectItem key={condo.value} value={condo.value}>{condo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="modeloId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Selecione o Modelo de Carta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um modelo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modelos.map(modelo => (
                          <SelectItem key={modelo.id} value={modelo.id}>{modelo.titulo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {selectedCondominioId && moradores.length > 0 && (
                <div className="relative max-h-[60vh] overflow-y-auto">
                  <FormField
                    control={form.control}
                    name="moradoresIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>3. Selecione os Moradores</FormLabel>
                        <div className="mt-2 rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">
                                  <Checkbox
                                    checked={field.value.length === moradores.length && moradores.length > 0}
                                    onCheckedChange={(checked) => {
                                      const allIds = moradores.map(m => m.id);
                                      field.onChange(checked ? allIds : []);
                                    }}
                                  />
                                </TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Email</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {moradores.map((morador) => (
                                <TableRow key={morador.id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={field.value.includes(morador.id)}
                                      onCheckedChange={(checked) => {
                                        const currentIds = field.value || [];
                                        const newIds = checked
                                          ? [...currentIds, morador.id]
                                          : currentIds.filter((id) => id !== morador.id);
                                        field.onChange(newIds);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>{morador.nome}</TableCell>
                                  <TableCell>{morador.bloco}-{morador.apartamento}</TableCell>
                                  <TableCell>{morador.email}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <FormMessage />
                        <div className="sticky bottom-0 left-0 right-0 bg-white z-10 flex justify-end pt-4 pb-4 px-6 border-t">
                          <Button type="submit" size="lg" className="bg-gold hover:bg-gold-hover">
                            <Send className="mr-2 h-5 w-5" />
                            Enviar Cobranças Selecionadas
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};