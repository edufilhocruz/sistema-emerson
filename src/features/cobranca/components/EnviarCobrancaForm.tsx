'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnviarCobrancaFormData, enviarCobrancaSchema } from '@/entities/cobranca/types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { useModelos } from '@/features/modelos/hooks/useModelos';
import { useMoradoresPorCondominio } from '@/features/moradores/hooks/useMoradoresPorCondominio';
import cobrancaService from '../services/cobrancaService';
import { IMaskInput } from 'react-imask';

export const EnviarCobrancaForm = () => {
  const form = useForm<EnviarCobrancaFormData>({ resolver: zodResolver(enviarCobrancaSchema) });
  
  const [selectedCondominio, setSelectedCondominio] = useState<string | null>(null);
  const [statusEnvio, setStatusEnvio] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { condominioOptions, loading: loadingCondos } = useCondominios();
  const { modelos, loading: loadingModelos } = useModelos();
  const { moradores, loading: loadingMoradores } = useMoradoresPorCondominio(selectedCondominio);

  async function onSubmit(data: EnviarCobrancaFormData) {
    setStatusEnvio('loading');
    try {
      // Monta o payload conforme esperado pelo backend (sem valorAluguel)
      const payload = {
        vencimento: new Date().toISOString(),
        status: 'PENDENTE',
        condominioId: data.condominioId,
        moradorId: data.moradorId,
        modeloCartaId: data.modeloId,
      };
      await cobrancaService.criarCobranca(payload);
      setStatusEnvio('success');
      setTimeout(() => setStatusEnvio('idle'), 2500);
    } catch (err) {
      setStatusEnvio('error');
      setTimeout(() => setStatusEnvio('idle'), 3500);
      console.error(err);
    }
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Loader e blur */}
      {statusEnvio === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-10 bg-white/90 rounded-2xl shadow-lg border-2 border-gold min-w-[340px] min-h-[220px]">
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
            <span className="text-green-700 text-xl font-bold">Cobrança enviada!</span>
          </div>
        </div>
      )}
      {/* Erro */}
      {statusEnvio === 'error' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-10 bg-white/90 rounded-2xl shadow-lg border-2 border-destructive min-w-[340px] min-h-[220px]">
            <XCircle className="h-14 w-14 text-destructive" />
            <span className="text-destructive text-xl font-bold">Erro: cobrança não enviada</span>
          </div>
        </div>
      )}
      <Card className={statusEnvio !== 'idle' ? 'rounded-2xl shadow-sm border pointer-events-none select-none blur-sm' : 'rounded-2xl shadow-sm border'}>
        <CardHeader><CardTitle>Enviar Cobrança Individual</CardTitle><CardDescription>Selecione os dados para gerar e enviar uma nova cobrança.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="condominioId" render={({ field }) => (
                <FormItem>
                  <FormLabel>1. Selecione o Condomínio</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); setSelectedCondominio(value); form.resetField("moradorId"); }} disabled={loadingCondos}>
                    <FormControl><SelectTrigger><SelectValue placeholder={loadingCondos ? "Carregando..." : "Escolha um condomínio..."} /></SelectTrigger></FormControl>
                    <SelectContent>{condominioOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="moradorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>2. Selecione o Morador</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCondominio || loadingMoradores}>
                    <FormControl><SelectTrigger><SelectValue placeholder={loadingMoradores ? "Carregando..." : "Escolha um morador..."} /></SelectTrigger></FormControl>
                    <SelectContent>{moradores.map(m => <SelectItem key={m.id} value={m.id}>{m.nome} ({m.bloco}-{m.apartamento})</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="modeloId" render={({ field }) => (
                <FormItem>
                  <FormLabel>3. Selecione o Modelo de Carta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingModelos}>
                    <FormControl><SelectTrigger><SelectValue placeholder={loadingModelos ? "Carregando..." : "Escolha um modelo..."} /></SelectTrigger></FormControl>
                    <SelectContent>{modelos.map(m => <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="bg-gold hover:bg-gold-hover"><Send className="mr-2 h-5 w-5" /> Enviar Cobrança</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
