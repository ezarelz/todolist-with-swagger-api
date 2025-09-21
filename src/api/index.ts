// src/api/index.ts
import axios from 'axios';
import { APIConfiguration } from '../config/api.config';

export const customAxios = axios.create({
  baseURL: APIConfiguration.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

//  Inject Bearer Token
customAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Handle 401 → Clear storage + optional redirect
customAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user'); // authorisasi cek ke API menambah dan/atau clr storage
      if (location.pathname !== '/login') {
        // redirect opsional
        // window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
