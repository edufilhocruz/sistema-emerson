import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailFormSchema, EmailFormData } from '../types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEmailConfig } from '../hooks/useEmailConfig';
import configuracaoService from '../services/configuracaoService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "@/components/ui/use-toast";
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export const EmailTab = () => {
  const { config, loading, refresh } = useEmailConfig();
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    values: { tipoEnvio: 'SMTP', ...config },
  });

  useEffect(() => {
    if (Object.keys(config).length > 0) form.reset(config);
  }, [config, form]);

  const onSubmit = async (data: EmailFormData) => {
    try {
      await configuracaoService.saveEmailConfig(data);
      toast({ title: "Sucesso!", description: "As configurações de e-mail foram salvas." });
      refresh();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as configurações.' });
    }
  };

  const handleTestSend = async () => {
    setIsTesting(true);
    try {
      await configuracaoService.testEmail(testEmail);
      toast({ title: 'E-mail de teste enviado com sucesso!' });
      setIsTestOpen(false);
      setTestEmail('');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar o e-mail de teste.' });
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) return <Skeleton className="h-[500px] w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Configurações de E-mail</h3>
        <p className="text-muted-foreground">Defina como o sistema enviará as notificações e cobranças.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="tipoEnvio" render={({ field }) => (
              <FormItem className="space-y-3"><FormLabel>Tipo de Envio</FormLabel>
                  <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4">
                          <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="SMTP" /></FormControl><FormLabel className="font-normal">SMTP</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="API" disabled /></FormControl><FormLabel className="font-normal opacity-50">API (em breve)</FormLabel></FormItem>
                      </RadioGroup>
                  </FormControl>
              </FormItem>
          )}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="servidorSmtp" render={({ field }) => ( <FormItem><FormLabel>Servidor SMTP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="porta" render={({ field }) => ( <FormItem><FormLabel>Porta</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="nomeRemetente" render={({ field }) => ( <FormItem><FormLabel>Nome do Remetente</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="emailRemetente" render={({ field }) => ( <FormItem><FormLabel>E-mail do Remetente</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
          <FormField control={form.control} name="senhaRemetente" render={({ field }) => ( <FormItem><FormLabel>Senha do Remetente</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormDescription>Sua senha é armazenada de forma segura.</FormDescription><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="assinatura" render={({ field }) => ( <FormItem><FormLabel>Assinatura Padrão</FormLabel><FormControl><Textarea {...field} className="h-24" /></FormControl><FormMessage /></FormItem> )} />
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsTestOpen(true)}>Testar Envio</Button>
            <Button type="submit" className="bg-gold hover:bg-gold-hover">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
      <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
        <DialogContent className="max-w-md">
          <h4 className="text-lg font-bold mb-2">Testar Envio de E-mail</h4>
          <Input type="email" placeholder="Digite o e-mail para teste" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsTestOpen(false)}>Cancelar</Button>
            <Button onClick={handleTestSend} disabled={isTesting || !testEmail} className="bg-gold hover:bg-gold-hover">{isTesting ? 'Enviando...' : 'Enviar Teste'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};