import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Mail, History, ShieldCheck } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'usuarios', label: 'Usuários e Permissões', icon: Users },
  { id: 'email', label: 'E-mail e Envio', icon: Mail },
  { id: 'logs', label: 'Logs e Auditoria', icon: History },
  { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
];

interface Props {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export const ConfiguracaoNavegacao = ({ activeTab, setActiveTab }: Props) => {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-4 py-6 text-base",
              activeTab === item.id && "bg-accent text-accent-foreground"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
};