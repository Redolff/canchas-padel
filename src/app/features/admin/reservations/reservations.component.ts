import { Component, computed, effect, inject, signal } from '@angular/core';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { CourtArtComponent } from '../../../shared/components/court-art/court-art.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BookingModalComponent } from '../../../shared/components/booking-modal/booking-modal.component';
import { ReservationDetailComponent } from '../../../shared/components/reservation-detail/reservation-detail.component';
import { ReservationService, STATUS_STYLE } from '../../../core/services/reservation.service';
import { CourtService } from '../../../core/services/court.service';
import { Booking, BookingType, BOOKING_TYPE_LABELS } from '../../../core/models/booking.model';
import { BookingModalSaveEvent } from '../../../shared/components/booking-modal/booking-modal.component';
import { RESERVATION_STATUS_LABELS, Reservation, ReservationStatus, ReservationVM, SaveReservationPayload } from '../../../core/models/reservation.model';
import { Court } from '../../../core/models/court.model';
import { UserService } from '../../../core/services/user.service';

// ─── Module-level pure helpers ────────────────────────────────────

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

function formatEndTime(startHour: number, duration: number): string {
  const endHour = startHour + duration;
  return `${pad(Math.floor(endHour))}:${pad((endHour % 1) * 60)}`;
}

function formatStartTime(startHour: number): string {
  return `${pad(Math.floor(startHour))}:${pad((startHour % 1) * 60)}`;
}

function formatDateGroupLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().slice(0, 10);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  if (dateStr === todayStr) return 'Hoy';
  if (dateStr === tomorrowStr) return 'Mañana';

  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatWhenLabel(date: string, startHour: number): string {
  const d = new Date(date + 'T12:00:00');
  const dow = d.toLocaleDateString('es-AR', { weekday: 'short' });
  const day = d.getDate();
  const h = Math.floor(startHour);
  const m = Math.round((startHour % 1) * 60);
  return `${dow} ${day} · ${pad(h)}:${pad(m)}`;
}

function formatTotal(n: number): string {
  return '$' + n.toLocaleString('es-AR');
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

function toReservationVM(r: Reservation, courts: Court[]): ReservationVM {
  const court = courts.find(c => c.id === r.courtId) ?? courts[0];
  return {
    ...r,
    courtSurface: court.surface,
    courtName: toTitleCase(court.name),
    whenLabel: formatWhenLabel(r.date, r.startHour),
    totalLabel: formatTotal(r.total),
    playersLabel: r.type === 'maintenance' ? '—' : `${r.players}/4`,
    statusStyle: STATUS_STYLE[r.status],
  };
}

function buildPageNumbers(cur: number, total: number): (number | '…')[] {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 2) return [1, 2, 3];
  if (cur >= total - 1) return [total - 2, total - 1, total];
  return [cur - 1, cur, cur + 1];
}

