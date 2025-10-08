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
    // Forçar impressão com JavaScript - FORMATO CORRETO
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const cartasHtml = cartas.map((carta) => `
        <!-- PÁGINA DE ROSTO -->
        <div style="page-break-after: always; width: 210mm; min-height: 297mm; padding: 20mm; margin: 0; background: white; box-shadow: none; border: none;">
          <!-- Logo e Cabeçalho -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30mm;">
            <div style="display: flex; align-items: center;">
              <img src="/logotipo.png" alt="Logotipo Raunaimer" style="height: 40mm; width: auto; max-width: 60mm;" />
            </div>
            <div style="border: 1px solid #333; padding: 8mm; text-align: center; min-width: 60mm;">
              <div style="font-weight: bold; font-size: 14pt; margin-bottom: 4mm;">BOLETO DE COBRANÇA - ${carta.paginaRosto.mesAno}</div>
              <div style="font-weight: bold; font-size: 14pt;">${carta.paginaRosto.nomeMorador}</div>
            </div>
          </div>

          <!-- Informações do Condomínio -->
          <div style="border: 1px solid #333; padding: 8mm; margin-bottom: 8mm;">
            <div style="font-weight: bold; font-size: 12pt; margin-bottom: 4mm;">${carta.paginaRosto.nomeCondominio}</div>
            <div style="font-size: 10pt; margin-bottom: 2mm;">${carta.paginaRosto.enderecoCondominio}${carta.paginaRosto.complementoCondominio ? ', ' + carta.paginaRosto.complementoCondominio : ''}</div>
            <div style="font-size: 10pt; margin-bottom: 2mm;">${carta.paginaRosto.cepCondominio} - ${carta.paginaRosto.bairroCondominio} - ${carta.paginaRosto.cidadeEstadoCondominio}</div>
            <div style="text-align: right; font-size: 10pt; margin-top: 4mm;">Unidade: ${carta.paginaRosto.unidade}</div>
          </div>

          <!-- Informações do Morador -->
          <div style="border: 1px solid #333; padding: 8mm;">
            <div style="font-weight: bold; font-size: 12pt; margin-bottom: 4mm;">${carta.paginaRosto.nomeMorador}</div>
            <div style="font-size: 10pt; margin-bottom: 2mm;">${carta.paginaRosto.enderecoMorador}</div>
            <div style="font-size: 10pt; margin-bottom: 2mm;">${carta.paginaRosto.cepMorador} - ${carta.paginaRosto.bairroMorador} - ${carta.paginaRosto.cidadeEstadoMorador}</div>
            <div style="font-size: 10pt; margin: 4mm 0;">-</div>
            <div style="font-size: 10pt; color: #0066cc;">https://raunaimer.com.br</div>
          </div>
        </div>

        <!-- CARTA DE COBRANÇA -->
        <div style="page-break-after: auto; width: 210mm; min-height: 297mm; padding: 20mm; margin: 0; background: white; box-shadow: none; border: none;">
          <!-- Cabeçalho da carta -->
          <div style="margin-bottom: 20mm;">
            <div style="text-align: right; font-size: 10pt; color: #666; margin-bottom: 8mm;">${new Date().toLocaleDateString('pt-BR')}</div>
            <div style="font-size: 14pt; font-weight: bold;">${carta.condominio}</div>
          </div>

          <!-- Destinatário -->
          <div style="margin-bottom: 20mm;">
            <div style="font-size: 12pt; font-weight: bold; margin-bottom: 4mm;">Para:</div>
            <div style="border-left: 4px solid #0066cc; padding-left: 8mm;">
              <div style="font-weight: bold; font-size: 12pt;">${carta.destinatario.nome}</div>
              <div style="font-size: 10pt; color: #666; margin-bottom: 2mm;">Unidade: ${carta.destinatario.unidade}</div>
              ${carta.destinatario.endereco.map(linha => `<div style="font-size: 10pt; color: #666;">${linha}</div>`).join('')}
            </div>
          </div>

          <!-- Conteúdo da carta -->
          <div style="margin-bottom: 20mm; line-height: 1.6; font-size: 11pt;">
            ${carta.conteudo}
          </div>

          <!-- Informações de cobrança -->
          <div style="border-top: 1px solid #ccc; padding-top: 8mm; margin-top: 20mm;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8mm;">
              <div style="font-size: 10pt;"><span style="font-weight: bold;">Valor:</span> ${carta.valor}</div>
              <div style="font-size: 10pt;"><span style="font-weight: bold;">Vencimento:</span> ${carta.vencimento}</div>
            </div>
          </div>

          <!-- Rodapé -->
          <div style="margin-top: 20mm; padding-top: 8mm; border-top: 1px solid #ccc; text-align: center; font-size: 10pt; color: #666;">
            Sistema Raunaimer - Gestão de Condomínios
          </div>
        </div>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Impressão de Cobranças</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            * {
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          </style>
        </head>
        <body>
          ${cartasHtml}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      // Fallback para navegadores que bloqueiam popups
      window.print();
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
