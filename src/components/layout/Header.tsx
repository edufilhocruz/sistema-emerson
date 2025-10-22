import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import * as Avatar from "@radix-ui/react-avatar";
import { useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HeaderProps {
  title: string;
}

function getInitials(nome: string, email: string) {
  if (nome) {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email ? email[0].toUpperCase() : '?';
}

/**
 * Documentação: Header (com Altura Sincronizada)
 * - A altura foi padronizada para `h-20` para alinhar com o cabeçalho da Sidebar.
 */
export function Header({ title }: HeaderProps) {
  const { user, logout, setUser } = useAuth();
  const initials = getInitials(user?.nome || '', user?.email || '');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAvatarClick = () => {
    setOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    // Salvar no backend
    const response = await fetch('/api/usuarios/' + user.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foto: preview }),
      credentials: 'include',
    });
    if (response.ok) {
      const updated = await response.json();
      setUser && setUser({ ...user, foto: updated.foto });
      setOpen(false);
      setPreview(null);
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-6 bg-gray-800 border-b border-border">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar.Root className="w-10 h-10 rounded-full border overflow-hidden bg-muted flex items-center justify-center select-none">
            {user?.foto ? (
              <Avatar.Image src={user.foto} alt={user.nome} className="w-full h-full object-cover" />
            ) : (
              <Avatar.Fallback className="text-lg font-bold text-foreground">{initials}</Avatar.Fallback>
            )}
          </Avatar.Root>
          <button
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow group-hover:opacity-100 opacity-80 transition-opacity border border-gray-300"
            style={{ transform: 'translate(30%, 30%)' }}
            onClick={handleAvatarClick}
            title="Editar foto de perfil"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <span className="font-medium text-white">Olá, {user?.nome ? user.nome : 'Usuário'}</span>
        <Button variant="outline" onClick={logout}>Sair</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Editar Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <label className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden cursor-pointer bg-muted">
              {preview || user?.foto ? (
                <img src={preview || user?.foto} alt="Pré-visualização" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-foreground">{initials}</span>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            </label>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">Escolher Foto</Button>
            <Button onClick={handleSave} disabled={!preview} className="bg-gold hover:bg-gold-hover w-full">Salvar</Button>
            <Button variant="ghost" onClick={() => { setOpen(false); setPreview(null); }}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}