import axios from 'axios';

const api = axios.create({
  baseURL: 'https://back-end-projeto-integrador.onrender.com',
});

api.interceptors.request.use((config) => {
  return config;
});

export default api;
