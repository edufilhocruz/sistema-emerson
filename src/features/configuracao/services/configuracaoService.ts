import { Usuario, LogEntry, EmailFormData, SegurancaFormData } from '../types';
import apiClient from '@/services/apiClient';

//================================== MOCK DATA ==================================
// Dados simulados para usuários. Em um ambiente real, viriam do banco de dados.
const mockUsuarios: Usuario[] = [
  { id: '1', nome: 'Eduardo Cruz', email: 'admin@raunaimer.com', role: 'Admin', status: 'Ativo' },
  { id: '2', nome: 'Alice Siqueira', email: 'alice@raunaimer.com', role: 'Operador', status: 'Ativo' },
  { id: '3', nome: 'Bruno Costa', email: 'bruno@raunaimer.com', role: 'Operador', status: 'Inativo' },
];

// Geração de dados simulados para logs para demonstrar a paginação.
const mockLogs: LogEntry[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `log${i + 1}`,
  dataHora: new Date(Date.now() - i * 3600000), // Logs a cada hora a partir de agora
  usuario: i % 2 === 0 ? 'admin@raunaimer.com' : 'alice@raunaimer.com',
  acao: `Enviou cobrança para a unidade A-${100 + i}`,
  ip: `192.168.1.${10 + i}`,
}));


//============================== SERVICE IMPLEMENTATION ==============================

/**
 * configuracaoService
 * * Este objeto serve como uma camada de acesso a dados (Data Access Layer) para todas as
 * funcionalidades relacionadas à configuração. Ele abstrai a origem dos dados,
 * permitindo que o resto da aplicação não precise saber se os dados vêm de uma API,
 * de um banco de dados local ou de mocks.
 */
const configuracaoService = {
  /**
   * Busca a lista de todos os usuários do sistema.
   * @returns Uma promessa que resolve para um array de objetos Usuario.
   */
  getUsuarios: async (): Promise<Usuario[]> => {
    console.log('SERVICE: Buscando usuários...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latência da rede
    return mockUsuarios;
  },
  
  /**
   * Busca as configurações de e-mail atuais.
   * @returns Uma promessa que resolve para um objeto com as configurações de e-mail.
   */
  getEmailConfig: async (): Promise<Partial<EmailFormData>> => {
    const { data } = await apiClient.get('/email-config');
    // Buscar assinatura do localStorage
    const assinatura = localStorage.getItem('assinaturaPadrao') || '';
    // Extrair apenas o nome do remetente
    let nomeRemetente = 'Raunaimer Jurídico';
    if (data.from) {
      const match = data.from.match(/^(.*?)</);
      nomeRemetente = match ? match[1].trim() : data.from;
    }
    
    // Determinar tipo de segurança baseado na porta e configuração secure
    let tipoSeguranca: 'TLS' | 'SSL' | 'Nenhuma' = 'Nenhuma';
    if (data.port === 587) {
      tipoSeguranca = 'TLS';
    } else if (data.port === 465 || data.secure) {
      tipoSeguranca = 'SSL';
    }
    
    return {
      tipoEnvio: 'SMTP',
      servidorSmtp: data.host,
      porta: data.port,
      tipoSeguranca,
      emailRemetente: data.user,
      senhaRemetente: data.pass,
      nomeRemetente,
      assinatura,
    };
  },

  saveEmailConfig: async (form: EmailFormData): Promise<void> => {
    const payload = {
      host: form.servidorSmtp,
      port: form.porta,
      user: form.emailRemetente,
      pass: form.senhaRemetente,
      from: `${form.nomeRemetente} <${form.emailRemetente}>`,
      secure: form.tipoSeguranca === 'SSL',
    };
    await apiClient.post('/email-config', payload);
    // Salvar assinatura no localStorage
    localStorage.setItem('assinaturaPadrao', form.assinatura);
  },

  testEmail: async (to: string): Promise<void> => {
    await apiClient.post('/email-config/test', {
      to,
      subject: 'Teste de E-mail',
      text: 'Esse é um email de teste.'
    });
  },

  /**
   * Busca uma página de registros de log do sistema.
   * @param page O número da página a ser buscada.
   * @param limit A quantidade de itens por página.
   * @returns Uma promessa que resolve para um objeto contendo os logs da página e o total de registros.
   */
  getLogs: async ({ page, limit }: { page: number; limit: number }): Promise<{ logs: LogEntry[], total: number }> => {
    const { data } = await apiClient.get('/logs', { params: { page, limit } });
    // Mapear campos do backend para o frontend
    return {
      logs: data.logs.map((log: any) => ({
        id: log.id,
        dataHora: new Date(log.createdAt),
        usuario: log.usuario,
        acao: log.acao,
        ip: log.ip,
      })),
      total: data.total,
    };
  },

  /**
   * Busca as configurações de segurança atuais.
   * @returns Uma promessa que resolve para um objeto com as configurações de segurança.
   */
  getSegurancaConfig: async (): Promise<Partial<SegurancaFormData>> => {
    console.log('SERVICE: Buscando configurações de segurança...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      expiracaoSessao: 30,
      tentativasLogin: 5,
      minCaracteresSenha: 8,
      requerNumero: true,
      requerEspecial: true,
    };
  },
};

export default configuracaoService;