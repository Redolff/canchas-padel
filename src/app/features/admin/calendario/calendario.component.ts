import { Component, ElementRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { CourtArtComponent } from '../../../shared/components/court-art/court-art.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { CourtService } from '../../../core/services/court.service';
import { Booking } from '../../../core/models/booking.model';
import {
  AvailableSlot,
  formatScheduleSlotRange,
  getAvailableSlotsForCourt,
} from '../../../core/utils/schedule-availability';

interface CalendarDay {
  day: number;
  iso: string;
  isCurrentMonth: boolean;
}

interface OccupiedSlot {
  id: string;
  label: string;
  clientName: string | null;
  type: Booking['type'];
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, c => c.toUpperCase());
}

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function todayIso(): string {
  return toIso(new Date());
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [TopbarComponent, CourtArtComponent, IconComponent],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss',
})
export class CalendarioComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly courtService = inject(CourtService);
  private readonly router = inject(Router);

  @ViewChild('courtStep') private courtStep?: ElementRef<HTMLElement>;
  @ViewChild('slotsStep') private slotsStep?: ElementRef<HTMLElement>;
  @ViewChild('summaryStep') private summaryStep?: ElementRef<HTMLElement>;

  readonly weekDays = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  readonly selectedDate = signal(todayIso());
  readonly selectedCourtId = signal<number | null>(null);
  readonly viewMonth = signal(new Date(fromIso(todayIso()).getFullYear(), fromIso(todayIso()).getMonth(), 1));

  readonly courts = computed(() => this.courtService.courts().slice(0, 4));
  readonly selectedCourt = computed(() => {
    const courtId = this.selectedCourtId();
    return courtId ? this.courts().find(c => c.id === courtId) ?? null : null;
  });

  readonly monthLabel = computed(() =>
    this.viewMonth().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  );

  readonly selectedDateLabel = computed(() =>
    fromIso(this.selectedDate()).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  );

  readonly topbarSubtitle = computed(() => {
    const court = this.selectedCourt();
    return court
      ? `${this.selectedDateLabel()} · ${this.courtLabel(court.id)}`
      : `${this.selectedDateLabel()} · ${this.courts().length} canchas`;
  });

  readonly calendarDays = computed(() => {
    const base = this.viewMonth();
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const mondayOffset = (first.getDay() + 6) % 7;
    const totalCells = Math.ceil((mondayOffset + last.getDate()) / 7) * 7;
    const days: CalendarDay[] = [];

    for (let index = 0; index < totalCells; index++) {
      const dayNumber = index - mondayOffset + 1;
      if (dayNumber < 1 || dayNumber > last.getDate()) {
        days.push({ day: 0, iso: '', isCurrentMonth: false });
      } else {
        days.push({
          day: dayNumber,
          iso: toIso(new Date(year, month, dayNumber)),
          isCurrentMonth: true,
        });
      }
    }

    return days;
  });

  readonly selectedCourtBookings = computed(() => {
    const courtId = this.selectedCourtId();
    if (!courtId) return [];
    return this.reservationService.schedule()
      .filter(b => b.courtId === courtId)
      .sort((a, b) => a.startHour - b.startHour);
  });

  readonly availableSlots = computed<AvailableSlot[]>(() => {
    const courtId = this.selectedCourtId();
    if (!courtId) return [];
    return getAvailableSlotsForCourt(this.reservationService.schedule(), courtId);
  });

  readonly occupiedSlots = computed<OccupiedSlot[]>(() =>
    this.selectedCourtBookings().map(booking => ({
      id: booking.id,
      label: formatScheduleSlotRange(booking.startHour, booking.startHour + booking.duration),
      clientName: booking.clientName,
      type: booking.type,
    }))
  );

  constructor() {
    effect(() => {
      this.reservationService.loadSchedule(this.selectedDate()).subscribe({ error: () => { } });
    });
  }

  previousMonth(): void {
    const current = this.viewMonth();
    this.viewMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.viewMonth();
    this.viewMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDate.set(day.iso);
    this.scrollTo(this.courtStep);
  }

  selectCourt(courtId: number): void {
    this.selectedCourtId.set(courtId);
    this.scrollTo(this.slotsStep);
    window.setTimeout(() => this.scrollTo(this.summaryStep), 260);
  }

  courtLabel(courtId: number): string {
    const court = this.courts().find(c => c.id === courtId);
    return toTitleCase(court?.name ?? `Cancha ${courtId}`);
  }

  isSelectedDate(day: CalendarDay): boolean {
    return day.iso === this.selectedDate();
  }

  goToSchedule(): void {
    this.router.navigate(['/schedule']);
  }

  private scrollTo(target?: ElementRef<HTMLElement>): void {
    window.setTimeout(() => {
      target?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
}
