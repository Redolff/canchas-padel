import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { CourtArtComponent } from '../../../shared/components/court-art/court-art.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BookingModalComponent } from '../../../shared/components/booking-modal/booking-modal.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { CourtService } from '../../../core/services/court.service';
import { UserService } from '../../../core/services/user.service';
import { BOOKING_TYPE_LABELS, Booking, BookingType, BookingVM } from '../../../core/models/booking.model';
import { CreateRecurringPayload, SaveReservationPayload } from '../../../core/models/reservation.model';
import { BookingModalSaveEvent } from '../../../shared/components/booking-modal/booking-modal.component';
import {
  AvailableSlot,
  formatScheduleSlot,
  formatScheduleSlotRange,
  getAvailableSlotsForCourt,
} from '../../../core/utils/schedule-availability';

// ─── Module-level pure helpers ────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function offsetDate(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function calcNowLeft(colW: number): number {
  const now = new Date();
  const mins = (now.getHours() - 8) * 60 + now.getMinutes();
  if (mins < 0 || mins > 14 * 60) return -1;
  return (mins / 60) * colW;
}

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

function bgForType(type: BookingType): string {
  switch (type) {
    case 'private': return 'var(--pc-primary)';
    case 'open': return 'var(--pc-accent)';
    case 'lesson': return '#2a6fb5';
    case 'maintenance': return 'repeating-linear-gradient(45deg,#efece3,#efece3 6px,#e5e2d8 6px,#e5e2d8 12px)';
  }
}

function fgForType(type: BookingType): string {
  switch (type) {
    case 'private': return 'var(--pc-on-primary)';
    case 'open': return 'var(--pc-ink)';
    case 'lesson': return 'var(--pc-on-primary)';
    case 'maintenance': return 'var(--pc-muted)';
  }
}

