import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { BookingModalComponent } from '../../../../shared/components/booking-modal/booking-modal.component';
import { ReservationService } from '../../../../core/services/reservation.service';
import { CourtService } from '../../../../core/services/court.service';
import { UserService } from '../../../../core/services/user.service';
import { Booking } from '../../../../core/models/booking.model';
import { BookingModalSaveEvent } from '../../../../shared/components/booking-modal/booking-modal.component';
import { SaveReservationPayload } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, MobileNavComponent, BookingModalComponent],
  template: `
    <div class="shell pc-root">
      <app-sidebar class="shell__sidebar" />
      <div class="shell__main">
        <router-outlet />
      </div>
    </div>

    <app-mobile-nav class="shell__mobile-nav" (newBooking)="openMobileModal()" />

    @if (showMobileModal()) {
      <app-booking-modal
        [preset]="mobileModalPreset()"
        [courts]="courts"
        [error]="mobileModalError()"
        [defaultPrice]="defaultSlotPrice()"
        (save)="onMobileModalSave($event)"
        (cancel)="closeMobileModal()" />
    }
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
    .shell { display: flex; height: 100%; }
    .shell__main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .shell__mobile-nav { display: none; }

    @media (max-width: 768px) {
      .shell__sidebar { display: none !important; }
      .shell__mobile-nav { display: block; }
    }
  `],
})
export class ShellComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly courtService = inject(CourtService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  get courts() { return this.courtService.courts(); }
  readonly defaultSlotPrice = computed(() => this.userService.user().defaultSlotPrice);

  showMobileModal   = signal(false);
  mobileModalPreset = signal<Partial<Booking> | null>(null);
  mobileModalError  = signal<string | null>(null);

  ngOnInit(): void {
    this.reservationService.load().subscribe();
    this.courtService.load().subscribe();
  }

  openMobileModal(): void {
    this.mobileModalPreset.set(null);
    this.mobileModalError.set(null);
    this.showMobileModal.set(true);
  }

  closeMobileModal(): void {
    this.showMobileModal.set(false);
    this.mobileModalPreset.set(null);
    this.mobileModalError.set(null);
  }

  onMobileModalSave(data: BookingModalSaveEvent): void {
    this.mobileModalError.set(null);
    const payload: SaveReservationPayload = {
      courtId: data.courtId, date: data.date, startHour: data.startHour,
      duration: data.duration, type: data.type, nombre: data.nombre,
      telefono: data.telefono, players: data.players, total: data.total,
    };
    this.reservationService.addReservation(payload).subscribe({
      next: () => {
        this.closeMobileModal();
        this.router.navigate(['/reservations']);
      },
      error: (err) => {
        if (err.status === 422) {
          const msgs = err.error?.errors;
          const first = msgs ? Object.values(msgs).flat()[0] as string : null;
          this.mobileModalError.set(first ?? 'Conflicto de reserva.');
        } else {
          this.mobileModalError.set('No se pudo guardar. Intenta de nuevo.');
        }
      },
    });
  }
}
