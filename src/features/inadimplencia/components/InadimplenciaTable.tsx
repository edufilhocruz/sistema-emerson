import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { InadimplenciaItem } from '../types';

interface Props {
  data: InadimplenciaItem[];
}

export const InadimplenciaTable = ({ data }: Props) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Morador</TableHead>
          <TableHead>Unidade</TableHead>
          <TableHead>Condomínio</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-center">Vencimento</TableHead>
          <TableHead className="text-center">Dias em Atraso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.morador}</TableCell>
            <TableCell>{item.unidade}</TableCell>
            <TableCell>{item.condominio}</TableCell>
            <TableCell className="text-right">{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
            <TableCell className="text-center">{new Date(item.vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
            <TableCell className="text-center">
              <Badge variant="destructive">{item.diasAtraso} dias</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);