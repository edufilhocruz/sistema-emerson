import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { HistoricoCobranca, CobrancaStatus } from '../../types';
import { useState } from 'react';
import cobrancaService from '../../services/cobrancaService';
import { ImpressaoModal } from '../ImpressaoModal';

interface Props {
  data: HistoricoCobranca[];
}

const getStatusVariant = (status: CobrancaStatus): "default" | "destructive" | "secondary" => {
    const statusMap: Record<CobrancaStatus, "default" | "destructive" | "secondary"> = {
        'ENVIADO': 'default',
        'ERRO': 'destructive',
        'NAO_ENVIADO': 'secondary',
    };
    return statusMap[status];
}

export const CobrancasTable = ({ data }: Props) => {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalImpressao, setModalImpressao] = useState(false);

  const allSelected = data.length > 0 && selecionados.length === data.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelecionados([]);
    else setSelecionados(data.map(c => c.id));
  };
  const toggleSelect = (id: string) => {
    setSelecionados(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };
  const handleDeleteSelected = async () => {
    await Promise.all(selecionados.map(id => cobrancaService.deleteCobranca(id)));
    setSelecionados([]);
    window.location.reload(); // Força atualização (ou use um refresh do hook se houver)
  };

  return (
    <div className="overflow-x-auto">
      {selecionados.length > 0 && (
        <div className="mb-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalImpressao(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Cartas ({selecionados.length})
          </Button>
          <Button variant="destructive" onClick={handleDeleteSelected}>
            Apagar selecionados ({selecionados.length})
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></TableHead>
            <TableHead>Morador</TableHead>
            <TableHead>Condomínio</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data/Hora do Envio</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cobranca, index) => {
            // ID sequencial do condomínio (baseado na posição)
            const condominioId = index + 1;
            return (
            <TableRow key={cobranca.id}>
              <TableCell>
                <input type="checkbox" checked={selecionados.includes(cobranca.id)} onChange={() => toggleSelect(cobranca.id)} />
              </TableCell>
              <TableCell className="font-medium">{cobranca.morador}</TableCell>
              <TableCell>
                {typeof cobranca.condominio === 'string' 
                  ? cobranca.condominio 
                  : `${cobranca.condominio.nome} (ID: ${condominioId})`
                }
              </TableCell>
              <TableCell>
                {cobranca.valor 
                  ? cobranca.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'Valor não informado'
                }
              </TableCell>
              <TableCell>{new Date(cobranca.dataEnvio).toLocaleString('pt-BR')}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(cobranca.status)}>
                  {cobranca.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>
      
      <ImpressaoModal 
        isOpen={modalImpressao}
        onClose={() => setModalImpressao(false)}
        cobrancaIds={selecionados}
      />
    </div>
  );
};