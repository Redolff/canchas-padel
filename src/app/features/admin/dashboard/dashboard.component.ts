import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { CourtMiniComponent } from '../../../shared/components/court-mini/court-mini.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CourtArtComponent } from '../../../shared/components/court-art/court-art.component';
import { BookingModalComponent } from '../../../shared/components/booking-modal/booking-modal.component';
import { ReservationDetailComponent } from '../../../shared/components/reservation-detail/reservation-detail.component';
import { ReservationService, STATUS_STYLE } from '../../../core/services/reservation.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CourtService } from '../../../core/services/court.service';
import { UserService } from '../../../core/services/user.service';
import { Booking, BookingType, BOOKING_TYPE_LABELS } from '../../../core/models/booking.model';
import { BookingModalSaveEvent } from '../../../shared/components/booking-modal/booking-modal.component';
import { RESERVATION_STATUS_LABELS, ReservationStatus, ReservationVM, SaveReservationPayload } from '../../../core/models/reservation.model';
import { CourtSurface } from '../../../core/models/court.model';

// ─── Module-level pure helpers ────────────────────────────────────

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

function formatTime(startHour: number): string {
  return `${pad(Math.floor(startHour))}:${pad((startHour % 1) * 60)}`;
}

function formatEndTime(startHour: number, duration: number): string {
  const endHour = startHour + duration;
  return `${pad(Math.floor(endHour))}:${pad((endHour % 1) * 60)}`;
}

