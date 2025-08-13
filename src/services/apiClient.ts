import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Usa proxy do Vite
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Garante envio de cookies JWT
});

export default apiClient;