function playersBadgeBgForType(type: BookingType): string {
  return type === 'open' ? 'rgba(10,31,23,0.18)' : 'rgba(255,255,255,0.15)';
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

function toBookingVM(b: Booking, colW: number): BookingVM {
  const startH = Math.floor(b.startHour);
  const startM = Math.round((b.startHour % 1) * 60);
  const endHour = b.startHour + b.duration;
  const endH = Math.floor(endHour);
  const endM = Math.round((endHour % 1) * 60);
  return {
    ...b,
    leftPx: (b.startHour - 8) * colW + 3,
    widthPx: b.duration * colW - 6,
    bg: bgForType(b.type),
    fg: fgForType(b.type),
    timeLabel: `${pad(startH)}:${pad(startM)}`,
    endTimeLabel: `${pad(endH)}:${pad(endM)}`,
    playersBadgeBg: playersBadgeBgForType(b.type),
  };
}

// ─── Component ────────────────────────────────────────────────────

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [TopbarComponent, CourtArtComponent, IconComponent, BookingModalComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit, OnDestroy {
  readonly reservationService = inject(ReservationService);
  private readonly courtService = inject(CourtService);
  private readonly userService = inject(UserService);
  get courts() { return this.courtService.courts(); }

  constructor() {
    effect(() => {
      this.reservationService.loadSchedule(this.selectedDate())
        .subscribe({ error: () => { } });
    });
  }

  // Layout constants
  readonly COL_W = 70;
  readonly ROW_H = 64;
  readonly LABEL_W = 130;
  readonly hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  // Filter chips
  readonly filterChips = ['Todas las canchas', 'Disponibles'];
  readonly typeLabels = BOOKING_TYPE_LABELS;

  // Mutable state
  selectedDate = signal<string>(todayIso());
  activeFilter = signal<string>('Todas las canchas');
  expandedCourts = signal<Set<number>>(new Set());
  selectedBooking = signal<BookingVM | null>(null);
  showModal = signal<boolean>(false);
  modalPreset = signal<Partial<Booking> | null>(null);
  modalError = signal<string | null>(null);
  readonly defaultSlotPrice = computed(() => this.userService.user().defaultSlotPrice);
  nowLeft = signal<number>(calcNowLeft(this.COL_W));
  expandedAvailableCourts = signal<Set<number>>(new Set());
  private _nowIntervalId = 0;

  // Computed values
  readonly isToday = computed(() => this.selectedDate() === todayIso());

  readonly displayDateLabel = computed(() => formatDateLabel(this.selectedDate()));

  readonly filteredBookings = computed(() =>
    this.reservationService.schedule()
  );

  readonly visibleCourts = computed(() => {
    const filter = this.activeFilter();
    switch (filter) {
      case 'Disponibles': return this.courts.filter(c => this.getAvailableSlots(c.id).length > 0);
      default: return this.courts;
    }
  });

  readonly bookingsVMMap = computed(() => {
    const map = new Map<number, BookingVM[]>();
    for (const b of this.filteredBookings()) {
      const vm = toBookingVM(b, this.COL_W);
      const arr = map.get(b.courtId) ?? [];
      arr.push(vm);
      map.set(b.courtId, arr);
    }
    return map;
  });

  readonly selectedBookingVM = computed(() => this.selectedBooking());

  readonly topbarSubtitle = computed(() => {
    const count = this.visibleCourts().length;
    const total = this.courts.length;
    return `${count} de ${total} canchas mostradas · ${this.displayDateLabel()}`;
  });

  readonly TRACK_W = computed(() => this.hours.length * this.COL_W);

  ngOnInit(): void {
    this._nowIntervalId = window.setInterval(() => {
      this.nowLeft.set(calcNowLeft(this.COL_W));
    }, 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this._nowIntervalId);
  }

  // ─── Date navigation ─────────────────────────────────────────
  goToPrevDay(): void { this.selectedDate.set(offsetDate(this.selectedDate(), -1)); }
  goToNextDay(): void { this.selectedDate.set(offsetDate(this.selectedDate(), +1)); }
  goToToday(): void { this.selectedDate.set(todayIso()); }

  courtLabel(courtId: number): string {
    const court = this.courtService.courts().find(c => c.id === courtId);
    return toTitleCase(court?.name ?? `Cancha ${courtId}`);
  }

  isCourtExpanded(courtId: number): boolean {
    return this.expandedCourts().has(courtId);
  }

  toggleCourt(courtId: number): void {
    this.expandedCourts.update(current => {
      const next = new Set(current);
      if (next.has(courtId)) next.delete(courtId);
      else next.add(courtId);
      return next;
    });
  }

  isAvailableExpanded(courtId: number): boolean {
  return this.expandedAvailableCourts().has(courtId);
}

toggleAvailableSlots(courtId: number): void {
  this.expandedAvailableCourts.update(current => {
    const next = new Set(current);

    if (next.has(courtId)) {
      next.delete(courtId);
    } else {
      next.add(courtId);
    }

    return next;
  });
}

  // ─── Detail panel ────────────────────────────────────────────
  openDetail(b: BookingVM, e: MouseEvent): void {
    e.stopPropagation();
    this.selectedBooking.set(b);
  }

  closeDetail(): void {
    this.selectedBooking.set(null);
  }

  openEditModal(): void {
    this.modalPreset.set({ ...this.selectedBooking()! });
    this.showModal.set(true);
    this.closeDetail();
  }

  deleteSelectedBooking(): void {
    const b = this.selectedBooking();
    if (!b) return;
    this.reservationService.deleteReservation(b.id).subscribe({
      next: () => { this.closeDetail(); this.reloadSchedule(); },
    });
  }

  private reloadSchedule(): void {
    this.reservationService.loadSchedule(this.selectedDate())
      .subscribe({ error: () => { } });
  }

  // ─── Modal ───────────────────────────────────────────────────
  openNewBookingModal(): void {
    this.modalPreset.set({ date: this.selectedDate() });
    this.showModal.set(true);
  }

  openNewBookingFromCell(courtId: number, hourIndex: number): void {
    this.modalPreset.set({
      courtId,
      date: this.selectedDate(),
      startHour: hourIndex + 8,
      duration: 1.5,
      type: 'private',
    });
    this.showModal.set(true);
  }

  openAvailableSlot(
    courtId: number,
    slot: AvailableSlot
  ): void {
    this.modalPreset.set({
      courtId,
      date: this.selectedDate(),
      startHour: slot.start,
      duration: slot.end - slot.start,
      type: 'private',
    });

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.modalPreset.set(null);
    this.modalError.set(null);
  }

  onModalSave(data: BookingModalSaveEvent): void {
    this.modalError.set(null);

    if (data.isRecurring) {
      const payload: CreateRecurringPayload = {
        courtId: data.courtId,
        startDate: data.date,
        endDate: data.endDate,
        startHour: data.startHour,
        duration: data.duration,
        type: data.type,
        nombre: data.nombre,
        telefono: data.telefono,
        players: data.players,
      };
      this.reservationService.createRecurring(payload).subscribe({
        next: () => { this.closeModal(); this.reloadSchedule(); },
        error: (err) => {
          const msgs = err.error?.errors;
          const first = msgs ? Object.values(msgs).flat()[0] as string : null;
          this.modalError.set(first ?? 'No se pudo crear la reserva recurrente.');
        },
      });
      return;
    }

    const payload: SaveReservationPayload = {
      courtId: data.courtId, date: data.date, startHour: data.startHour,
      duration: data.duration, type: data.type, nombre: data.nombre,
      telefono: data.telefono, players: data.players, total: data.total,
    };
    const request$ = data.id
      ? this.reservationService.updateReservation(data.id, payload)
      : this.reservationService.addReservation(payload);

    request$.subscribe({
      next: () => { this.closeModal(); this.reloadSchedule(); },
      error: (err) => {
        if (err.status === 422) {
          const msgs = err.error?.errors;
          const first = msgs ? Object.values(msgs).flat()[0] as string : null;
          this.modalError.set(first ?? 'Conflicto de reserva.');
        } else {
          this.modalError.set('No se pudo guardar. Intenta de nuevo.');
        }
      },
    });
  }

  deleteSelectedSeries(): void {
    const b = this.selectedBooking();
    if (!b?.recurringId) return;
    this.reservationService.deleteRecurringSeries(b.recurringId).subscribe({
      next: () => { this.closeDetail(); this.reloadSchedule(); },
    });
  }

  // ─── Available slot helper ────────────────────────────────────
  private hasAvailableSlot(courtId: number): boolean {
    return this.getAvailableSlots(courtId).length > 0;
  }

  getAvailableSlots(courtId: number): AvailableSlot[] {
    return getAvailableSlotsForCourt(this.filteredBookings(), courtId);
  }

  formatSlot(hour: number): string {
    return formatScheduleSlot(hour);
  }

  formatSlotRange(start: number, end: number): string {
    return formatScheduleSlotRange(start, end);
  }


}
