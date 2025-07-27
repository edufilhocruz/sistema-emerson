import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioFormSchema, UsuarioFormData } from '../../types';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Props {
  onSave: (data: UsuarioFormData) => void;
  defaultValues?: Partial<UsuarioFormData>;
}

export const UsuarioForm = ({ onSave, defaultValues }: Props) => {
  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: defaultValues || { nome: '', email: '', password: '', role: undefined, foto: undefined }
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo Usuário</DialogTitle>
        <DialogDescription>Preencha os dados para criar um novo acesso ao sistema.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
          <FormField control={form.control} name="nome" render={({ field }) => ( <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Nome do novo usuário" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Senha Inicial</FormLabel><FormControl><Input type="password" placeholder="Mínimo 8 caracteres" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="foto" render={({ field }) => (
            <FormItem>
              <FormLabel>Foto de Perfil</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      field.onChange(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
              </FormControl>
              {field.value && (
                <img src={field.value} alt="Pré-visualização" className="mt-2 w-20 h-20 rounded-full object-cover border" />
              )}
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Acesso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível de acesso..." /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Operador">Operador</SelectItem></SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter className="pt-4">
            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
            <Button type="submit" className="bg-gold hover:bg-gold-hover">Salvar Usuário</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};