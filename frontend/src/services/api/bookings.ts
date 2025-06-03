import { api } from './config';
import { Booking, ApiResponse } from '../types/api';

export interface BookingCreate {
  event_id: number;
  team_id: number;
  number_of_seats: number;
}

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings');
    return response.data.data;
  },

  getById: async (id: number): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data;
  },

  getByEventId: async (eventId: number): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>(
      `/bookings/event/${eventId}`
    );
    return response.data.data;
  },

  getByTeamId: async (teamId: number): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>(
      `/bookings/team/${teamId}`
    );
    return response.data.data;
  },

  create: async (data: BookingCreate): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<BookingCreate>): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },
}; 