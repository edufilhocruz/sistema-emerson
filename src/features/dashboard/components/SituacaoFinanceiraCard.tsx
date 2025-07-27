import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SituacaoFinanceira, EnvioComErro } from "@/entities/dashboard/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ErrosEnvioModal: Sub-componente que renderiza o conteúdo do modal de erros.
 */
const ErrosEnvioModal = ({ erros }: { erros: EnvioComErro[] }) => (
  <>
    <DialogHeader>
      <DialogTitle>Detalhes dos Erros de Envio</DialogTitle>
      <DialogDescription>
        As seguintes cobranças não puderam ser enviadas. Verifique os dados e tente reenviar.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
      {erros.map(erro => (
        <div key={erro.id} className="p-3 rounded-md border bg-muted/50">
          <p className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> {erro.morador}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4" /> {erro.condominio}</p>
          <p className="text-sm text-destructive mt-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Motivo: {erro.motivo}</p>
        </div>
      ))}
    </div>
  </>
);

/**
 * Stat: Sub-componente para exibir uma única métrica.
 */
const Stat = ({ emoji, label, value }: { emoji: string, label: string, value: number }) => (
    <div className="flex items-center gap-2 text-lg">
        <span className="text-xl">{emoji}</span>
        <span className="font-medium">{label}:</span>
        <span className="font-bold text-foreground">{value}</span>
    </div>
);

/**
 * SituacaoFinanceiraCard: O componente principal.
 * Exibe as métricas e agora tem um botão dedicado para ver os detalhes dos erros.
 */
export const SituacaoFinanceiraCard = ({ data, erros, loading }: { data?: SituacaoFinanceira, erros?: EnvioComErro[], loading: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <Skeleton className="h-full w-full min-h-[200px]" />;
  }
  if (!data) {
    return null;
  }

  const hasErrors = data.errosEnvio > 0;

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">📊 Situação Financeira das Cobranças</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Stat emoji="🟢" label="Pagas" value={data.pagas} />
            <Stat emoji="🟡" label="Acordos" value={data.acordos} />
            <Stat emoji="🔴" label="Devedores" value={data.devedores} />
            <Stat emoji="⚠️" label="Erros de envio" value={data.errosEnvio} />
          </div>
          
          {/* BOTÃO DEDICADO PARA VER DETALHES */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="secondary" // Alterado de "link" para "secondary" para parecer um botão
              size="sm"
              className="text-sm"
              onClick={() => setIsModalOpen(true)}
              disabled={!hasErrors}
            >
              Ver Detalhes do Erro
              <AlertTriangle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <ErrosEnvioModal erros={erros || []} />
        </DialogContent>
      </Dialog>
    </>
  );
};