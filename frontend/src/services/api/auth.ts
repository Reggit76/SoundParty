import { api } from './config';
import { AuthResponse, ApiResponse } from '../types/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  email: string;
  password: string;
  confirm_password: string;
  role_id?: number;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<any> => {
    const response = await api.post('/register', {
      ...data,
      role_id: data.role_id || 3 // По умолчанию обычный пользователь
    });
    return response.data;
  },
};