function formatTotal(n: number): string {
  return '$' + n.toLocaleString('es-AR');
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

function formatWhenLabel(date: string, startHour: number): string {
  const d = new Date(date + 'T12:00:00');
  const dow = d.toLocaleDateString('es-AR', { weekday: 'short' });
  const day = d.getDate();
  const h = Math.floor(startHour);
  const m = Math.round((startHour % 1) * 60);
  return `${dow} ${day} · ${pad(h)}:${pad(m)}`;
}

function formatSubtitle(): string {
  const now = new Date();
  const datePart = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${datePart} · ${pad(now.getHours())}:${pad(now.getMinutes())} ART`;
}

function formatDelta(n: number): string {
  if (n === 0) return 'igual que ayer';
  return n > 0 ? `+${n}` : String(n);
}

function formatRevenueDelta(n: number): string {
  if (n === 0) return 'igual que ayer';
  return (n > 0 ? '+' : '') + formatTotal(n);
}

function formatOccDelta(n: number): string {
  if (n === 0) return 'sin cambio';
  return n > 0 ? `+${n} pts` : `${n} pts`;
}

// ─── View-model types ─────────────────────────────────────────────

interface KpiTile {
  label: string;
  value: string;
  delta: string;
  deltaPos: boolean;
  sub: string;
  special?: boolean;
}

interface UpcomingRow {
  id: string;
  timeLabel: string;
  endTimeLabel: string;
  courtName: string;
  clientName: string | null;
  clientPhone: string | null;
  players: number;
  status: ReservationStatus;
  needsPlayer: boolean;
  courtId: number;
  date: string;
  startHour: number;
  duration: number;
  type: BookingType;
  total: number;
}

// ─── Component ────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TopbarComponent, CourtMiniComponent, AvatarComponent, IconComponent, CourtArtComponent, BookingModalComponent, ReservationDetailComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly reservationService = inject(ReservationService);
  private readonly dashboardService = inject(DashboardService);
  private readonly courtService = inject(CourtService);
  readonly userService = inject(UserService);
  get courts() { return this.courtService.courts(); }
  readonly bookings = this.reservationService.reservations;
  readonly statusLabels = RESERVATION_STATUS_LABELS;
  readonly bookingTypeLabels = BOOKING_TYPE_LABELS;
  getTypeClass(type: BookingType): string {
    return `booking-type--${type}`;
  }

  // Live subtitle
  subtitle = signal<string>(formatSubtitle());
  private _subtitleInterval = 0;

  // Modal state
  showModal = signal<boolean>(false);
  modalPreset = signal<(Partial<Booking> & { clientPhone?: string | null; total?: number }) | null>(null);
  modalError = signal<string | null>(null);
  readonly defaultSlotPrice = computed(() => this.userService.user().defaultSlotPrice);

  // KPI tiles from dashboard API
  readonly kpis = computed((): KpiTile[] => {
    const s = this.dashboardService.stats();
    if (!s) return [];
    const courtsCount = this.courts.length;
    return [
      { label: 'Reservas hoy', value: String(s.todayBookings), delta: formatDelta(s.bookingsDelta), deltaPos: s.bookingsDelta >= 0, sub: `${courtsCount} canchas activas`, special: true },
      { label: 'Ingresos hoy', value: formatTotal(s.todayRevenue), delta: formatRevenueDelta(s.revenueDelta), deltaPos: s.revenueDelta >= 0, sub: 'pagado · parcial' },
      { label: 'Ocupación', value: `${s.occupancy}%`, delta: formatOccDelta(s.occupancyDelta), deltaPos: s.occupancyDelta >= 0, sub: `${courtsCount} canchas` },
      { label: 'Miembros activos', value: String(s.activeMembers), delta: formatDelta(s.membersDelta), deltaPos: s.membersDelta >= 0, sub: 'último mes' },
    ];
  });

  // Upcoming rows from dashboard API
  readonly upcoming = computed((): UpcomingRow[] => {
    const s = this.dashboardService.stats();
    if (!s) return [];
    const courts = this.courtService.courts();
    return s.upcoming.map(r => ({
      id: r.id,
      timeLabel: formatTime(r.startHour),
      endTimeLabel: formatEndTime(r.startHour, r.duration),
      courtName: toTitleCase(courts.find(c => c.id === r.courtId)?.name ?? `Cancha ${r.courtId}`),
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      players: r.players,
      status: r.status,
      needsPlayer: r.isOpen === true && r.players < 4,
      courtId: r.courtId,
      date: r.date,
      startHour: r.startHour,
      duration: r.duration,
      type: r.type,
      total: r.total,
    }));
  });

  // ─── Detail panel ─────────────────────────────────────────────
  selectedRow = signal<UpcomingRow | null>(null);

  readonly selectedRowVM = computed((): ReservationVM | null => {
    const row = this.selectedRow();
    if (!row) return null;
    const court = this.courts.find(c => c.id === row.courtId);
    return {
      id: row.id,
      bookingRef: row.id,
      courtId: row.courtId,
      date: row.date,
      startHour: row.startHour,
      duration: row.duration,
      type: row.type,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      clientId: null,
      players: row.players,
      total: row.total,
      status: row.status,
      isOpen: row.needsPlayer,
      recurringId: null,
      courtSurface: court?.surface ?? ('synthetic' as CourtSurface),
      courtName: row.courtName,
      whenLabel: formatWhenLabel(row.date, row.startHour),
      totalLabel: formatTotal(row.total),
      playersLabel: row.type === 'maintenance' ? '—' : `${row.players}/4`,
      statusStyle: STATUS_STYLE[row.status],
    };
  });

  // ─── Mobile Today signals ──────────────────────────────────────
  readonly todayRows = computed(() => this.upcoming());

  readonly pendingCount = computed(() => {
    const s = this.dashboardService.stats();
    if (!s) return 0;
    return s.upcoming.filter(r => r.status === 'pending' || r.status === 'partial').length;
  });

  readonly mobileDateLabel = computed(() => {
    const parts = this.subtitle().split(' · ');
    return parts[0] ?? '';
  });

  ngOnInit(): void {
    this.dashboardService.load().subscribe();
    //this.reservationService.load().suscribe();
    this._subtitleInterval = window.setInterval(() => {
      this.subtitle.set(formatSubtitle());
    }, 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this._subtitleInterval);
  }

  openDetail(row: UpcomingRow): void {
    this.selectedRow.set(row);
  }

  closeDetail(): void {
    this.selectedRow.set(null);
  }

  openEditFromDetail(): void {
    const row = this.selectedRow();
    if (!row) return;
    this.closeDetail();
    this.openEditModal(row);
  }

  markAsPaid(): void {
    this.changeStatus('paid');
  }

  markAsRefunded(): void {
    this.changeStatus('refunded');
  }

  deleteReservation(): void {
    const reservation = this.selectedRowVM();
    if (!reservation) return;
    this.reservationService.deleteReservation(reservation.id).subscribe({
      next: () => {
        this.closeDetail();
        this.dashboardService.load().subscribe();
        this.reservationService.load().subscribe();
      },
    });
  }

  private changeStatus(status: ReservationStatus): void {
    const reservation = this.selectedRowVM();

    if (!reservation) return;

    this.reservationService
      .updateStatus(reservation.id, status)
      .subscribe({
        next: () => {
          this.closeDetail();

          this.dashboardService.load().subscribe();

          // opcional si usás reservas en otros lugares
          this.reservationService.load().subscribe();
        },
      });
  }

  // ─── Modal ───────────────────────────────────────────────────
  openNewBookingModal(): void {
    this.modalPreset.set(null);
    this.showModal.set(true);
  }

  openEditModal(row: UpcomingRow): void {
    this.modalPreset.set({
      id: row.id,
      courtId: row.courtId,
      date: row.date,
      startHour: row.startHour,
      duration: row.duration,
      type: row.type,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      players: row.players,
      total: row.total,
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
    const payload: SaveReservationPayload = {
      courtId: data.courtId, date: data.date, startHour: data.startHour,
      duration: data.duration, type: data.type, nombre: data.nombre,
      telefono: data.telefono, players: data.players, total: data.total,
    };
    const request$ = data.id
      ? this.reservationService.updateReservation(data.id, payload)
      : this.reservationService.addReservation(payload);

    request$.subscribe({
      next: () => {
        this.closeModal();
        this.dashboardService.load().subscribe();
      },
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
}
