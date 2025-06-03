import { api } from './config';
import { Event, ApiResponse } from '../types/api';

export interface EventCreate {
  venue_id: number;
  description: string;
  date: string;
  time: string;
  max_teams: number;
  status: 'анонс' | 'в процессе' | 'завершено';
}

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get<ApiResponse<Event[]>>('/events');
    return response.data.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data.data;
  },

  create: async (data: EventCreate): Promise<Event> => {
    const response = await api.post<ApiResponse<Event>>('/events', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<EventCreate>): Promise<Event> => {
    const response = await api.put<ApiResponse<Event>>(`/events/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
}; 