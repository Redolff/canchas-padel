import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client, ClientPage, ClientPageMeta } from '../models/client.model';
import { Reservation } from '../models/reservation.model';
import { environment } from '../../../environments/environment';

const EMPTY_META: ClientPageMeta = {
  current_page: 1, per_page: 15, total: 0, last_page: 1, from: 0, to: 0,
};

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);

  private readonly _page     = signal<Client[]>([]);
  private readonly _pageMeta = signal<ClientPageMeta>(EMPTY_META);
  private readonly _detail   = signal<{ client: Client; reservations: Reservation[] } | null>(null);
  private readonly _loading  = signal<boolean>(false);

  readonly pageData  = this._page.asReadonly();
  readonly pageMeta  = this._pageMeta.asReadonly();
  readonly detail    = this._detail.asReadonly();
  readonly loading   = this._loading.asReadonly();

  loadPage(params: { page?: number; per_page?: number; search?: string } = {}): Observable<ClientPage> {
    let p = new HttpParams()
      .set('page',     String(params.page     ?? 1))
      .set('per_page', String(params.per_page ?? 15));
    if (params.search) p = p.set('search', params.search);

    this._loading.set(true);
    return this.http.get<ClientPage>(`${environment.apiUrl}/api/clients`, { params: p }).pipe(
      tap(res => {
        this._page.set(res.data);
        this._pageMeta.set(res.meta);
        this._loading.set(false);
      })
    );
  }

  loadDetail(id: number): Observable<{ client: Client; reservations: Reservation[] }> {
    return this.http.get<{ client: Client; reservations: Reservation[] }>(
      `${environment.apiUrl}/api/clients/${id}`
    ).pipe(
      tap(res => this._detail.set(res))
    );
  }

  clearDetail(): void {
    this._detail.set(null);
  }
}
