import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (moreOpen()) {
      <div class="mn-backdrop" (click)="moreOpen.set(false)"></div>
      <div class="mn-popup">
        <div class="mn-popup__email">{{ userService.user().email }}</div>
        <div class="mn-popup__divider"></div>
        <div class="mn-popup__section">
          <a
            class="mn-popup__item"
            routerLink="/calendario"
            (click)="moreOpen.set(false)"
          >
            Calendario
          </a>
          <a
            class="mn-popup__item"
            routerLink="/clients"
            (click)="moreOpen.set(false)"
          >
            Clientes
          </a>
<!--          <button class="mn-popup__item mn-popup__item&#45;&#45;disabled" type="button" disabled>-->
<!--            Precios <span>Proximamente</span>-->
<!--          </button>-->
<!--          <button class="mn-popup__item mn-popup__item&#45;&#45;disabled" type="button" disabled>-->
<!--            Analiticas <span>Proximamente</span>-->
<!--          </button>-->
<!--          <button class="mn-popup__item mn-popup__item&#45;&#45;disabled" type="button" disabled>-->
<!--            Notificaciones <span>Proximamente</span>-->
<!--          </button>-->
        </div>
        <div class="mn-popup__divider"></div>
        <button class="mn-popup__item" (click)="signOut()">Cerrar sesion</button>
      </div>
    }

    <nav class="mn-nav">
      <a class="mn-item"
         routerLink="/dashboard"
         routerLinkActive="mn-item--active"
         [routerLinkActiveOptions]="{ exact: true }">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12L12 4l9 8M5 11v8h5v-5h4v5h5v-8"/>
        </svg>
        <span>Inicio</span>
      </a>

      <a class="mn-item"
         routerLink="/schedule"
         routerLinkActive="mn-item--active">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <span>Horario</span>
      </a>

      <button class="mn-item mn-item--fab" type="button" (click)="newBooking.emit()">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <circle cx="19" cy="19" r="19" fill="var(--pc-primary)"/>
          <path d="M19 11v16M11 19h16" stroke="var(--pc-accent)" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
        <span>Crear</span>
      </button>

      <a class="mn-item"
         routerLink="/reservations"
         routerLinkActive="mn-item--active">
        <svg width="19" height="19" viewBox="0 0 22 22" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="3" width="14" height="16" rx="2"/>
          <path d="M8 8h6M8 11h6M8 14h4"/>
        </svg>
        <span>Reservas</span>
      </a>

      <button class="mn-item" type="button" [class.mn-item--more-open]="moreOpen()" (click)="toggleMore()">
        <svg width="19" height="19" viewBox="0 0 22 22" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="M3 6h16M3 11h16M3 16h10"/>
        </svg>
        <span>Menu</span>
      </button>
    </nav>
  `,
  styles: [`
    :host { display: block; }

    .mn-nav {
      position: fixed;
      bottom: 20px;
      left: 14px;
      right: 14px;
      z-index: 50;
      background: var(--pc-card);
      border-radius: var(--pc-r-pill);
      box-shadow: var(--pc-shadow-lg);
      border: 1px solid var(--pc-line);
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    .mn-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 10px;
      border-radius: var(--pc-r-pill);
      color: var(--pc-muted);
      text-decoration: none;
      font-size: 10px;
      font-weight: 500;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.1s, color 0.1s;
      min-width: 54px;
      justify-content: center;
    }

    .mn-item--active {
      background: var(--pc-primary);
      color: var(--pc-on-primary);
    }

    .mn-item--fab {
      padding: 4px 6px;
      background: transparent;
      color: var(--pc-muted);
      min-width: 60px;
    }

    .mn-item--more-open {
      background: var(--pc-line-2);
      color: var(--pc-ink);
    }

    .mn-backdrop {
      position: fixed;
      inset: 0;
      z-index: 49;
    }

    .mn-popup {
      position: fixed;
      bottom: 88px;
      right: 14px;
      z-index: 51;
      background: var(--pc-card);
      border: 1px solid var(--pc-line);
      border-radius: 14px;
      padding: 6px;
      box-shadow: var(--pc-shadow-lg);
      min-width: 230px;
    }

    .mn-popup__email {
      font-size: 11px;
      color: var(--pc-muted);
      padding: 6px 10px 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mn-popup__divider {
      height: 1px;
      background: var(--pc-line);
      margin: 4px 0;
    }

    .mn-popup__section {
      display: grid;
      gap: 2px;
    }

    .mn-popup__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border-radius: 9px;
      border: none;
      background: none;
      color: var(--pc-ink-2);
      font-family: inherit;
      font-size: 13px;
      text-align: left;
      cursor: pointer;
    }

    .mn-popup__item span {
      padding: 2px 6px;
      border-radius: 999px;
      background: var(--pc-line-2);
      color: var(--pc-muted);
      font-size: 10px;
      white-space: nowrap;
    }

    .mn-popup__item:hover:not(:disabled) {
      background: var(--pc-line-2);
      color: var(--pc-ink);
    }

    .mn-popup__item--disabled {
      opacity: 0.72;
      cursor: not-allowed;
    }
  `],
})
export class MobileNavComponent {
  readonly userService = inject(UserService);

  @Output() newBooking = new EventEmitter<void>();

  moreOpen = signal(false);

  toggleMore(): void {
    this.moreOpen.update(v => !v);
  }

  signOut(): void {
    this.moreOpen.set(false);
    this.userService.signOut();
    window.location.href = '/login';
  }
}
