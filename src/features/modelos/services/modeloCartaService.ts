import { ModeloCarta, ModeloFormData } from '@/entities/modelos/types';

const API_BASE = '/api/modelo-carta';

export const modeloCartaService = {
  /**
   * Busca todos os modelos de carta
   */
  async getAll(): Promise<ModeloCarta[]> {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Erro ao buscar modelos de carta');
    }
    return response.json();
  },

  /**
   * Busca um modelo específico por ID
   */
  async getById(id: string): Promise<ModeloCarta> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar modelo de carta');
    }
    return response.json();
  },

  /**
   * Cria um novo modelo de carta
   */
  async create(data: ModeloFormData): Promise<ModeloCarta> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar modelo de carta');
    }
    
    return response.json();
  },

  /**
   * Atualiza um modelo existente
   */
  async update(id: string, data: ModeloFormData): Promise<ModeloCarta> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar modelo de carta');
    }
    
    return response.json();
  },

  /**
   * Remove um modelo
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Erro ao excluir modelo de carta');
    }
  },

  /**
   * Busca os campos dinâmicos disponíveis
   */
  async getCamposDinamicos() {
    const response = await fetch(`${API_BASE}/campos-dinamicos`);
    if (!response.ok) {
      throw new Error('Erro ao buscar campos dinâmicos');
    }
    return response.json();
  },
};