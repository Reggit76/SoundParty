import { api } from './config';
import { Payment, ApiResponse } from '../types/api';

export interface PaymentCreate {
  booking_id: number;
  payment_type: 'банковская карта' | 'наличные' | 'перевод';
  total_amount: number;
  payment_status: 'не оплачено' | 'оплачено' | 'отменено';
  payment_date?: string;
}

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>('/payments');
    return response.data.data;
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  getByBookingId: async (bookingId: number): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(
      `/payments/booking/${bookingId}`
    );
    return response.data.data;
  },

  create: async (data: PaymentCreate): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>('/payments', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<PaymentCreate>): Promise<Payment> => {
    const response = await api.put<ApiResponse<Payment>>(`/payments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
}; 