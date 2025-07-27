import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

/**
 * Interface de props para o componente CondominiosActions.
 * Define o contrato que o componente pai (a página) deve seguir.
 */
interface CondominiosActionsProps {
  onAddClick: () => void;
  onSearchChange: (value: string) => void;
}

/**
 * CondominiosActions: Componente dedicado a renderizar os controles
 * de ação da página de condomínios, como a busca e o botão de adicionar.
 */
export const CondominiosActions = ({ onAddClick, onSearchChange }: CondominiosActionsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          className="pl-9"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button className="bg-gold hover:bg-gold-hover" onClick={onAddClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Adicionar Condomínio
      </Button>
    </div>
  );
};