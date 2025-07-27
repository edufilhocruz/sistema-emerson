import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { useModelos } from '@/features/modelos/hooks/useModelos';
import { useState } from 'react';

interface MoradoresFiltersProps {
  onFilter: (filters: {
    statusPagamento?: string;
    tipoCobranca?: string;
    condominioId?: string;
    statusEnvio?: string;
  }) => void;
  onClear?: () => void;
}

export const MoradoresFilters = ({ onFilter, onClear }: MoradoresFiltersProps) => {
  const { condominioOptions, loading } = useCondominios();
  const { modelos, loading: loadingModelos } = useModelos();
  const [statusPagamento, setStatusPagamento] = useState<string>('all');
  const [tipoCobranca, setTipoCobranca] = useState<string>('all');
  const [condominioId, setCondominioId] = useState<string>('all');
  const [statusEnvio, setStatusEnvio] = useState<string>('all');

  const handleFilter = () => {
    onFilter({
      statusPagamento: statusPagamento === 'all' ? undefined : statusPagamento,
      tipoCobranca: tipoCobranca === 'all' ? undefined : tipoCobranca,
      condominioId: condominioId === 'all' ? undefined : condominioId,
      statusEnvio: statusEnvio === 'all' ? undefined : statusEnvio,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Status Pagamento</label>
        <Select value={statusPagamento} onValueChange={setStatusPagamento}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="EM_DIA">Em Dia</SelectItem>
            <SelectItem value="ATRASADO">Atrasado</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Cobrança</label>
        <Select value={tipoCobranca} onValueChange={setTipoCobranca} disabled={loadingModelos}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Nada</SelectItem>
            {modelos.map((modelo) => (
              <SelectItem key={modelo.id} value={modelo.titulo}>{modelo.titulo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Condomínio</label>
        <Select value={condominioId} onValueChange={setCondominioId} disabled={loading}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {condominioOptions.map((condo) => (
              <SelectItem key={condo.value} value={condo.value}>{condo.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
        <Select value={statusEnvio} onValueChange={setStatusEnvio}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ENVIADO">Enviado</SelectItem>
            <SelectItem value="ERRO">Erro</SelectItem>
            <SelectItem value="NAO_ENVIADO">Não Enviado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="h-10" onClick={handleFilter}>Filtrar</Button>
      <Button variant="outline" className="h-10" onClick={onClear}>Limpar</Button>
    </div>
  );
};