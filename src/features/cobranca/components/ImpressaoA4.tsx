import React from 'react';

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
  cartas: CartaImpressao[];
}

export const ImpressaoA4: React.FC<ImpressaoA4Props> = ({ cartas }) => {
  return (
    <div className="impressao-a4-container">
      {cartas.map((carta, index) => (
        <div key={`carta-${carta.id}`} className="carta-a4">
          {/* PÁGINA DE ROSTO */}
          <div className="pagina-a4 pagina-rosto">
            {/* Logo e Cabeçalho */}
            <div className="cabecalho-rosto">
              <div className="logo-container">
                <img 
                  src="/logotipo.png" 
                  alt="Logotipo Raunaimer" 
                  className="logo-raunaimer"
                />
              </div>
              
              {/* Cabeçalho de Cobrança */}
              <div className="cabecalho-cobranca">
                <div className="titulo-cobranca">BOLETO DE COBRANÇA - {carta.paginaRosto.mesAno}</div>
                <div className="nome-morador">{carta.paginaRosto.nomeMorador}</div>
              </div>
            </div>

            {/* Informações do Condomínio */}
            <div className="caixa-endereco">
              <div className="titulo-caixa">{carta.paginaRosto.nomeCondominio}</div>
              <div className="endereco-linha">
                {carta.paginaRosto.enderecoCondominio}
                {carta.paginaRosto.complementoCondominio && `, ${carta.paginaRosto.complementoCondominio}`}
              </div>
              <div className="endereco-linha">
                {carta.paginaRosto.cepCondominio} - {carta.paginaRosto.bairroCondominio} - {carta.paginaRosto.cidadeEstadoCondominio}
              </div>
              <div className="unidade-info">Unidade: {carta.paginaRosto.unidade}</div>
            </div>

            {/* Informações do Morador */}
            <div className="caixa-endereco">
              <div className="titulo-caixa">{carta.paginaRosto.nomeMorador}</div>
              <div className="endereco-linha">{carta.paginaRosto.enderecoMorador}</div>
              <div className="endereco-linha">
                {carta.paginaRosto.cepMorador} - {carta.paginaRosto.bairroMorador} - {carta.paginaRosto.cidadeEstadoMorador}
              </div>
              <div className="linha-separadora">-</div>
              <div className="website-url">https://raunaimer.com.br</div>
            </div>
          </div>

          {/* CARTA DE COBRANÇA */}
          <div className="pagina-a4 pagina-carta">
            {/* Cabeçalho da carta */}
            <div className="cabecalho-carta">
              <div className="data-carta">
                {new Date().toLocaleDateString('pt-BR')}
              </div>
              <div className="nome-condominio">
                {carta.condominio}
              </div>
            </div>

            {/* Destinatário */}
            <div className="destinatario-section">
              <div className="label-destinatario">Para:</div>
              <div className="dados-destinatario">
                <div className="nome-destinatario">{carta.destinatario.nome}</div>
                <div className="unidade-destinatario">Unidade: {carta.destinatario.unidade}</div>
                {carta.destinatario.endereco.map((linha, i) => (
                  <div key={i} className="endereco-destinatario">{linha}</div>
                ))}
              </div>
            </div>

            {/* Conteúdo da carta */}
            <div 
              className="conteudo-carta"
              dangerouslySetInnerHTML={{ __html: carta.conteudo }}
            />

            {/* Informações de cobrança */}
            <div className="info-cobranca">
              <div className="grid-cobranca">
                <div className="info-item">
                  <span className="label-info">Valor:</span> {carta.valor}
                </div>
                <div className="info-item">
                  <span className="label-info">Vencimento:</span> {carta.vencimento}
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="rodape-carta">
              Sistema Raunaimer - Gestão de Condomínios
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
