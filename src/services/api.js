import axios from 'axios';
import authStore from '../store/authStore';

const api = axios.create({
  baseURL: 'https://back-end-projeto-integrador.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = authStore.getToken();
  console.log('TOKEN ENVIADO:', token); // ← linha de debug
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;