import { api } from './config';
import { Venue, ApiResponse } from '../types/api';

export interface VenueCreate {
  name: string;
  address?: string;
  capacity: number;
}

export const venuesApi = {
  getAll: async (): Promise<Venue[]> => {
    const response = await api.get<ApiResponse<Venue[]>>('/venues');
    return response.data.data;
  },

  getById: async (id: number): Promise<Venue> => {
    const response = await api.get<ApiResponse<Venue>>(`/venues/${id}`);
    return response.data.data;
  },

  create: async (data: VenueCreate): Promise<Venue> => {
    const response = await api.post<ApiResponse<Venue>>('/venues', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<VenueCreate>): Promise<Venue> => {
    const response = await api.put<ApiResponse<Venue>>(`/venues/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },
};