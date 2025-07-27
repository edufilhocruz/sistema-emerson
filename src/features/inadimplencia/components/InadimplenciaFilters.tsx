import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useCondominios } from '@/features/condominio/hooks/useCondominios';
import { useState } from 'react';

interface InadimplenciaFiltersProps {
  onFilter: (condominioId: string | undefined) => void;
}

export const InadimplenciaFilters = ({ onFilter }: InadimplenciaFiltersProps) => {
  const { condominioOptions, loading } = useCondominios();
  const [condominioId, setCondominioId] = useState<string | undefined>();

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle>Filtros do Relatório</CardTitle>
        <CardDescription>Refine sua busca para encontrar informações específicas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Select disabled={loading} value={condominioId} onValueChange={setCondominioId}>
            <SelectTrigger><SelectValue placeholder="Selecionar Condomínio" /></SelectTrigger>
            <SelectContent>
              {condominioOptions.map((condo) => (
                <SelectItem key={condo.value} value={condo.value}>{condo.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Dias em atraso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15">Mais de 15 dias</SelectItem>
              <SelectItem value="30">Mais de 30 dias</SelectItem>
              <SelectItem value="60">Mais de 60 dias</SelectItem>
            </SelectContent>
          </Select>
          <div className="lg:col-span-2 flex justify-end items-center gap-4">
            <Button variant="outline" onClick={() => { setCondominioId(undefined); onFilter(undefined); }}>Limpar Filtros</Button>
            <Button className="bg-gold hover:bg-gold-hover" onClick={() => onFilter(condominioId)}><Search className="mr-2 h-4 w-4" /> Aplicar Filtros</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};