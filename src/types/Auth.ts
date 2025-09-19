export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    token: string;
    user: AuthUser;
  };
}
