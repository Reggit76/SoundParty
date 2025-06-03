import { api } from './config';
import { EventResult, ApiResponse } from '../types/api';

export interface EventResultCreate {
  event_id: number;
  team_id: number;
  score: number;
}

export const eventResultsApi = {
  getAll: async (): Promise<EventResult[]> => {
    const response = await api.get<ApiResponse<EventResult[]>>('/event-results');
    return response.data.data;
  },

  getByEventId: async (eventId: number): Promise<EventResult[]> => {
    const response = await api.get<ApiResponse<EventResult[]>>(
      `/event-results/event/${eventId}`
    );
    return response.data.data;
  },

  getByTeamId: async (teamId: number): Promise<EventResult[]> => {
    const response = await api.get<ApiResponse<EventResult[]>>(
      `/event-results/team/${teamId}`
    );
    return response.data.data;
  },

  create: async (data: EventResultCreate): Promise<EventResult> => {
    const response = await api.post<ApiResponse<EventResult>>('/event-results', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<EventResultCreate>): Promise<EventResult> => {
    const response = await api.put<ApiResponse<EventResult>>(
      `/event-results/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/event-results/${id}`);
  },
}; 