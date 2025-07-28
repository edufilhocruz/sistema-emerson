import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogEntry } from '../../types';

export const LogsTable = ({ logs }: { logs: LogEntry[] }) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader><TableRow><TableHead>Data/Hora</TableHead><TableHead>Usuário</TableHead><TableHead>Ação Executada</TableHead><TableHead>Endereço IP</TableHead></TableRow></TableHeader>
      <TableBody>
        {logs.map(log => (
          <TableRow key={log.id}>
            <TableCell>{log.dataHora.toLocaleString('pt-BR')}</TableCell>
            <TableCell>{log.usuario}</TableCell>
            <TableCell>{log.acao}</TableCell>
            <TableCell>{log.ip}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);