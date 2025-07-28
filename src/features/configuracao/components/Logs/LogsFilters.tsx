import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const LogsFilters = () => (
  <div className="flex flex-col md:flex-row items-center gap-4">
    <div className="relative w-full md:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Buscar por usuário ou ação..." className="pl-9" />
    </div>
    <Input type="date" className="w-full md:max-w-xs" />
    <Button variant="outline" className="w-full md:w-auto">Filtrar</Button>
  </div>
);