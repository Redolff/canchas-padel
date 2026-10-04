import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Court } from '../models/court.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourtService {
  private readonly http = inject(HttpClient);
  private readonly _courts = signal<Court[]>([]);
  readonly courts = this._courts.asReadonly();

  load(): Observable<Court[]> {
    return this.http.get<Court[]>(`${environment.apiUrl}/api/courts`).pipe(
      tap(courts => this._courts.set(courts))
    );
  }
}
