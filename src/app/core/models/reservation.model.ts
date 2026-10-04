import { Booking, BookingType } from './booking.model';
import { CourtSurface } from './court.model';

export type ReservationStatus = 'paid' | 'pending' | 'partial' | 'refunded';

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  paid:     'Pagado',
  pending:  'Pendiente',
  partial:  'Parcial',
  refunded: 'Reembolsado',
};

export interface Reservation extends Booking {
  bookingRef: string;
  clientId: number | null;
  clientPhone: string | null;
  total: number;
  status: ReservationStatus;
  isOpen?: boolean;
  recurringId?: number | null;
}

export interface ReservationVM extends Reservation {
  courtSurface: CourtSurface;
  courtName: string;
  whenLabel: string;
  totalLabel: string;
  playersLabel: string;
  statusStyle: { bg: string; fg: string; dot: string };
}

export interface ReservationCounts {
  all: number;
  today: number;
  paid: number;
  pending: number;
  refunded: number;
}

export interface ReservationPageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ReservationPage {
  data: Reservation[];
  meta: ReservationPageMeta;
  counts: ReservationCounts;
}

export interface ReservationLoadParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export interface SaveReservationPayload {
  courtId: number;
  date: string;
  startHour: number;
  duration: number;
  type: BookingType;
  nombre: string;
  telefono: string;
  players: number;
  total: number;
}

export interface CreateRecurringPayload {
  courtId: number;
  startDate: string;
  endDate?: string;
  startHour: number;
  duration: number;
  type: BookingType;
  nombre: string;
  telefono: string;
  players: number;
}
