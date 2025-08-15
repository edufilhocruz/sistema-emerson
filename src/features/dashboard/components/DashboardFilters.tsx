import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CondominiumChargeStatus, DateRangeFilter, PeriodFilter } from "@/entities/dashboard/types";
import { Calendar } from "lucide-react";

interface Props {
  condominios: CondominiumChargeStatus[];
  onCondominioChange: (id: string) => void;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onPeriodChange?: (period: PeriodFilter) => void;
}

export const DashboardFilters = ({ 
  condominios, 
  onCondominioChange, 
  onDateRangeChange,
  onPeriodChange 
}: Props) => {
  const [activeRange, setActiveRange] = useState<DateRangeFilter>('mes_atual');
  const [selectedMes, setSelectedMes] = useState<string>('');
  const [selectedAno, setSelectedAno] = useState<string>('');

  // Gera opções de meses e anos
  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i).map(ano => ({
    value: ano.toString(),
    label: ano.toString(),
  }));

  // Define valores padrão (mês e ano atual)
  useEffect(() => {
    const dataAtual = new Date();
    setSelectedMes((dataAtual.getMonth() + 1).toString());
    setSelectedAno(dataAtual.getFullYear().toString());
  }, []);

  const handleRangeClick = (range: DateRangeFilter) => {
    setActiveRange(range);
    onDateRangeChange(range);
    
    // Se for um período específico, notifica o componente pai
    if (range === 'mes_atual' || range === 'mes_anterior') {
      const dataAtual = new Date();
      let mes = dataAtual.getMonth() + 1;
      let ano = dataAtual.getFullYear();
      
      if (range === 'mes_anterior') {
        mes = mes === 1 ? 12 : mes - 1;
        ano = mes === 12 ? ano - 1 : ano;
      }
      
      onPeriodChange?.({
        mes,
        ano,
        tipo: 'mes_especifico'
      });
    }
  };

  const handleMesChange = (mes: string) => {
    setSelectedMes(mes);
    if (mes && selectedAno) {
      onPeriodChange?.({
        mes: parseInt(mes),
        ano: parseInt(selectedAno),
        tipo: 'mes_especifico'
      });
    }
  };

  const handleAnoChange = (ano: string) => {
    setSelectedAno(ano);
    if (selectedMes && ano) {
      onPeriodChange?.({
        mes: parseInt(selectedMes),
        ano: parseInt(ano),
        tipo: 'mes_especifico'
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      {/* Filtro por Condomínio */}
      <div className="w-full lg:w-auto">
        <Select defaultValue="todos" onValueChange={onCondominioChange}>
          <SelectTrigger className="w-full lg:w-[320px]">
            <SelectValue placeholder="Filtrar por condomínio..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Condomínios</SelectItem>
            {condominios.map(condo => (
              <SelectItem key={condo.id} value={condo.id}>{condo.name} (ID: {condo.id})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Filtros de Período */}
      <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Períodos Rápidos */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Período:</span>
          <Button variant={activeRange === 'hoje' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('hoje')}>Hoje</Button>
          <Button variant={activeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('7d')}>7 dias</Button>
          <Button variant={activeRange === '30d' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('30d')}>30 dias</Button>
          <Button variant={activeRange === 'mes_atual' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('mes_atual')}>Mês Atual</Button>
          <Button variant={activeRange === 'mes_anterior' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('mes_anterior')}>Mês Anterior</Button>
        </div>

        {/* Seletor de Mês/Ano Específico */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Mês específico:</span>
          <Select value={selectedMes} onValueChange={handleMesChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedAno} onValueChange={handleAnoChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano.value} value={ano.value}>
                  {ano.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};