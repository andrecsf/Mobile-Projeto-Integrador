/**
 * api.js
 *
 * Instância global do axios.
 * O interceptor de request lê o token do authStore e o injeta
 * automaticamente em toda requisição como "Authorization: Bearer <token>".
 */

import axios    from 'axios';
import authStore from '../store/authStore';

const api = axios.create({
  baseURL: 'https://back-end-projeto-integrador.onrender.com',
});

// Injeta o JWT em cada requisição (quando disponível)
api.interceptors.request.use((config) => {
  const token = authStore.getToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

export default api;
