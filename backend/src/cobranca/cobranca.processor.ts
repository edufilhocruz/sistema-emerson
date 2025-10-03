import { Injectable } from '@nestjs/common';

/**
 * Interface para dados de cobrança processados
 */
export interface DadosCobrancaProcessados {
  nome_morador: string;
  email: string;
  telefone: string;
  bloco: string;
  apartamento: string;
  unidade: string;
  nome_condominio: string;
  cnpj: string;
  cidade: string;
  estado: string;
  endereco: string;
  valor: string;
  valor_formatado: string;
  mes_referencia: string;
  data_vencimento: string;
  data_atual: string;
  hoje: string;
}

/**
 * Serviço responsável por processar dados de cobrança
 * Implementa arquitetura limpa com separação de responsabilidades
 */
@Injectable()
export class CobrancaProcessor {
  
  /**
   * Processa dados de uma cobrança para substituição de placeholders
   */
  processarDadosCobranca(cobranca: any): DadosCobrancaProcessados {
    console.log('=== PROCESSANDO DADOS DE COBRANÇA ===');
    
    // Calcula mês de referência
    const hoje = new Date();
    const mesReferencia = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

    // Monta o endereço completo do condomínio
    const enderecoCondominio = [
      cobranca.condominio.logradouro,
      cobranca.condominio.numero,
      cobranca.condominio.bairro,
      cobranca.condominio.cidade,
      cobranca.condominio.estado
    ].filter(Boolean).join(', ');

    // Determina o valor da cobrança
    let valor = cobranca.valor;
    if (valor === undefined || valor === null) {
      if (cobranca.morador.valorAluguel !== undefined && cobranca.morador.valorAluguel !== null) {
        valor = cobranca.morador.valorAluguel;
      }
    }

    const dadosProcessados: DadosCobrancaProcessados = {
      // Campos do morador
      nome_morador: this.capitalizarNome(cobranca.morador.nome),
      email: cobranca.morador.email,
      telefone: cobranca.morador.telefone || 'Telefone não informado',
      bloco: cobranca.morador.bloco,
      apartamento: cobranca.morador.apartamento,
      unidade: `${cobranca.morador.bloco}-${cobranca.morador.apartamento}`,
      
      // Campos do condomínio
      nome_condominio: cobranca.condominio.nome,
      cnpj: cobranca.condominio.cnpj,
      cidade: cobranca.condominio.cidade,
      estado: cobranca.condominio.estado,
      endereco: enderecoCondominio,
      
      // Campos da cobrança
      valor: valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado',
      valor_formatado: valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado',
      mes_referencia: mesReferencia,
      data_vencimento: new Date(cobranca.vencimento).toLocaleDateString('pt-BR'),
      
      // Data atual
      data_atual: hoje.toLocaleDateString('pt-BR'),
      hoje: hoje.toLocaleDateString('pt-BR')
    };

    console.log('✅ Dados processados:', JSON.stringify(dadosProcessados, null, 2));
    return dadosProcessados;
  }

  /**
   * Substitui placeholders no texto
   */
  substituirPlaceholders(texto: string, dados: Record<string, any>): string {
    let resultado = texto;
    
    console.log('=== SUBSTITUINDO PLACEHOLDERS ===');
    console.log('Texto original:', texto);
    
    // Substitui cada placeholder pelo seu valor correspondente
    Object.entries(dados).forEach(([placeholder, valor]) => {
      const placeholderCompleto = `{{${placeholder}}}`;
      if (resultado.includes(placeholderCompleto)) {
        // Escapa caracteres especiais para regex
        const placeholderEscapado = placeholderCompleto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(placeholderEscapado, 'g');
        resultado = resultado.replace(regex, String(valor || ''));
        console.log(`✅ Substituído: ${placeholderCompleto} -> ${valor}`);
      }
    });
    
    console.log('✅ Texto processado:', resultado);
    return resultado;
  }

  /**
   * Capitaliza o nome completo do morador
   */
  private capitalizarNome(nome: string): string {
    if (!nome) return '';
    
    // Divide o nome por espaços e capitaliza cada palavra
    return nome.trim()
      .split(' ')
      .map(palavra => {
        if (!palavra) return palavra;
        
        // Mantém algumas palavras em minúsculas por padrão
        const palavrasMinusculas = ['da', 'de', 'do', 'das', 'dos', 'e'];
        
        if (palavrasMinusculas.includes(palavra.toLowerCase()) && palavra.length > 2) {
          return palavra.toLowerCase();
        }
        
        return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
      })
      .join(' ');
  }
}
