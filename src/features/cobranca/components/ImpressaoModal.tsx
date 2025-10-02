import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import cobrancaService from '../services/cobrancaService';

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
            <div className="space-y-8 print:space-y-0">
              {cartas.map((carta, index) => (
                  <div 
                  key={carta.id} 
                  className="border rounded-lg p-6 bg-white print:border-0 print:rounded-none print:p-8 print:page-break-after-always print:min-h-screen print:bg-white"
                  style={{ 
                    pageBreakAfter: index < cartas.length - 1 ? 'always' : 'auto',
                    minHeight: '297mm', // A4 height
                    backgroundColor: 'white'
                  }}
                >
                  {/* Cabeçalho da carta */}
                  <div className="mb-8">
                    <div className="text-right text-sm text-gray-600 mb-4">
                      {new Date().toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-lg font-bold mb-2">
                      {carta.condominio}
                    </div>
                    <div className="text-sm text-gray-600">
                      Modelo: {carta.modelo}
                    </div>
                  </div>

                  {/* Destinatário */}
                  <div className="mb-8">
                    <div className="font-semibold text-lg mb-2">Para:</div>
                    <div className="border-l-4 border-primary pl-4">
                      <div className="font-semibold">{carta.destinatario.nome}</div>
                      <div className="text-sm text-gray-600">Unidade: {carta.destinatario.unidade}</div>
                      {carta.destinatario.endereco.map((linha, i) => (
                        <div key={i} className="text-sm text-gray-600">{linha}</div>
                      ))}
                    </div>
                  </div>

                  {/* Conteúdo da carta */}
                  <div 
                    className="prose max-w-none mb-8 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: carta.conteudo }}
                  />

                  {/* Informações de cobrança */}
                  <div className="border-t pt-4 mt-8">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Valor:</span> {carta.valor}
                      </div>
                      <div>
                        <span className="font-semibold">Vencimento:</span> {carta.vencimento}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé */}
                  <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                    Sistema Raunaimer - Gestão de Condomínios
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
