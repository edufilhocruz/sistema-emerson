'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Para formatação de data em português
import { HistoricoCobranca, CobrancaStatus } from "@/entities/cobranca/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Dados de exemplo (mock). Em uma aplicação real, estes dados viriam de um hook (ex: useCobrancas)
const mockCobrancas: HistoricoCobranca[] = [
  { id: '1', morador: 'Sofia Almeida', condominio: 'Residencial das Flores', valor: 'R$ 550,00', dataEnvio: '15/07/2024 10:30', status: 'Pago' },
  { id: '2', morador: 'Carlos Pereira', condominio: 'Edifício Central', valor: 'R$ 620,00', dataEnvio: '14/07/2024 14:15', status: 'Atrasado' },
  { id: '3', morador: 'Ana Costa', condominio: 'Condomínio Verde', valor: 'R$ 480,00', dataEnvio: '13/07/2024 09:45', status: 'Em Aberto' },
  { id: '4', morador: 'Ricardo Santos', condominio: 'Residencial das Palmeiras', valor: 'R$ 590,00', dataEnvio: '12/07/2024 16:00', status: 'Pago' },
  { id: '5', morador: 'Mariana Oliveira', condominio: 'Edifício Novo Horizonte', valor: 'R$ 510,00', dataEnvio: '11/07/2024 11:20', status: 'Atrasado' },
];

// Função utilitária para mapear o status para a variante visual do Badge
const getStatusVariant = (status: CobrancaStatus): "default" | "destructive" | "secondary" => {
    const statusMap = {
        'Pago': 'default' as const,
        'Atrasado': 'destructive' as const,
        'Em Aberto': 'secondary' as const,
    };
    return statusMap[status] || 'secondary';
}

/**
 * Documentação: CobrancasTable (Versão Final)
 * Componente completo para exibir e filtrar o histórico de cobranças.
 * - Arquitetura Limpa: Componente focado na apresentação, recebe os dados (atualmente mockados) e renderiza a UI.
 * - Escalável: Facilmente adaptável para receber dados de um hook (ex: useQuery) e funções de callback para os filtros.
 * - Performático: Utiliza React.useState para estados locais e componentes de UI otimizados.
 */
export const CobrancasTable = () => {
  // Estado para o seletor de período
  const [date, setDate] = React.useState<DateRange | undefined>();

  return (
    <div className="space-y-8">
      {/* Secção de Filtros */}
      <div className="p-6 bg-card rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Período</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn( "w-full h-12 justify-start text-left font-normal", !date && "text-muted-foreground" )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd 'de' LLL, y", { locale: ptBR })} - {format(date.to, "dd 'de' LLL, y", { locale: ptBR })}
                      </>
                    ) : (
                      format(date.from, "dd 'de' LLL, y", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={ptBR} // Adiciona tradução para o calendário
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Modelo Utilizado</label>
            <Select>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padrao">Modelo Padrão</SelectItem>
                <SelectItem value="atraso">Modelo Atraso</SelectItem>
                <SelectItem value="extra">Modelo Extra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full h-12 bg-gold hover:bg-gold-hover text-primary-foreground">
              <Search className="size-5 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de Cobranças */}
      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex justify-between items-center p-6">
          <h3 className="text-lg font-semibold">Cobranças Enviadas</h3>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Morador</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data/Hora do Envio</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCobrancas.map((cobranca) => (
                <TableRow key={cobranca.id}>
                  <TableCell className="font-medium">{cobranca.morador}</TableCell>
                  <TableCell>{cobranca.condominio}</TableCell>
                  <TableCell>{cobranca.valor}</TableCell>
                  <TableCell>{cobranca.dataEnvio}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(cobranca.status)}>
                      {cobranca.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};