// ─── Component ────────────────────────────────────────────────────

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [TopbarComponent, CourtArtComponent, AvatarComponent, IconComponent, BookingModalComponent, ReservationDetailComponent],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent {
  readonly reservationService = inject(ReservationService);
  private readonly courtService = inject(CourtService);
  private readonly userService = inject(UserService);
  get courts() { return this.courtService.courts(); }

  readonly PAGE_SIZE = 9;
  readonly statusLabels = RESERVATION_STATUS_LABELS;
  readonly bookingTypeLabels = BOOKING_TYPE_LABELS;
  getTypeClass(type: BookingType): string {
    return `booking-type--${type}`;
  }

  // Mutable state
  activeTab = signal<string>('all');
  currentPage = signal<number>(1);
  searchQuery = signal<string>('');
  selectedRes = signal<ReservationVM | null>(null);
  showModal = signal<boolean>(false);
  modalPreset = signal<(Partial<Booking> & { clientPhone?: string | null; total?: number }) | null>(null);
  modalError = signal<string | null>(null);
  readonly defaultSlotPrice = computed(() => this.userService.user().defaultSlotPrice);
  private _debounce = 0;

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      const page = this.currentPage();
      const search = this.searchQuery();

      clearTimeout(this._debounce);
      this._debounce = window.setTimeout(() => {
        this.reservationService.loadPage({
          page,
          per_page: this.PAGE_SIZE,
          status: tab,
          search,
        }).subscribe({ error: () => { } });
      }, 200);
    });
  }

  // Derived from service paginated signals
  readonly rows = computed((): ReservationVM[] =>
    this.reservationService.pageData().map(r => toReservationVM(r, this.courts))
  );

  readonly filterTabs = computed(() => {
    const c = this.reservationService.counts();
    return [
      { label: 'Todos', count: c.all, key: 'all' },
      { label: 'Hoy', count: c.today, key: 'today' },
      { label: 'Pagado', count: c.paid, key: 'paid' },
      { label: 'Pendiente', count: c.pending, key: 'pending' },
      { label: 'Reembolsado', count: c.refunded, key: 'refunded' },
    ];
  });

  readonly totalPages = computed(() =>
    Math.max(1, this.reservationService.pageMeta().last_page)
  );

  readonly pageNumbers = computed(() =>
    buildPageNumbers(this.currentPage(), this.totalPages())
  );

  readonly showingInfo = computed(() => {
    const m = this.reservationService.pageMeta();
    if (m.total === 0) return 'Sin reservas';
    return `Mostrando ${m.from}–${m.to} de ${m.total}`;
  });

  readonly topbarSubtitle = computed(() => {
    const m = this.reservationService.pageMeta();
    return `${m.total} reservas · ${this.showingInfo()}`;
  });

  // ─── Mobile computed ─────────────────────────────────────────
  readonly groupedMobileRows = computed(() => {
    const groups = new Map<string, ReservationVM[]>();
    for (const r of this.rows()) {
      const list = groups.get(r.date) ?? [];
      list.push(r);
      groups.set(r.date, list);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        const today = todayIso();
        if (a === today) return -1;
        if (b === today) return 1;
        const aFuture = a > today;
        const bFuture = b > today;
        if (aFuture && !bFuture) return -1;
        if (!aFuture && bFuture) return 1;
        if (aFuture && bFuture) return a.localeCompare(b);
        return b.localeCompare(a);
      })
      .map(([date, rows]) => ({ label: formatDateGroupLabel(date), rows }));
  });

  mobileStartTime(r: ReservationVM): string {
    return formatStartTime(r.startHour);
  }

  mobileEndTime(r: ReservationVM): string {
    return formatEndTime(r.startHour, r.duration);
  }

  // ─── Filtering / search ──────────────────────────────────────
  setTab(key: string): void {
    this.activeTab.set(key);
    this.currentPage.set(1);
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  // ─── Detail panel ────────────────────────────────────────────
  openDetail(r: ReservationVM, e: MouseEvent): void {
    e.stopPropagation();
    this.selectedRes.set(r);
  }

  closeDetail(): void {
    this.selectedRes.set(null);
  }

  // ─── Reload helper (bypasses debounce) ───────────────────────
  private reload(): void {
    this.reservationService.loadPage({
      page: this.currentPage(),
      per_page: this.PAGE_SIZE,
      status: this.activeTab(),
      search: this.searchQuery(),
    }).subscribe({ error: () => { } });
  }

  // ─── Status quick-actions ────────────────────────────────────
  markAsPaid(): void { this.changeStatus('paid'); }
  markAsRefunded(): void { this.changeStatus('refunded'); }

  private changeStatus(s: ReservationStatus): void {
    const r = this.selectedRes();
    if (!r) return;
    this.reservationService.updateStatus(r.id, s).subscribe({
      next: () => {
        this.closeDetail();
        this.reload();
      },
    });
  }

  // ─── Delete ──────────────────────────────────────────────────
  deleteSelectedSeries(): void {
    const r = this.selectedRes();
    if (!r?.recurringId) return;
    this.reservationService.deleteRecurringSeries(r.recurringId).subscribe({
      next: () => { this.closeDetail(); this.reload(); },
    });
  }

  deleteSelectedReservation(): void {
    const r = this.selectedRes();
    if (!r) return;
    const wasLastOnPage =
      this.reservationService.pageData().length === 1 && this.currentPage() > 1;
    this.reservationService.deleteReservation(r.id).subscribe({
      next: () => {
        this.closeDetail();
        if (wasLastOnPage) {
          this.currentPage.set(this.currentPage() - 1); // effect triggers reload
        } else {
          this.reload();
        }
      },
    });
  }

  // ─── Modal ───────────────────────────────────────────────────
  openNewReservationModal(): void {
    this.modalPreset.set(null);
    this.showModal.set(true);
  }

  openEditModal(): void {
    const r = this.selectedRes();
    if (!r) return;
    this.modalPreset.set({
      id: r.id,
      courtId: r.courtId,
      date: r.date,
      startHour: r.startHour,
      duration: r.duration,
      type: r.type,
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      players: r.players,
      total: r.total,
    });
    this.showModal.set(true);
    this.closeDetail();
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
        this.reload();
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
