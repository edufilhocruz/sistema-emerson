import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Usuario } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  users: Usuario[];
  onEdit?: (user: Usuario) => void;
  onDelete?: (user: Usuario) => void;
}

export const UsuariosTable = ({ users, onEdit, onDelete }: Props) => (
  <Table>
    <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Acesso</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]">Ações</TableHead></TableRow></TableHeader>
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell className="font-medium">{user.nome}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell><Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'}>{user.status}</Badge></TableCell>
          <TableCell>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit && onEdit(user)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete && onDelete(user)}>Desativar</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);