export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'tecnico' | 'supervisor' | 'operador';
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
