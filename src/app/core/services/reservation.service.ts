import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Booking } from '../models/booking.model';
import {
  Reservation, ReservationStatus,
  ReservationPage, ReservationPageMeta, ReservationCounts, ReservationLoadParams,
  CreateRecurringPayload, SaveReservationPayload,
} from '../models/reservation.model';
import { environment } from '../../../environments/environment';

// ─── Status style map (shared with component) ─────────────────────
export const STATUS_STYLE: Record<ReservationStatus, { bg: string; fg: string; dot: string }> = {
  paid: { bg: 'rgba(52,211,153,0.12)', fg: 'var(--pc-success)', dot: 'var(--pc-success)' },
  pending: { bg: 'rgba(245,158,11,0.12)', fg: 'var(--pc-warn)', dot: 'var(--pc-warn)' },
  partial: { bg: 'rgba(91,140,255,0.12)', fg: 'var(--pc-info)', dot: 'var(--pc-info)' },
  refunded: { bg: 'rgba(107,124,115,0.12)', fg: 'var(--pc-muted)', dot: 'var(--pc-muted)' },
};

const EMPTY_META: ReservationPageMeta = {
  current_page: 1, per_page: 9, total: 0, last_page: 1, from: 0, to: 0,
};
const EMPTY_COUNTS: ReservationCounts = {
  all: 0, today: 0, paid: 0, pending: 0, refunded: 0,
};

// ─── Service ─────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);

  // Full list — used by ShellComponent pre-load and Dashboard KPIs
  private readonly _reservations = signal<Reservation[]>([]);
  readonly reservations = this._reservations.asReadonly();
  private readonly _reservationsByDate = signal<Reservation[]>([])
  readonly reservationsByDate = this._reservationsByDate.asReadonly()

  // Paginated slice — used exclusively by ReservationsComponent
  private readonly _page = signal<Reservation[]>([]);
  private readonly _pageMeta = signal<ReservationPageMeta>(EMPTY_META);
  private readonly _counts = signal<ReservationCounts>(EMPTY_COUNTS);
  readonly pageData = this._page.asReadonly();
  readonly pageMeta = this._pageMeta.asReadonly();
  readonly counts = this._counts.asReadonly();

  // Date slice — used exclusively by ScheduleComponent
  private readonly _schedule = signal<Reservation[]>([]);
  readonly schedule = this._schedule.asReadonly();

  // Fetches all reservations (flat array) — backward compat for ShellComponent/Dashboard
  load(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${environment.apiUrl}/api/reservations`).pipe(
      tap(data => this._reservations.set(data))
    );
  }

  // Fetches reservations by day (flat array) 
  loadByDate(date: string): Observable<Reservation[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Reservation[]>(`${environment.apiUrl}/api/reservations`, { params })
      .pipe(tap((data: Reservation[]) => this._reservationsByDate.set(data)));
  }

  // Fetches all reservations for a specific date — used by ScheduleComponent
  loadSchedule(date: string): Observable<Reservation[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Reservation[]>(`${environment.apiUrl}/api/reservations`, { params }).pipe(
      tap(data => this._schedule.set(data))
    );
  }

  // Fetches one page with optional filter/search — used by ReservationsComponent
  loadPage(params: ReservationLoadParams = {}): Observable<ReservationPage> {
    let p = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('per_page', String(params.per_page ?? 9));
    if (params.status && params.status !== 'all') p = p.set('status', params.status);
    if (params.search) p = p.set('search', params.search);

    return this.http.get<ReservationPage>(`${environment.apiUrl}/api/reservations`, { params: p }).pipe(
      tap(res => {
        this._page.set(res.data);
        this._pageMeta.set(res.meta);
        this._counts.set(res.counts);
      })
    );
  }

  addReservation(b: SaveReservationPayload): Observable<Reservation> {
    const payload = {
      courtId: b.courtId,
      date: b.date,
      startHour: b.startHour,
      duration: b.duration,
      type: b.type,
      nombre: b.nombre,
      telefono: b.telefono,
      players: b.players,
      total: b.total,
      isOpen: b.type === 'open',
    };
    return this.http.post<Reservation>(`${environment.apiUrl}/api/reservations`, payload).pipe(
      tap(res => this._reservations.update(rs => [res, ...rs]))
    );
  }

  updateReservation(id: string, patch: SaveReservationPayload): Observable<Reservation> {
    return this.http.put<Reservation>(`${environment.apiUrl}/api/reservations/${id}`, { ...patch, isOpen: patch.type === 'open' }).pipe(
      tap(res => this._reservations.update(rs => rs.map(r => r.id === id ? res : r)))
    );
  }

  updateStatus(id: string, status: ReservationStatus): Observable<Reservation> {
    return this.http.patch<Reservation>(`${environment.apiUrl}/api/reservations/${id}/status`, { status }).pipe(
      tap(res => this._reservations.update(rs => rs.map(r => r.id === id ? res : r)))
    );
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/reservations/${id}`).pipe(
      tap(() => this._reservations.update(rs => rs.filter(r => r.id !== id)))
    );
  }

  createRecurring(payload: CreateRecurringPayload): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${environment.apiUrl}/api/recurring-reservations`, payload);
  }

  deleteRecurringSeries(recurringId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/recurring-reservations/${recurringId}`).pipe(
      tap(() => {
        this._reservations.update(rs => rs.filter(r => r.recurringId !== recurringId));
        this._schedule.update(rs => rs.filter(r => r.recurringId !== recurringId));
      })
    );
  }
}
