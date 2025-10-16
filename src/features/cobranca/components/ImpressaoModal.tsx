import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import cobrancaService from '../services/cobrancaService';
import { PaginaRostoA4 } from './ImpressaoA4';

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
      const response = await cobrancaService.gerarCartasImpressao(cobrancaIds);
      setCartas(response.cartas);
      setGerado(true);
    } catch (error) {
      console.error('❌ Erro ao gerar cartas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const cartasHtml = cartas.map((carta) => {
        const paginaRostoHtml = ReactDOMServer.renderToStaticMarkup(<PaginaRostoA4 carta={carta} />);
        
        const cartaCobrancaHtml = `
          <div style="page-break-after: auto; width: 210mm; min-height: 297mm; padding: 20mm; margin: 0; background: white; box-shadow: none; border: none; font-family: sans-serif;">
            <div style="margin-bottom: 20mm;">
              <div style="text-align: right; font-size: 10pt; color: #666; margin-bottom: 8mm;">${new Date().toLocaleDateString('pt-BR')}</div>
              <div style="font-size: 14pt; font-weight: bold;">${carta.condominio}</div>
            </div>
            <div style="margin-bottom: 20mm;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 4mm;">Para:</div>
              <div style="border-left: 4px solid #0066cc; padding-left: 8mm;">
                <div style="font-weight: bold; font-size: 12pt;">${carta.destinatario.nome}</div>
                <div style="font-size: 10pt; color: #666; margin-bottom: 2mm;">Unidade: ${carta.destinatario.unidade}</div>
                ${carta.destinatario.endereco.map(linha => `<div style="font-size: 10pt; color: #666;">${linha}</div>`).join('')}
              </div>
            </div>
            <div style="margin-bottom: 20mm; line-height: 1.6; font-size: 11pt;">${carta.conteudo}</div>
            <div style="border-top: 1px solid #ccc; padding-top: 8mm; margin-top: 20mm;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8mm;">
                <div style="font-size: 10pt;"><span style="font-weight: bold;">Valor:</span> ${carta.valor}</div>
                <div style="font-size: 10pt;"><span style="font-weight: bold;">Vencimento:</span> ${carta.vencimento}</div>
              </div>
            </div>
            <div style="margin-top: 20mm; padding-top: 8mm; border-top: 1px solid #ccc; text-align: center; font-size: 10pt; color: #666;">Sistema Raunaimer - Gestão de Condomínios</div>
          </div>
        `;
        return paginaRostoHtml + cartaCobrancaHtml;
      }).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Impressão de Cobranças</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; background: #f0f0f0; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${cartasHtml}</body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
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
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden flex flex-col">
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
        
        <div className="h-full p-8 overflow-y-auto bg-gray-200 print:hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
                <p>Gerando cartas para impressão...</p>
              </div>
            </div>
          ) : (
             <div className="space-y-4">
              {cartas.map((carta) => (
                <PaginaRostoA4 key={carta.id} carta={carta} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

