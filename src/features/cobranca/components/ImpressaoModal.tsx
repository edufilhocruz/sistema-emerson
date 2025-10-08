import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import cobrancaService from '../services/cobrancaService';
import { ImpressaoA4 } from './ImpressaoA4';
import './ImpressaoA4.css';

interface CartaImpressao {
  id: string;
  destinatario: {
    nome: string;
    endereco: string[];
    unidade: string;
  };
  conteudo: string;
  modelo: string;
  valor: string;
  vencimento: string;
  condominio: string;
  paginaRosto: {
    mesAno: string;
    nomeMorador: string;
    nomeCondominio: string;
    enderecoCondominio: string;
    complementoCondominio: string;
    cepCondominio: string;
    bairroCondominio: string;
    cidadeEstadoCondominio: string;
    unidade: string;
    enderecoMorador: string;
    cepMorador: string;
    bairroMorador: string;
    cidadeEstadoMorador: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cobrancaIds: string[];
}

export const ImpressaoModal = ({ isOpen, onClose, cobrancaIds }: Props) => {
  const [cartas, setCartas] = useState<CartaImpressao[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerado, setGerado] = useState(false);

  const handleGerar = async () => {
    setLoading(true);
    try {
      console.log('🔄 Gerando cartas para IDs:', cobrancaIds);
      const response = await cobrancaService.gerarCartasImpressao(cobrancaIds);
      console.log('✅ Resposta recebida:', response);
      console.log('✅ Cartas geradas:', response.cartas);
      setCartas(response.cartas);
      setGerado(true);
    } catch (error) {
      console.error('❌ Erro ao gerar cartas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleClose = () => {
    setCartas([]);
    setGerado(false);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && !gerado) {
      handleGerar();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            <span>Cartas para Impressão ({cobrancaIds.length} selecionadas)</span>
            <div className="flex gap-2">
              <Button onClick={handleImprimir} disabled={!gerado || loading}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="h-full overflow-y-auto print:overflow-visible">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Gerando cartas para impressão...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Preview para tela */}
              <div className="print:hidden">
                <div className="space-y-8">
                  {cartas.map((carta, index) => (
                    <div key={carta.id} className="border rounded-lg p-6 bg-white">
                      <div className="text-sm text-gray-600 mb-4">
                        Carta {index + 1} de {cartas.length} - {carta.destinatario.nome}
                      </div>
                      <div className="text-lg font-bold mb-2">
                        {carta.condominio}
                      </div>
                      <div className="text-sm text-gray-600">
                        Unidade: {carta.destinatario.unidade}
                      </div>
                      <div className="text-sm text-gray-600">
                        Valor: {carta.valor} | Vencimento: {carta.vencimento}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Componente A4 para impressão */}
              <ImpressaoA4 cartas={cartas} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
