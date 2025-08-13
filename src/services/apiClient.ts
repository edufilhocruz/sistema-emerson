import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Usa proxy do Vite
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Garante envio de cookies JWT
});

// Interceptor para adicionar token Bearer quando necessário
apiClient.interceptors.request.use((config) => {
  // Tenta obter token do localStorage (para compatibilidade com Postman)
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;