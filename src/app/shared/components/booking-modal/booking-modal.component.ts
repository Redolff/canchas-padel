import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Booking, BOOKING_TYPE_LABELS, BookingType } from '../../../core/models/booking.model';
import { Court } from '../../../core/models/court.model';
import { ReservationService } from '../../../core/services/reservation.service';

export interface BookingModalSaveEvent extends Omit<Booking, 'id'> {
  id?: string;
  nombre: string;
  telefono: string;
  total: number;
  isRecurring?: boolean;
  endDate?: string;
}

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './booking-modal.component.html',
  styleUrl: './booking-modal.component.scss',
})

export class BookingModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService)

  @Input() preset: (Partial<Booking> & { clientPhone?: string | null; total?: number }) | null = null;
  @Input() courts: Court[] = [];
  @Input() error: string | null = null;
  @Input() defaultPrice: number = 0;

  @Output() save = new EventEmitter<BookingModalSaveEvent>();
  @Output() cancel = new EventEmitter<void>();

  repeat = signal(false);
  selectedCourtId = signal(1);

  form = this.fb.nonNullable.group({
    courtId: [1],
    date: [todayIso()],
    startHour: [8],
    duration: [1.5],
    type: ['private' as BookingType],
    nombre: [''],
    telefono: [''],
    players: [4],
    endDate: [''],
    total: [0],
  });

  /*readonly startTimeOptions = Array.from({ length: 27 }, (_, i) => {
    const hour = Math.floor(8 + i * 0.5);
    const mins = (i % 2 === 0) ? '00' : '30';
    return { label: `${String(hour).padStart(2, '0')}:${mins}`, value: i * 0.5 };
  }).slice(0, 26);*/
  private readonly baseTimeOptions = Array.from({ length: 32 }, (_, i) => {
    const value = 8 + i * 0.5;
    const hour = Math.floor(value);
    const mins = i % 2 === 0 ? '00' : '30';
    return {
      label: `${String(hour).padStart(2, '0')}:${mins}`,
      value,
    };
  });

  readonly startTimeOptions = computed(() => {
    const courtId = this.selectedCourtId();

    const filtered = this.reservations().filter(r => {
      if (this.preset?.id) {
        return r.courtId === courtId && r.id !== this.preset.id;
      }

      return r.courtId === courtId;
    });

    const occupied = new Set<number>();

    filtered.forEach(r => {
      const end = r.startHour + r.duration;

      for (let slot = r.startHour; slot < end; slot += 0.5) {
        occupied.add(Number(slot.toFixed(1)));
      }
    });

    return this.baseTimeOptions.map(opt => ({
      ...opt,
      occupied: occupied.has(Number(opt.value.toFixed(1))),
      label: occupied.has(Number(opt.value.toFixed(1)))
        ? `${opt.label} - Ocupado`
        : opt.label,
    }));
  });

  readonly durationOptions = [
    { label: '30 min', value: 0.5 },
    { label: '60 min', value: 1.0 },
    { label: '90 min', value: 1.5 },
    { label: '120 min', value: 2.0 },
  ];

  readonly typeOptions: BookingType[] = ['private', 'open', 'lesson', 'maintenance'];
  readonly typeLabels = BOOKING_TYPE_LABELS;
  readonly reservations = this.reservationService.reservationsByDate;

  get isMaintenance(): boolean {
    return this.form.get('type')!.value === 'maintenance';
  }

  get isNoPriceType(): boolean {
    const t = this.form.get('type')!.value;
    return t === 'maintenance' || t === 'lesson';
  }

  get isEditing(): boolean {
    return !!this.preset?.id;
  }

  ngOnInit(): void {

    this.selectedCourtId.set(Number(this.form.get('courtId')?.value));
    this.form.get('courtId')!.valueChanges.subscribe(value => {
      this.selectedCourtId.set(Number(value));
    });

    const date = this.form.get('date')!.value;
    this.reservationService.loadByDate(date).subscribe();
    this.form.get('date')!.valueChanges.subscribe((date): any => {
      if (!date) return;
      this.reservationService.loadByDate(date).subscribe();
    });

    if (this.preset) {
      this.form.patchValue({
        courtId: this.preset.courtId ?? 1,
        date: this.preset.date ?? todayIso(),
        startHour: this.preset.startHour ?? 0,
        duration: this.preset.duration ?? 1.5,
        type: this.preset.type ?? 'private',
        nombre: this.preset.clientName ?? '',
        telefono: this.preset.clientPhone ?? '',
        players: this.preset.players ?? 4,
        total: this.preset.total ?? this.defaultPrice,
      });
    } else {
      this.form.patchValue({ total: this.defaultPrice });
    }
    this.applyMaintenanceState(this.form.get('type')!.value as BookingType);

    this.form.get('type')!.valueChanges.subscribe(type => {
      this.applyMaintenanceState(type as BookingType);
    });
  }

  private applyMaintenanceState(type: BookingType): void {
    const nombre = this.form.get('nombre')!;
    const telefono = this.form.get('telefono')!;
    const players = this.form.get('players')!;
    const total = this.form.get('total')!;
    if (type === 'maintenance') {
      nombre.disable();
      telefono.disable();
      players.disable();
      total.disable();
      total.setValue(0);
    } else if (type === 'lesson') {
      nombre.enable();
      telefono.enable();
      players.enable();
      total.disable();
      total.setValue(0);
    } else {
      nombre.enable();
      telefono.enable();
      players.enable();
      total.enable();
    }
  }

  onSave(): void {
    const raw = this.form.getRawValue();
    const event: BookingModalSaveEvent = {
      courtId: raw.courtId,
      date: raw.date,
      startHour: raw.startHour,
      duration: raw.duration,
      type: raw.type,
      clientName: null,
      nombre: raw.nombre,
      telefono: raw.telefono,
      players: raw.players,
      total: Number(raw.total) || 0,
    };
    if (this.preset?.id) {
      event.id = this.preset.id;
    } else if (this.repeat()) {
      event.isRecurring = true;
      event.endDate = raw.endDate || undefined;
    }
    this.save.emit(event);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
