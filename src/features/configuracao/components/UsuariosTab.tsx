import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUsuarios } from '../hooks/useUsuarios';
import { UsuariosTable } from './Usuarios/UsuariosTable';
import { UsuarioForm } from './Usuarios/UsuarioForm';
import { UsuarioFormData } from '../types';
import usuarioService from '../services/usuarioService';

export const UsuariosTab = () => {
  const { usuarios, loading, refresh } = useUsuarios();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);

  const handleSave = async (data: UsuarioFormData) => {
    try {
      if (editUser) {
        await usuarioService.updateUsuario(editUser.id, data);
      } else {
        await usuarioService.createUsuario(data);
      }
      setIsFormOpen(false);
      setEditUser(null);
      refresh();
    } catch (err) {
      setIsFormOpen(false);
      setEditUser(null);
    }
  };

  const handleEdit = (user: any) => {
    setEditUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (user: any) => {
    await usuarioService.deleteUsuario(user.id);
    refresh();
  };

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-xl font-bold">Usuários e Permissões</h3>
        <p className="text-muted-foreground">Gerencie quem pode acessar e o que pode fazer no sistema.</p>
      </div>
      <div className="flex items-center justify-end">
        <Button className="bg-gold hover:bg-gold-hover" onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : <UsuariosTable users={usuarios} onEdit={handleEdit} onDelete={handleDelete} />}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <UsuarioForm onSave={handleSave} defaultValues={editUser || undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
};