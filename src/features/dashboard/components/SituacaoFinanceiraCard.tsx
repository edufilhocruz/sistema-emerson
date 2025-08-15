import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SituacaoFinanceira, EnvioComErro } from "@/entities/dashboard/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, User, Building, Mail, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dashboardService from '../services/dashboardService';

interface CobrancaEnviadaPorCondominio {
  id: string;
  nome: string;
  quantidadeEmailsEnviados: number;
}

interface CobrancasEnviadasData {
  periodo: {
    mes: number;
    ano: number;
    inicio: string;
    fim: string;
  };
  condominios: CobrancaEnviadaPorCondominio[];
  total: number;
  totalEmails: number;
}

/**
 * CobrancasEnviadasModal: Sub-componente que renderiza o conteúdo do modal de cobranças enviadas.
 */
const CobrancasEnviadasModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [data, setData] = useState<CobrancasEnviadasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (isOpen) {
      // Define valores padrão (mês e ano atual)
      const dataAtual = new Date();
      const mesAtual = (dataAtual.getMonth() + 1).toString();
      const anoAtual = dataAtual.getFullYear().toString();
      
      setSelectedMes(mesAtual);
      setSelectedAno(anoAtual);
      
      // Carrega os dados após definir os valores padrão
      setTimeout(() => {
        loadCobrancasEnviadas();
      }, 100);
    }
  }, [isOpen]);

  // Recarrega os dados quando os filtros mudarem
  useEffect(() => {
    if (selectedMes && selectedAno && isOpen) {
      loadCobrancasEnviadas();
    }
  }, [selectedMes, selectedAno]);

  const loadCobrancasEnviadas = async () => {
    if (!selectedMes || !selectedAno) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getCobrancasEnviadasPorCondominio(
        parseInt(selectedMes), 
        parseInt(selectedAno)
      );
      setData(response);
    } catch (err) {
      setError('Erro ao carregar cobranças enviadas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatarPeriodo = (mes: number, ano: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[mes - 1]} de ${ano}`;
  };

  if (loading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Cobranças Enviadas por Condomínio</DialogTitle>
          <DialogDescription>
            Carregando dados das cobranças enviadas...
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Skeleton className="w-full h-8 mb-4" />
          <Skeleton className="w-full h-8 mb-2" />
          <Skeleton className="w-full h-8 mb-2" />
          <Skeleton className="w-full h-8 mb-2" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Erro ao Carregar Dados</DialogTitle>
          <DialogDescription>
            {error}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button onClick={loadCobrancasEnviadas} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </>
    );
  }

  if (!data) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Cobranças Enviadas por Condomínio
        </DialogTitle>
        <DialogDescription>
          Selecione o período para visualizar as cobranças enviadas por condomínio.
        </DialogDescription>
      </DialogHeader>
      
      {/* Filtros de Período */}
      <div className="flex items-end gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium">Mês</label>
          <Select value={selectedMes} onValueChange={setSelectedMes}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium">Ano</label>
          <Select value={selectedAno} onValueChange={setSelectedAno}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
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
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadCobrancasEnviadas}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Informações do Período */}
      {data && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-muted">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Período: {formatarPeriodo(data.periodo.mes, data.periodo.ano)}
          </span>
          <Badge variant="secondary">
            {data.total} condomínio{data.total !== 1 ? 's' : ''} • {data.totalEmails} email{data.totalEmails !== 1 ? 's' : ''} enviado{data.totalEmails !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      <div className="max-h-[60vh] overflow-y-auto">
        {data.condominios.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma cobrança enviada</p>
            <p className="text-sm">Não foram encontradas cobranças enviadas neste período.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condomínio</TableHead>
                <TableHead className="text-center">Emails Enviados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.condominios.map((condo) => (
                <TableRow key={condo.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{condo.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {condo.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">{condo.quantidadeEmailsEnviados}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};

/**
 * Stat: Sub-componente para exibir uma única métrica.
 */
const Stat = ({ emoji, label, value, onClick }: { emoji: string, label: string, value: number, onClick?: () => void }) => (
  <div 
    className={`flex items-center gap-2 text-lg ${onClick ? 'cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors' : ''}`}
    onClick={onClick}
  >
    <span className="text-xl">{emoji}</span>
    <span className="font-medium">{label}:</span>
    <span className="font-bold text-foreground">{value}</span>
  </div>
);

/**
 * SituacaoFinanceiraCard: O componente principal.
 * Exibe as métricas de cobranças enviadas por condomínio e erros de envio.
 */
export const SituacaoFinanceiraCard = ({ data, erros, loading }: { data?: SituacaoFinanceira, erros?: EnvioComErro[], loading: boolean }) => {
  const [isCobrancasModalOpen, setIsCobrancasModalOpen] = useState(false);
  const [isErrosModalOpen, setIsErrosModalOpen] = useState(false);

  if (loading) {
    return <Skeleton className="h-full w-full min-h-[200px]" />;
  }
  if (!data) {
    return null;
  }

  const hasErrors = data.errosEnvio > 0;
  const hasCobrancas = data.cobrancasEnviadasPorCondominio > 0;

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-lg">📊 Situação Financeira das Cobranças</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-grow">
          <div className="space-y-4">
            <Stat 
              emoji="📧" 
              label="Cobranças enviadas por condomínio" 
              value={data.cobrancasEnviadasPorCondominio}
              onClick={() => setIsCobrancasModalOpen(true)}
            />
            <Stat emoji="⚠️" label="Erros de envio" value={data.errosEnvio} />
          </div>
          
          {/* BOTÕES PARA VER DETALHES */}
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="secondary"
              size="sm"
              className="text-sm"
              onClick={() => setIsCobrancasModalOpen(true)}
              disabled={!hasCobrancas}
            >
              Ver Cobranças Enviadas
              <Mail className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => setIsErrosModalOpen(true)}
              disabled={!hasErrors}
            >
              Ver Detalhes do Erro
              <AlertTriangle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Cobranças Enviadas */}
      <Dialog open={isCobrancasModalOpen} onOpenChange={setIsCobrancasModalOpen}>
        <DialogContent className="max-w-4xl">
          <CobrancasEnviadasModal 
            isOpen={isCobrancasModalOpen} 
            onClose={() => setIsCobrancasModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Erros (mantido para compatibilidade) */}
      <Dialog open={isErrosModalOpen} onOpenChange={setIsErrosModalOpen}>
        <DialogContent>
          <div>
            <DialogHeader>
              <DialogTitle>Detalhes dos Erros de Envio</DialogTitle>
              <DialogDescription>
                As seguintes cobranças não puderam ser enviadas. Verifique os dados e tente reenviar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {erros?.map(erro => (
                <div key={erro.id} className="p-3 rounded-md border bg-muted/50">
                  <p className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> {erro.morador}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> {erro.condominio}</p>
                  <p className="text-sm text-destructive mt-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Motivo: {erro.motivo}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};