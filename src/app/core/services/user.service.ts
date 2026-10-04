import { Injectable, signal } from '@angular/core';

export interface User {
  name: string;
  role: string;
  email: string;
  businessAccountId: number;
  businessName: string;
  defaultSlotPrice: number;
}

const DEFAULT_USER: User = {
  name: '',
  role: '',
  email: '',
  businessAccountId: 0,
  businessName: '',
  defaultSlotPrice: 0,
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _user = signal<User>(this.restoreUser());
  readonly user = this._user.asReadonly();

  setUser(patch: Partial<User>): void {
    this._user.update(u => {
      const next = { ...u, ...patch };
      localStorage.setItem('auth_user', JSON.stringify(next));
      return next;
    });
  }

  signOut(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._user.set(DEFAULT_USER);
  }

  private restoreUser(): User {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) return { ...DEFAULT_USER, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULT_USER;
  }
}
