import axios from 'axios'
import { ContactFormData, ApiResponse } from '@/types'

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para logs de requisição
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Interceptor para logs de resposta
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const contactService = {
  /**
   * Envia dados do formulário de contato para a API
   * @param data - Dados do formulário
   * @returns Promise com resposta da API
   */
  async submitContact(data: ContactFormData): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/contact', {
        ...data,
        source: 'landing-page',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      })

      return response.data
    } catch (error: any) {
      // Se for erro de rede (servidor offline), mostrar mensagem específica
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error('Servidor de emails indisponível. Tente novamente em alguns instantes.')
      }

      // Se for erro de validação do servidor
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Dados inválidos')
      }

      // Se for erro de rate limiting
      if (error.response?.status === 429) {
        throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      }

      // Erro genérico
      throw new Error('Erro ao enviar mensagem. Tente novamente.')
    }
  },

  /**
   * Verifica se o servidor está online
   * @returns Promise com status do servidor
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await api.get('/api/health')
      return response.data.success
    } catch (error) {
      console.warn('Servidor de emails offline:', error)
      return false
    }
  },

  /**
   * Envia dados para analytics/tracking
   * @param event - Nome do evento
   * @param properties - Propriedades do evento
   */
  async trackEvent(event: string, properties: Record<string, any> = {}): Promise<void> {
    // Desabilitado em desenvolvimento local
    if (import.meta.env.DEV) {
      console.log('Tracking desabilitado em desenvolvimento:', event, properties)
      return
    }

    try {
      await api.post('/api/analytics/track', {
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      })
    } catch (error) {
      // Silenciar erros de tracking para não afetar UX
      console.warn('Erro no tracking:', error)
    }
  },

  /**
   * Valida dados do formulário no servidor
   * @param data - Dados para validação
   * @returns Promise com resultado da validação
   */
  async validateContact(data: Partial<ContactFormData>): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/contact/validate', data)
      return response.data
    } catch (error) {
      console.warn('Validação no servidor indisponível:', error)
      return {
        success: true,
        message: 'Validação local realizada',
      }
    }
  },
} 