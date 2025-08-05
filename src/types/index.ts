// Tipos para o formulário de contato
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  units?: string;
  message?: string;
  contactType?: string;
}

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

// Tipos para analytics/tracking
export interface TrackingEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  url: string;
  userAgent: string;
} 