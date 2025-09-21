// src/services/auth.service.ts
import { customAxios } from '../api';
import type { LoginResponse } from '../types/Auth';

/**
 * Login user dengan email & password.
 * parameter payload - object berisi email & password
 * funct returns LoginResponse (token + user)
 */
export const login = async (payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const { data } = await customAxios.post<LoginResponse>(
    '/auth/login',
    payload
  );
  return data;
};

/**
 * Register user baru.
 // param payload - object berisi name, email, password
 * param returns pesan dari server (tidak selalu token)
 */
export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ message?: string }> => {
  const { data } = await customAxios.post('/auth/register', payload);
  return data;
};
