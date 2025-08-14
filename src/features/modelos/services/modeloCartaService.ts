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
      throw new Error('Erro ao criar modelo de carta');
    }

    return response.json();
  },

  /**
   * Atualiza um modelo de carta existente
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
      throw new Error('Erro ao atualizar modelo de carta');
    }

    return response.json();
  },

  /**
   * Remove um modelo de carta
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao remover modelo de carta');
    }
  },

  /**
   * Upload de imagem com geração de URL temporária e CID
   */
  async uploadImage(file: File): Promise<{ cid: string; previewUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro no upload: ${error}`);
    }

    return response.json(); // { cid, previewUrl }
  },

  /**
   * Busca campos dinâmicos disponíveis
   */
  async getCamposDinamicos(): Promise<any> {
    const response = await fetch(`${API_BASE}/campos-dinamicos`);
    if (!response.ok) {
      throw new Error('Erro ao buscar campos dinâmicos');
    }
    return response.json();
  }
};