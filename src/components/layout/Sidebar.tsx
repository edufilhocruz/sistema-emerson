import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Building2, Users, DollarSign, Settings, BarChart2, ChevronDown, UploadCloud, FileText, Send, FileCheck, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const navigation = [
    { name: "Visão Geral", href: "/", icon: Home, subPath: "/" },
    { name: "Condomínios", href: "/condominios", icon: Building2, subPath: "/condominios" },
    { name: "Moradores", href: "/moradores", icon: Users, subPath: "/moradores" },
    { name: "Processos", href: "/processos", icon: FileCheck, subPath: "/processos" },
    { 
      name: "Cobranças", 
      icon: DollarSign,
      subPath: "/cobranca",
      children: [
        // Renomeado para refletir a ação de seleção
        { name: "Cobrança Individual", href: "/cobranca/nova", icon: Send }, 
        { name: "Imprimir Cobrança", href: "/cobrancas/imprimir", icon: Printer },
        // Renomeado para destacar o uso de planilhas
        { name: "Importar Planilha", href: "/cobrancas/importacao", icon: UploadCloud },
        { name: "Envio em Massa", href: "/cobrancas/envio-em-massa", icon: Users },
        { name: "Modelos de Carta", href: "/cobrancas/modelos", icon: FileText },
      ]
    },
    { 
      name: "Relatórios", 
      icon: BarChart2,
      subPath: "/relatorios",
      children: [
        { name: "Inadimplência", href: "/inadimplencia/relatorio" },
        { name: "Cobranças", href: "/cobrancas/historico" },
      ]
    },
    { name: "Configurações", href: "/configuracoes", icon: Settings, subPath: "/configuracoes" },
  ];

  useEffect(() => {
    const activeMenu = navigation.find(item => item.subPath && location.pathname.startsWith(item.subPath));
    if (activeMenu && activeMenu.children) {
      setOpenMenus(prev => ({ ...prev, [activeMenu.name]: true }));
    }
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className={cn("w-64 bg-sidebar-bg border-r border-border flex flex-col", className)}>
      <div className="h-20 flex items-center justify-center px-6 border-b border-border">
        <img src="/logotipo.png" alt="Logotipo Raunaimer Monfre" className="h-24" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isParentActive = location.pathname.startsWith(item.subPath || '');
            const isOpen = openMenus[item.name] || false;

            return (
              <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleMenu(item.name)}>
                <CollapsibleTrigger className={cn(
                  "flex items-center justify-between w-full gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isParentActive && !isOpen ? "bg-gold/10 text-gold" : "",
                  isOpen ? "bg-gold text-white shadow-md" : "text-text-secondary hover:bg-gold-hover hover:text-white"
                )}>
                  <div className="flex items-center gap-3"><Icon className="size-5" /><span>{item.name}</span></div>
                  <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="py-1 pl-8 space-y-1">
                  {item.children.map((subItem) => {
                     const SubIcon = subItem.icon;
                     const isSubItemActive = location.pathname === subItem.href;
                     return (
                      <Link key={subItem.name} to={subItem.href} className={cn("flex items-center gap-3 px-4 py-2 rounded-md text-sm", isSubItemActive ? "text-gold font-semibold" : "text-text-secondary hover:bg-gray-200")}>
                        {SubIcon && <SubIcon className="size-4" />}
                        <span>{subItem.name}</span>
                      </Link>
                     )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          }
          
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href || '#'} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200", isActive ? "bg-gold text-white shadow-md" : "text-text-secondary hover:bg-gold-hover hover:text-white")}>
              <Icon className="size-5" /><span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}