import { Reservation } from './reservation.model';

export interface DashboardStats {
  todayBookings:  number;
  bookingsDelta:  number;
  todayRevenue:   number;
  revenueDelta:   number;
  occupancy:      number;
  occupancyDelta: number;
  activeMembers:  number;
  membersDelta:   number;
  upcoming:       Reservation[];
}
