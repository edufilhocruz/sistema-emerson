import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusCobrancaMensal } from "@/entities/dashboard/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CondominiosPendentesModal: Sub-componente que renderiza o conteúdo do modal.
 */
const CondominiosPendentesModal = ({ pendentes }: { pendentes: {id: string, name: string}[] }) => (
  <>
    <DialogHeader>
      <DialogTitle>Condomínios com Cobrança Pendente</DialogTitle>
      <DialogDescription>
        É necessário gerar e enviar as cobranças para os seguintes condomínios este mês.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 max-h-[60vh] overflow-y-auto">
      <ul className="space-y-2">
        {pendentes.map(condo => (
          <li key={condo.id} className="flex items-center gap-3 p-2 rounded-md bg-muted">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{condo.name}</span>
          </li>
        ))}
      </ul>
    </div>
  </>
);

/**
 * Stat: Sub-componente para exibir uma única métrica.
 */
const Stat = ({ emoji, text }: { emoji: string, text: React.ReactNode }) => (
    <div className="flex items-center gap-3 text-lg">
        <span className="text-xl">{emoji}</span>
        <span>{text}</span>
    </div>
);

/**
 * AFazerCard: Componente principal.
 * Exibe o status das cobranças mensais e um botão para ver os detalhes das pendências.
 */
export const AFazerCard = ({ data, loading }: { data?: StatusCobrancaMensal, loading: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <Skeleton className="h-full w-full min-h-[200px]" />;
  }
  if (!data) {
    return null;
  }

  const { cobrados, total, pendentes, condominiosPendentes } = data;
  const hasPendentes = pendentes > 0 && condominiosPendentes.length > 0;

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">📌 A Fazer do Dia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between">
          <div className="space-y-4">
            <Stat emoji="✅" text={<>{cobrados} de {total} condomínios já cobrados</>} />
            <Stat emoji="🔴" text={<>{pendentes} condomínios pendentes</>} />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="secondary"
              size="sm"
              className="text-sm"
              onClick={() => setIsModalOpen(true)}
              disabled={!hasPendentes}
            >
              Ver Pendentes
              <ListChecks className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <CondominiosPendentesModal pendentes={condominiosPendentes} />
        </DialogContent>
      </Dialog>
    </>
  );
};