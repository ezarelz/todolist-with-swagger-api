// src/services/auth.service.ts
import { customAxios } from '../api';

/** ===== Types ===== */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Response dari /auth/login sesuai backend kamu */
export interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message?: string;
  statusCode?: number;
}

/**
 * 🔐 Login user (email + password)
 * @param payload - { email, password }
 * @returns LoginResponse (message + user + token)
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await customAxios.post<LoginResponse>(
    '/auth/login',
    payload
  );

  // ✅ Simpan data user & token di localStorage agar bisa ditampilkan di TopBar
  localStorage.setItem(
    'auth_user',
    JSON.stringify({
      user: data.user,
      token: data.token,
    })
  );

  return data;
};

/**
 * 🧾 Register user baru
 * @param payload - { name, email, password, confirmPassword }
 * @returns Response message dari server
 */
export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const { data } = await customAxios.post<RegisterResponse>(
    '/auth/register',
    payload
  );
  return data;
};
