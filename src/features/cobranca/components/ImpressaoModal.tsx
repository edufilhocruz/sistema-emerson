import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import cobrancaService from '../services/cobrancaService';

// --- Interfaces movidas para dentro do arquivo para autossuficiência ---
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

interface ImpressaoA4Props {
  carta: CartaImpressao;
  logoUrl?: string;
}

// --- Componente PaginaRostoA4 movido para dentro do arquivo ---
const PaginaRostoA4 = ({ carta, logoUrl }: ImpressaoA4Props) => {
  return (
    <div style={{
      pageBreakAfter: 'always',
      width: '210mm',
      height: '297mm',
      margin: '0 auto 10mm auto',
      background: 'white',
      border: '1px solid #eee',
      boxShadow: '0 0 5px rgba(0,0,0,0.1)',
      position: 'relative',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ position: 'absolute', inset: '0', padding: '15mm' }}>
        {/* Itens movidos 20mm para cima */}
        <img src={logoUrl || '/logotipo.png'} alt="Logotipo Raunaimer" style={{ position: 'absolute', left: '15mm', top: '92mm', height: '35mm', width: 'auto', maxWidth: '50mm', filter: 'none', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
        <div style={{ position: 'absolute', right: '15mm', top: '92mm', border: '0.3mm solid #333', padding: '6mm', minWidth: '50mm', textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '3mm' }}>AVISO - DÉBITOS CONDOMINIAIS - {carta.paginaRosto.mesAno}</div>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>{carta.paginaRosto.nomeMorador}</div>
        </div>
        <div style={{ position: 'absolute', left: '15mm', width: '180mm', top: '130mm', border: '0.3mm solid #333', padding: '6mm' }}>
          <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '3mm' }}>{carta.paginaRosto.nomeCondominio}</div>
          <div style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>{carta.paginaRosto.enderecoCondominio}{carta.paginaRosto.complementoCondominio ? ', ' + carta.paginaRosto.complementoCondominio : ''}</div>
          <div style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>{carta.paginaRosto.cepCondominio} - {carta.paginaRosto.bairroCondominio} - {carta.paginaRosto.cidadeEstadoCondominio}</div>
          <div style={{ textAlign: 'right', fontSize: '9pt', marginTop: '3mm' }}>Unidade: {carta.paginaRosto.unidade}</div>
        </div>
        
        {/* Bloco inferior mantém a posição original */}
        <div style={{ position: 'absolute', left: '15mm', width: '180mm', bottom: '30mm', border: '0.3mm solid #333', padding: '6mm' }}>
          <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '3mm' }}>{carta.paginaRosto.nomeMorador}</div>
          <div style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>{carta.paginaRosto.enderecoMorador}</div>
          <div style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>{carta.paginaRosto.cepMorador} - {carta.paginaRosto.bairroMorador} - {carta.paginaRosto.cidadeEstadoMorador}</div>
          <div style={{ fontSize: '9pt', margin: '6mm 0' }}>-</div>
          <div style={{ fontSize: '9pt', color: '#0066cc' }}>https://raunaimer.com.br</div>
        </div>
      </div>
    </div>
  );
};

// --- Fim do MOCK: usamos o serviço real de cobrança ---

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
        const absoluteLogo = `${window.location.origin}/logotipo.png`;
        const paginaRostoHtml = ReactDOMServer.renderToStaticMarkup(<PaginaRostoA4 carta={carta} logoUrl={absoluteLogo} />);
        
        const cartaCobrancaHtml = `
          <div style="page-break-after: always; width: 210mm; height: 297mm; padding: 16mm; margin: 0; background: white; box-shadow: none; border: none; font-family: sans-serif; overflow: hidden;">
            <!-- Cabeçalho com logotipo (colorido) e data -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10mm;">
              <img src="${absoluteLogo}" alt="Logotipo Raunaimer" style="height: 12mm; width: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; filter: none;" />
              <div style="text-align: right; font-size: 10pt; color: #666;">${new Date().toLocaleDateString('pt-BR')}</div>
            </div>
            <div style="margin-bottom: 10mm; font-size: 14pt; font-weight: bold;">${carta.condominio}</div>
            <!-- Bloco 'Para:' removido conforme solicitação -->
            <div style="line-height: 1.45; font-size: 10.5pt;">${carta.conteudo}</div>
            <div style="margin-top: 12mm; padding-top: 6mm; border-top: 1px solid #ccc; text-align: center; font-size: 9.5pt; color: #666;">Sistema Raunaimer - Gestão de Condomínios</div>
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
            /* Garantir impressão colorida de imagens */
            img { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; filter: none !important; }
            /* Evitar que o Chrome remova imagens externas */
            @media print {
              img { visibility: visible !important; opacity: 1 !important; }
            }
            /* Evitar quebras inesperadas */
            .carta-pagina { page-break-after: always; }
            .carta-pagina * { page-break-inside: avoid; }
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
  }, [isOpen, gerado]);

  // Imprimir automaticamente quando as cartas forem geradas
  React.useEffect(() => {
    if (gerado && cartas.length > 0) {
      handleImprimir();
      handleClose();
    }
  }, [gerado, cartas]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preparando Impressão</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
            <p>Gerando cartas para impressão...</p>
            <p className="mt-2 text-sm text-gray-500">{cobrancaIds.length} cobrança(s) selecionada(s)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

