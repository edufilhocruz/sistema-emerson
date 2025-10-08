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
            <div className="space-y-8 print:space-y-0">
              {cartas.map((carta, index) => (
                <div key={carta.id} className="carta-container">
                  {/* PÁGINA DE ROSTO */}
                  <div 
                    className="print-page-a4"
                    style={{ 
                      pageBreakAfter: 'always',
                      minHeight: '297mm', // A4 height
                      backgroundColor: 'white',
                      width: '210mm', // A4 width
                      margin: '0 auto',
                      padding: '20mm',
                      boxShadow: 'none'
                    }}
                  >
                    {/* Logo e Cabeçalho */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center">
                        <img 
                          src="/logotipo.png" 
                          alt="Logotipo Raunaimer" 
                          className="h-16 w-auto"
                        />
                      </div>
                      
                      {/* Cabeçalho de Cobrança */}
                      <div className="border border-gray-400 p-4 text-center">
                        <div className="font-semibold text-lg">BOLETO DE COBRANÇA - {carta.paginaRosto.mesAno}</div>
                        <div className="font-semibold text-lg mt-1">{carta.paginaRosto.nomeMorador}</div>
                      </div>
                    </div>

                    {/* Informações do Condomínio */}
                    <div className="address-box p-6 mb-6">
                      <div className="font-bold text-lg mb-2">{carta.paginaRosto.nomeCondominio}</div>
                      <div className="text-sm text-gray-700 mb-1">
                        {carta.paginaRosto.enderecoCondominio}
                        {carta.paginaRosto.complementoCondominio && `, ${carta.paginaRosto.complementoCondominio}`}
                      </div>
                      <div className="text-sm text-gray-700">
                        {carta.paginaRosto.cepCondominio} - {carta.paginaRosto.bairroCondominio} - {carta.paginaRosto.cidadeEstadoCondominio}
                      </div>
                      <div className="text-right text-sm text-gray-600 mt-2">
                        Unidade: {carta.paginaRosto.unidade}
                      </div>
                    </div>

                    {/* Informações do Morador */}
                    <div className="address-box p-6">
                      <div className="font-bold text-lg mb-2">{carta.paginaRosto.nomeMorador}</div>
                      <div className="text-sm text-gray-700 mb-1">{carta.paginaRosto.enderecoMorador}</div>
                      <div className="text-sm text-gray-700 mb-2">
                        {carta.paginaRosto.cepMorador} - {carta.paginaRosto.bairroMorador} - {carta.paginaRosto.cidadeEstadoMorador}
                      </div>
                      <div className="text-sm text-gray-500">-</div>
                      <div className="text-sm text-blue-600 mt-2">https://raunaimer.com.br</div>
                    </div>
                  </div>

                  {/* CARTA DE COBRANÇA */}
                  <div 
                    className="print-page-a4"
                    style={{ 
                      pageBreakAfter: index < cartas.length - 1 ? 'always' : 'auto',
                      minHeight: '297mm', // A4 height
                      backgroundColor: 'white',
                      width: '210mm', // A4 width
                      margin: '0 auto',
                      padding: '20mm',
                      boxShadow: 'none'
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
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
