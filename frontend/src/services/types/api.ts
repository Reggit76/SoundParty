// Common types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

// User types
export interface User {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  role_id: number;
}

// Team types
export interface Team {
  team_id: number;
  name: string;
  rating: number;
}

export interface TeamCreate {
  name: string;
  rating?: number;
}

// Event types
export interface Event {
  event_id: number;
  venue_id: number;
  description: string;
  date: string;
  time: string;
  max_teams: number;
  status: 'анонс' | 'в процессе' | 'завершено';
}

// Venue types
export interface Venue {
  venue_id: number;
  name: string;
  address?: string;
  capacity: number;
}

export interface VenueCreate {
  name: string;
  address?: string;
  capacity: number;
}

// Booking types
export interface Booking {
  booking_id: number;
  event_id: number;
  team_id: number;
  number_of_seats: number;
}

// Payment types
export interface Payment {
  payment_id: number;
  booking_id: number;
  payment_type: 'банковская карта' | 'наличные' | 'перевод';
  total_amount: number;
  payment_status: 'не оплачено' | 'оплачено' | 'отменено';
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

// Event Result types
export interface EventResult {
  result_id: number;
  event_id: number;
  team_id: number;
  score: number;
}

// Participant types
export interface Participant {
  participant_id: number;
  user_id: number;
  team_id: number;
}