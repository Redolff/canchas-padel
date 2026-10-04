import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../models/dashboard-stats.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly _stats = signal<DashboardStats | null>(null);
  readonly stats = this._stats.asReadonly();

  load(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/api/dashboard`).pipe(
      tap(s => this._stats.set(s))
    );
  }
}
