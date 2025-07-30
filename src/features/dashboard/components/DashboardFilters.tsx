import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CondominiumChargeStatus, DateRangeFilter } from "@/entities/dashboard/types";

interface Props {
  condominios: CondominiumChargeStatus[];
  onCondominioChange: (id: string) => void;
  onDateRangeChange: (range: DateRangeFilter) => void;
}

export const DashboardFilters = ({ condominios, onCondominioChange, onDateRangeChange }: Props) => {
  const [activeRange, setActiveRange] = useState<DateRangeFilter>('30d');

  const handleRangeClick = (range: DateRangeFilter) => {
    setActiveRange(range);
    onDateRangeChange(range);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <Select defaultValue="todos" onValueChange={onCondominioChange}>
        <SelectTrigger className="w-full md:w-[320px]">
          <SelectValue placeholder="Filtrar por condomínio..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os Condomínios</SelectItem>
          {condominios.map(condo => (
            <SelectItem key={condo.id} value={condo.id}>{condo.name} (ID: {condo.id})</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="w-full md:w-auto flex items-center justify-start md:justify-end gap-2">
        <span className="text-sm text-muted-foreground mr-2">Período:</span>
        <Button variant={activeRange === 'hoje' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('hoje')}>Hoje</Button>
        <Button variant={activeRange === '3d' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('3d')}>3 dias</Button>
        <Button variant={activeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('7d')}>7 dias</Button>
        <Button variant={activeRange === '14d' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('14d')}>14 dias</Button>
        <Button variant={activeRange === '30d' ? 'default' : 'outline'} size="sm" onClick={() => handleRangeClick('30d')}>30 dias</Button>
      </div>
    </div>
  );
};