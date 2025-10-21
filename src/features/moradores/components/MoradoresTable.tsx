import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Morador, StatusCobranca, StatusPagamento } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  moradores: Morador[];
  onEdit: (morador: Morador) => void;
  onDelete: (morador: Morador) => void;
  onVerHistorico: (morador: Morador) => void;
}

// Objeto de configuração para o Status de Pagamento
const statusPagamentoConfig: Record<StatusPagamento, { variant: "default" | "destructive" | "secondary", label: string }> = {
    'EM_DIA': { variant: 'default', label: 'Em dia' },
    'ATRASADO': { variant: 'destructive', label: 'Atrasado' },
    'PENDENTE': { variant: 'secondary', label: 'Pendente' },
};

// Objeto de configuração para o Status da Cobrança
const cobrancaStatusConfig: Record<StatusCobranca, { icon: React.ReactNode, label: string }> = {
    'Enviado': { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, label: 'Enviado' },
    'Erro': { icon: <XCircle className="h-4 w-4 text-destructive" />, label: 'Erro' },
    'Pendente': { icon: <AlertCircle className="h-4 w-4 text-gray-500" />, label: 'Pendente' },
};

/**
 * Componente seguro para renderizar o Status da Cobrança.
 * Ele lida com casos onde o status pode ser nulo ou indefinido.
 */
const CobrancaStatusComponent = React.memo(({ status }: { status?: StatusCobranca | null }) => {
    // CORREÇÃO: Adicionamos uma verificação de segurança.
    if (!status || !cobrancaStatusConfig[status]) {
        return <div className="flex items-center gap-2 text-muted-foreground"><HelpCircle className="h-4 w-4" /> N/A</div>;
    }
    const config = cobrancaStatusConfig[status];
    return <div className="flex items-center gap-2"><span className="sr-only">{config.label}</span>{config.icon}{config.label}</div>;
});

export const MoradoresTable = React.memo(({ moradores, onEdit, onDelete, onVerHistorico }: Props) => {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const allSelected = moradores.length > 0 && selecionados.length === moradores.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelecionados([]);
    else setSelecionados(moradores.map(m => m.id));
  };
  const toggleSelect = (id: string) => {
    setSelecionados(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };
  const handleDeleteSelected = () => {
    selecionados.forEach(id => {
      const morador = moradores.find(m => m.id === id);
      if (morador) onDelete(morador);
    });
    setSelecionados([]);
  };

  return (
    <div>
      {selecionados.length > 0 && (
        <div className="mb-2 flex justify-end">
          <Button variant="destructive" onClick={handleDeleteSelected}>
            Apagar selecionados ({selecionados.length})
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Condomínio</TableHead>
            <TableHead>Bloco</TableHead>
            <TableHead>Apartamento</TableHead>
            <TableHead>Status Pagamento</TableHead>
            <TableHead>Tipo de Cobrança</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data do Envio</TableHead>
            <TableHead className="w-[50px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moradores.map((morador, index) => {
            // CORREÇÃO: Verificação de segurança para o status de pagamento.
            const pagamentoConfig = morador.statusPagamento ? statusPagamentoConfig[morador.statusPagamento] : null;
            // ID sequencial do condomínio (baseado na posição)
            const condominioId = index + 1;

            return (
              <TableRow key={morador.id}>
                <TableCell>
                  <input type="checkbox" checked={selecionados.includes(morador.id)} onChange={() => toggleSelect(morador.id)} />
                </TableCell>
                <TableCell className="font-medium">{morador.nome}</TableCell>
                <TableCell>{morador.condominio?.nome ? `${morador.condominio.nome} (ID: ${condominioId})` : 'N/A'}</TableCell>
                <TableCell>{morador.bloco}</TableCell>
                <TableCell>{morador.apartamento}</TableCell>
                <TableCell>
                  {pagamentoConfig ? (
                    <Badge variant={pagamentoConfig.variant}>
                      {pagamentoConfig.label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">N/A</Badge>
                  )}
                </TableCell>
                <TableCell>{morador.ultimaCobrancaTipo || 'N/A'}</TableCell>
                <TableCell>
                  {morador.ultimaCobrancaStatus === 'Erro' ? (
                    <Button variant="outline" size="sm" onClick={() => alert('Detalhe do erro da cobrança: motivo fictício ou real se disponível.')}
                      className="flex items-center gap-2 border-destructive text-destructive">
                      <XCircle className="h-4 w-4" /> Erro
                    </Button>
                  ) : (
                    <Badge variant={morador.ultimaCobrancaStatus === 'Enviado' ? 'default' : 'secondary'}>
                      {morador.ultimaCobrancaStatus === 'Enviado' ? 'Enviado' : morador.ultimaCobrancaStatus || 'N/A'}
                    </Badge>
                  )}
                  {/* Status técnico do envio */}
                  <div className="text-xs text-muted-foreground mt-1">
                    {morador.ultimaCobrancaStatusEnvio === 'ENVIADO' && morador.ultimaCobrancaStatus !== 'Enviado' && 'Enviado'}
                    {morador.ultimaCobrancaStatusEnvio === 'ERRO' && morador.ultimaCobrancaStatus !== 'Erro' && 'Erro'}
                    {morador.ultimaCobrancaStatusEnvio === 'NAO_ENVIADO' && morador.ultimaCobrancaStatus !== 'Pendente' && 'Não Enviado'}
                  </div>
                </TableCell>
                <TableCell>{morador.ultimaCobrancaData ? new Date(morador.ultimaCobrancaData).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                <TableCell>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(morador)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onVerHistorico(morador)}>Ver Histórico</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(morador)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});