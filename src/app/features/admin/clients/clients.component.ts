import { Component, computed, effect, inject, signal } from '@angular/core';
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ClientService } from '../../../core/services/client.service';
import { CourtService } from '../../../core/services/court.service';
import { Client } from '../../../core/models/client.model';
import { Reservation, RESERVATION_STATUS_LABELS, ReservationStatus } from '../../../core/models/reservation.model';
import { STATUS_STYLE } from '../../../core/services/reservation.service';

// ─── Module-level pure helpers ────────────────────────────────────

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

function formatWhenLabel(date: string, startHour: number): string {
  const d = new Date(date + 'T12:00:00');
  const dow = d.toLocaleDateString('es-AR', { weekday: 'short' });
  const day = d.getDate();
  const month = d.toLocaleDateString('es-AR', { month: 'short' });
  const h = Math.floor(startHour);
  const m = Math.round((startHour % 1) * 60);
  return `${dow} ${day} ${month} · ${pad(h)}:${pad(m)}`;
}

function formatTotal(n: number): string {
  return '$' + n.toLocaleString('es-AR');
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

function buildPageNumbers(cur: number, total: number): (number | '…')[] {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 2) return [1, 2, 3];
  if (cur >= total - 1) return [total - 2, total - 1, total];
  return [cur - 1, cur, cur + 1];
}

function displayName(c: Client): string {
  return c.apellido ? `${c.nombre} ${c.apellido}` : c.nombre;
}

// ─── View-model ───────────────────────────────────────────────────

interface ClientVM extends Client {
  displayName: string;
}

interface ReservationRow {
  bookingRef: string;
  whenLabel: string;
  courtName: string;
  totalLabel: string;
  status: ReservationStatus;
  statusStyle: { bg: string; fg: string; dot: string };
}

// ─── Component ────────────────────────────────────────────────────

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [TopbarComponent, AvatarComponent, IconComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent {
  readonly clientService = inject(ClientService);
  private readonly courtService = inject(CourtService);

  readonly PAGE_SIZE = 15;
  readonly statusLabels = RESERVATION_STATUS_LABELS;

  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  selectedClient = signal<ClientVM | null>(null);

  private _debounce = 0;

  constructor() {
    effect(() => {
      const search = this.searchQuery();
      const page = this.currentPage();

      clearTimeout(this._debounce);
      this._debounce = window.setTimeout(() => {
        this.clientService.loadPage({ page, per_page: this.PAGE_SIZE, search })
          .subscribe({ error: () => { } });
      }, 200);
    });
  }

  readonly rows = computed((): ClientVM[] =>
    //this.clientService.pageData().map(c => ({ ...c, displayName: displayName(c) }))
    [...this.clientService.pageData()]
      .sort((a, b) => b.reservationsCount - a.reservationsCount)
      .map(c => ({
        ...c,
        displayName: displayName(c)
      }))
  );

  readonly totalPages = computed(() => this.clientService.pageMeta().last_page);
  readonly pageNumbers = computed(() => buildPageNumbers(this.currentPage(), this.totalPages()));

  readonly showingInfo = computed(() => {
    const m = this.clientService.pageMeta();
    if (m.total === 0) return 'Sin clientes';
    return `Mostrando ${m.from}–${m.to} de ${m.total}`;
  });

  readonly detailReservations = computed((): ReservationRow[] => {
    const d = this.clientService.detail();
    if (!d) return [];
    const courts = this.courtService.courts();
    return d.reservations.map((r: Reservation) => ({
      bookingRef: r.bookingRef,
      whenLabel: formatWhenLabel(r.date, r.startHour),
      courtName: toTitleCase(courts.find(c => c.id === r.courtId)?.name ?? `Cancha ${r.courtId}`),
      totalLabel: formatTotal(r.total),
      status: r.status,
      statusStyle: STATUS_STYLE[r.status],
    }));
  });

  // ─── Events ──────────────────────────────────────────────────────

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  openDetail(client: ClientVM): void {
    this.selectedClient.set(client);
    this.clientService.loadDetail(client.id).subscribe({ error: () => { } });
  }

  closeDetail(): void {
    this.selectedClient.set(null);
    this.clientService.clearDetail();
  }

  goToPage(p: number): void {
    if (p === this.currentPage()) return;
    this.currentPage.set(p);
  }
}
