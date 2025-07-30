import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Condominio } from '../types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  condominios: Condominio[];
  onEdit: (condo: Condominio) => void;
  onDelete: (condo: Condominio) => void;
}

export const CondominiosTable = ({ condominios, onEdit, onDelete }: Props) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Nome</TableHead>
        <TableHead>CNPJ</TableHead>
        <TableHead>Cidade/UF</TableHead>
        <TableHead className="w-[50px]">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {condominios.map((condo, index) => {
        // Usar índice + 1 para ID sequencial
        const displayId = index + 1;
        return (
          <TableRow key={condo.id || index}>
            <TableCell className="font-mono text-sm text-muted-foreground">{displayId}</TableCell>
            <TableCell className="font-medium">{condo.nome}</TableCell>
            <TableCell>{condo.cnpj}</TableCell>
            <TableCell>{`${condo.cidade} / ${condo.estado}`}</TableCell>
            <TableCell>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(condo)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(condo)}>Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);