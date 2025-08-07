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
        <TableHead>Tipo de Serviço</TableHead>
        <TableHead>Síndico</TableHead>
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                condo.tipoServico === 'ASSESSORIA_MENSAL' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {condo.tipoServico === 'ASSESSORIA_MENSAL' ? 'Assessoria Mensal' : 'Somente Cobranças'}
              </span>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">{condo.sindicoNome}</div>
                <div className="text-muted-foreground">{condo.sindicoEmail}</div>
              </div>
            </TableCell>
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