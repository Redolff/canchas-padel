import { Booking } from '../models/booking.model';

export interface AvailableSlot {
  start: number;
  end: number;
  duration: number;
  label: string;
}

export const SCHEDULE_DAY_START = 8;
export const SCHEDULE_DAY_END = 24;
export const SCHEDULE_SLOT_DURATION = 1.5;

export function formatScheduleSlot(hour: number): string {
  const totalMinutes = hour * 60;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatScheduleSlotRange(start: number, end: number): string {
  return `${formatScheduleSlot(start)} - ${formatScheduleSlot(end)}`;
}

export function getAvailableSlotsForCourt(bookings: Booking[], courtId: number): AvailableSlot[] {
  const courtBookings = bookings
    .filter(b => b.courtId === courtId)
    .sort((a, b) => a.startHour - b.startHour);

  const slots: AvailableSlot[] = [];
  let current = SCHEDULE_DAY_START;

  const addAvailableStarts = (from: number, to: number) => {
    let start = from;
    while (start + SCHEDULE_SLOT_DURATION <= to) {
      const end = start + SCHEDULE_SLOT_DURATION;
      slots.push({
        start,
        end,
        duration: SCHEDULE_SLOT_DURATION * 60,
        label: formatScheduleSlotRange(start, end),
      });
      start += SCHEDULE_SLOT_DURATION;
    }
  };

  for (const booking of courtBookings) {
    if (booking.startHour > current) {
      addAvailableStarts(current, booking.startHour);
    }
    current = booking.startHour + booking.duration;
  }

  if (current < SCHEDULE_DAY_END) {
    addAvailableStarts(current, SCHEDULE_DAY_END);
  }

  return slots;
}
