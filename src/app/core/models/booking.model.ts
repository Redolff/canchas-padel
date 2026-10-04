export type BookingType = 'private' | 'open' | 'lesson' | 'maintenance';

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  private:     'Privada',
  open:        'Abierta',
  lesson:      'Clase',
  maintenance: 'Mantenimiento',
};

export interface Booking {
  id: string;
  courtId: number;
  date: string;        // 'YYYY-MM-DD'
  startHour: number;   // decimal hours from 08:00 (0=08:00, 1.5=09:30)
  duration: number;    // hours: 0.5 | 1.0 | 1.5 | 2.0
  type: BookingType;
  clientName: string | null;
  players: number;     // 0 for maintenance
}

export interface BookingVM extends Booking {
  leftPx: number;
  widthPx: number;
  bg: string;
  fg: string;
  timeLabel: string;
  endTimeLabel: string;
  playersBadgeBg: string;
  recurringId?: number | null;
}
