import { api } from './config';
import { Team, TeamCreate, ApiResponse } from '../types/api';

export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    const response = await api.get<ApiResponse<Team[]>>('/teams');
    return response.data.data;
  },

  getById: async (id: number): Promise<Team> => {
    const response = await api.get<ApiResponse<Team>>(`/teams/${id}`);
    return response.data.data;
  },

  create: async (data: TeamCreate): Promise<Team> => {
    const response = await api.post<ApiResponse<Team>>('/teams', data);
    return response.data.data;
  },

  update: async (id: number, data: TeamCreate): Promise<Team> => {
    const response = await api.put<ApiResponse<Team>>(`/teams/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },
}; 