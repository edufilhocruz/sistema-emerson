import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileEdit, CheckCircle, Loader2 } from 'lucide-react';
import processoService, { Processo, ProcessoCreate } from '../services/processoService';
import condominioService from '@/features/condominio/services/condominioService';

interface ProcessoFormProps {
  processo?: Processo;
  onSuccess: () => void;
}

export const ProcessoForm: React.FC<ProcessoFormProps> = ({ processo, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState<ProcessoCreate>({
    nome: '',
    unidade: '',
    acaoDe: '',
    situacao: 'CITACAO',
    numeroProcesso: '',
    valorDivida: undefined,
    movimentacoes: '',
    condominioId: undefined,
  });
  const [condominios, setCondominios] = useState<any[]>([]);

  useEffect(() => {
    if (processo) {
      setFormData({
        nome: processo.nome || '',
        unidade: processo.unidade || '',
        acaoDe: processo.acaoDe || '',
        situacao: processo.situacao || 'EM_ANDAMENTO',
        numeroProcesso: processo.numeroProcesso || '',
        valorDivida: processo.valorDivida || undefined,
        movimentacoes: processo.movimentacoes || '',
        condominioId: processo.condominioId || undefined,
      });
    }
  }, [processo]);

  useEffect(() => {
    const loadCondominios = async () => {
      try {
        console.log('Carregando condomínios...');
        const data = await condominioService.getCondominios();
        console.log('Condomínios carregados:', data);
        setCondominios(data);
      } catch (error) {
        console.error('Erro ao carregar condomínios:', error);
        alert('Erro ao carregar lista de condomínios');
      }
    };
    
    if (isOpen) {
      loadCondominios();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== VALIDAÇÃO DO FORMULARIO ===');
    console.log('Dados do formulário:', formData);
    
    // Validação dos campos obrigatórios
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    if (!formData.numeroProcesso.trim()) {
      alert('Número do Processo é obrigatório');
      return;
    }
    if (!formData.unidade.trim()) {
      alert('Unidade é obrigatório');
      return;
    }
    if (!formData.acaoDe.trim()) {
      alert('Ação De é obrigatório');
      return;
    }
    if (!formData.situacao) {
      alert('Situação é obrigatório');
      return;
    }

    console.log('=== INICIANDO PROCESSAMENTO ===');
    setLoading(true);
    setShowLoading(true);
    console.log('Status setado: loading=true, showLoading=true');

    try {
      const submitData = {
        nome: formData.nome.trim(),
        unidade: formData.unidade.trim(),
        acaoDe: formData.acaoDe.trim(),
        situacao: formData.situacao,
        numeroProcesso: formData.numeroProcesso.trim(),
        valorDivida: formData.valorDivida || null,
        condominioId: formData.condominioId || null,
        movimentacoes: formData.movimentacoes?.trim() || null,
      };

      console.log('=== ENVIANDO DADOS ===');
      console.log('Dados processados:', submitData);

      if (processo) {
        console.log('Atualizando processo:', processo.id);
        const resultado = await processoService.update(processo.id, submitData);
        console.log('Resultado da atualização:', resultado);
      } else {
        console.log('Criando novo processo');
        const resultado = await processoService.create(submitData);
        console.log('Resultado da criação:', resultado);
      }

      // Mostrar animação de sucesso
      setShowLoading(false);
      setShowSuccess(true);
      
      console.log('Processo salvo com sucesso!');

      // Reset form após 2 segundos e fechar modal
      setTimeout(() => {
        setFormData({
          nome: '',
          unidade: '',
          acaoDe: '',
          situacao: 'CITACAO',
          numeroProcesso: '',
          valorDivida: undefined,
          movimentacoes: '',
          condominioId: undefined,
        });

        setIsOpen(false);
        setShowSuccess(false);
        onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('ERROR AO SALVAR PROCESSO:', error);
      alert(`Erro ao salvar processo: ${error.message || error}`);
      setShowLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProcessoCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const SituacaoOptions = [
    { value: 'CITACAO', label: 'Citação' },
    { value: 'CONTESTACAO', label: 'Contestação' },
    { value: 'REPLICA', label: 'Réplica' },
    { value: 'SISBAJUD', label: 'Sisbajud' },
    { value: 'PENHORA_DA_UNIDADE', label: 'Penhorada da Unidade' },
    { value: 'ACORDO_PROTOCOLADO', label: 'Acordo Protocolado' },
    { value: 'ACORDO_HOMOLOGADO', label: 'Acordo Homologado' },
    { value: 'ACORDO_QUEBRADO', label: 'Acordo Quebrado' },
    { value: 'QUITACAO_DA_DIVIDA', label: 'Quitação da Dívida' },
    { value: 'EXTINTO', label: 'Extinto' },
    { value: 'CUMP_SENTENCA', label: 'Cump. de Sentença' },
    { value: 'GRAU_DE_RECURSO', label: 'Grau de Recurso' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {processo ? <FileEdit className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {processo ? 'Editar' : 'Novo Processo'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {processo ? 'Editar Processo' : 'Novo Processo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroProcesso">Número do Processo</Label>
              <Input
                id="numeroProcesso"
                value={formData.numeroProcesso}
                onChange={(e) => handleChange('numeroProcesso', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Input
                id="unidade"
                value={formData.unidade}
                onChange={(e) => handleChange('unidade', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acaoDe">Ação De</Label>
              <Input
                id="acaoDe"
                value={formData.acaoDe}
                onChange={(e) => handleChange('acaoDe', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <Select value={formData.situacao} onValueChange={(value) => handleChange('situacao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  {SituacaoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorDivida">Valor da Dívida (opcional)</Label>
              <Input
                id="valorDivida"
                placeholder="Ex: 1500"
                type="text"
                value={formData.valorDivida ? formData.valorDivida.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  const numericValue = value ? parseFloat(value) : null;
                  handleChange('valorDivida', numericValue);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condominio">Condomínio</Label>
            <Select 
              value={formData.condominioId || ''} 
              onValueChange={(value) => handleChange('condominioId', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o condomínio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum condomínio</SelectItem>
                {condominios.map((cond) => (
                  <SelectItem key={cond.id} value={cond.id}>
                    {cond.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movimentacoes">Movimentações</Label>
            <textarea
              id="movimentacoes"
              className="w-full min-h-[120px] p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.movimentacoes || ''}
              onChange={(e) => handleChange('movimentacoes', e.target.value)}
              placeholder="Descreva as movimentações do processo..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (processo ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Overlay de Loading */}
      {showLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="animate-spin">
              <Loader2 className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">Salvando processo...</p>
          </div>
        </div>
      )}
      
      {/* Overlay de Sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-500 drop-shadow-lg" />
            </div>
            <p className="text-gray-800 font-bold text-xl">Processo salvo com sucesso!</p>
          </div>
        </div>
        )}
    </Dialog>
  );
};
