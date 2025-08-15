import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusCobrancaMensal } from "@/entities/dashboard/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ListChecks, Calendar, Users, Building, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dashboardService from '../services/dashboardService';

interface CondominioPendente {
  id: string;
  nome: string;
  totalMoradores: number;
  moradores: Array<{
    id: string;
    nome: string;
    bloco: string;
    apartamento: string;
    email: string;
  }>;
}

interface CondominiosPendentesData {
  periodo: {
    mes: number;
    ano: number;
    inicio: string;
    fim: string;
  };
  condominios: CondominioPendente[];
  total: number;
}

/**
 * CondominiosPendentesModal: Sub-componente que renderiza o conteúdo do modal.
 */
const CondominiosPendentesModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [data, setData] = useState<CondominiosPendentesData | null>(null);
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
        loadCondominiosPendentes();
      }, 100);
    }
  }, [isOpen]);

  // Recarrega os dados quando os filtros mudarem
  useEffect(() => {
    if (selectedMes && selectedAno && isOpen) {
      loadCondominiosPendentes();
    }
  }, [selectedMes, selectedAno]);

  const loadCondominiosPendentes = async () => {
    if (!selectedMes || !selectedAno) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getCondominiosPendentes(
        parseInt(selectedMes), 
        parseInt(selectedAno)
      );
      setData(response);
    } catch (err) {
      setError('Erro ao carregar condomínios pendentes');
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
          <DialogTitle>Condomínios com Cobrança Pendente</DialogTitle>
          <DialogDescription>
            Carregando dados dos condomínios pendentes...
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
          <Button onClick={loadCondominiosPendentes} variant="outline">
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
          <Building className="w-5 h-5" />
          Condomínios com Cobrança Pendente
        </DialogTitle>
        <DialogDescription>
          Selecione o período para visualizar os condomínios que ainda não receberam cobrança.
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
          onClick={loadCondominiosPendentes}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
            {data.total} condomínio{data.total !== 1 ? 's' : ''} pendente{data.total !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      <div className="max-h-[60vh] overflow-y-auto">
        {data.condominios.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum condomínio pendente</p>
            <p className="text-sm">Todos os condomínios já foram cobrados neste período.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condomínio</TableHead>
                <TableHead className="text-center">Moradores</TableHead>
                <TableHead className="text-center">Ações</TableHead>
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
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{condo.totalMoradores}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Aqui você pode adicionar navegação para a página de cobrança
                        console.log('Navegar para cobrança do condomínio:', condo.id);
                      }}
                    >
                      Gerar Cobrança
                    </Button>
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
  const hasPendentes = pendentes > 0;

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-lg">📌 A Fazer do Dia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-grow">
          <div className="space-y-4">
            <Stat emoji="✅" text={<>{cobrados} de {total} condomínios já cobrados</>} />
            <Stat emoji="🔴" text={<>{pendentes} condomínios pendentes</>} />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="secondary"
              size="sm"
              className="text-sm"
              onClick={() => setIsModalOpen(true)}
              disabled={!hasPendentes}
            >
              Ver Pendentes
              <ListChecks className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
            <CondominiosPendentesModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />
        </DialogContent>
      </Dialog>
    </>
  );
};