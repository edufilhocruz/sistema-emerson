import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

/**
 * Interface de props para o componente MoradoresActions.
 * Define o "contrato" que o componente pai deve seguir para utilizá-lo.
 */
interface MoradoresActionsProps {
  onAddClick: () => void;
  onSearchChange: (value: string) => void;
}

/**
 * MoradoresActions: Componente responsável por renderizar os controles
 * de ação da página de moradores, como a barra de busca e o botão de adicionar.
 */
export const MoradoresActions = ({ onAddClick, onSearchChange }: MoradoresActionsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou unidade..."
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button className="bg-gold hover:bg-gold-hover" onClick={onAddClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Adicionar Morador
      </Button>
    </div>
  );
};