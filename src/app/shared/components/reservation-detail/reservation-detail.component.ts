import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CourtArtComponent } from '../court-art/court-art.component';
import { IconComponent } from '../icon/icon.component';
import { BOOKING_TYPE_LABELS } from '../../../core/models/booking.model';
import { RESERVATION_STATUS_LABELS, ReservationVM } from '../../../core/models/reservation.model';

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CourtArtComponent, IconComponent],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
})
export class ReservationDetailComponent {
  @Input({ required: true }) reservation!: ReservationVM;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() markPaid = new EventEmitter<void>();
  @Output() markRefunded = new EventEmitter<void>();
  @Output() deleteSeries = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  mobileCancelMode = signal(false);

  readonly bookingTypeLabels = BOOKING_TYPE_LABELS;
  readonly statusLabels = RESERVATION_STATUS_LABELS;

  get timeLabel(): string {
    return `${pad(Math.floor(this.reservation.startHour))}:${pad((this.reservation.startHour % 1) * 60)}`;
  }

  get endTimeLabel(): string {
    const endHour = this.reservation.startHour + this.reservation.duration;
    return `${pad(Math.floor(endHour))}:${pad((endHour % 1) * 60)}`;
  }

  get durationLabel(): string {
    return `${Math.round(this.reservation.duration * 60)} min`;
  }

  openMobileCancelSheet(): void { this.mobileCancelMode.set(true); }
  closeMobileCancelSheet(): void { this.mobileCancelMode.set(false); }

  onDelete(): void {
    this.mobileCancelMode.set(false);
    this.delete.emit();
  }
}
