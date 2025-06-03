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

  addMember: async (teamId: number, username: string): Promise<Team> => {
    const response = await api.post<ApiResponse<Team>>(`/teams/${teamId}/members`, { username });
    return response.data.data;
  },

  removeMember: async (teamId: number, userId: number): Promise<Team> => {
    const response = await api.delete<ApiResponse<Team>>(`/teams/${teamId}/members/${userId}`);
    return response.data.data;
  },
}; 