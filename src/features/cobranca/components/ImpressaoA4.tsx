import React from 'react';

// Define o tipo para a prop 'carta' para maior segurança
interface Carta {
  id: string;
  destinatario: { nome: string; unidade: string; endereco: string[] };
  conteudo: string;
  valor: string;
  vencimento: string;
  condominio: string;
  paginaRosto: {
    mesAno: string;
    nomeMorador: string;
    nomeCondominio: string;
    enderecoCondominio: string;
    complementoCondominio?: string;
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
  carta: Carta;
}

// Este componente renderiza UMA PÁGINA A4 com o layout CORRETO.
export const PaginaRostoA4 = ({ carta }: ImpressaoA4Props) => {
  return (
    <div style={{
      pageBreakAfter: 'always',
      width: '210mm',
      height: '297mm',
      margin: '0 auto 10mm auto', // Adiciona margem para separar as páginas no preview
      background: 'white',
      border: '1px solid #eee',
      boxShadow: '0 0 5px rgba(0,0,0,0.1)',
      position: 'relative',
      fontFamily: 'sans-serif'
    }}>
      {/* Margem interna da página */}
      <div style={{ position: 'absolute', inset: '0', padding: '15mm' }}>
        
        {/* Logo (esquerda) */}
        <img src="/logotipo.png" alt="Logotipo Emerson Reis" style={{ position: 'absolute', left: '15mm', top: '112mm', height: '35mm', width: 'auto', maxWidth: '50mm' }} />

        {/* Quadro do título (direita) */}
        <div style={{ position: 'absolute', right: '15mm', top: '112mm', border: '0.3mm solid #333', padding: '6mm', minWidth: '50mm', textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '3mm' }}>BOLETO DE COBRANÇA - {carta.paginaRosto.mesAno}</div>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>{carta.paginaRosto.nomeMorador}</div>
        </div>

        {/* Bloco do condomínio (largura total) */}
        <div style={{ position: 'absolute', left: '15mm', width: '180mm', top: '150mm', border: '0.3mm solid #333', padding: '6mm' }}>
          <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '3mm' }}>{carta.paginaRosto.nomeCondominio}</div>
          <div style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>{carta.paginaRosto.enderecoCondominio}{carta.paginaRosto.complementoCondominio ? ', ' + carta.paginaRosto.complementoCondominio : ''}</div>
          <div style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>{carta.paginaRosto.cepCondominio} - {carta.paginaRosto.bairroCondominio} - {carta.paginaRosto.cidadeEstadoCondominio}</div>
          <div style={{ textAlign: 'right', fontSize: '9pt', marginTop: '3mm' }}>Unidade: {carta.paginaRosto.unidade}</div>
        </div>

        {/* Bloco do morador (fixo próximo ao rodapé) */}
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

