import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
  user: {
    name: string;
    email: string;
    role: string;
    businessAccountId: number;
    businessName: string;
    defaultSlotPrice: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/login`, { email, password });
  }
}
