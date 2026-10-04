export type CourtSurface = 'turf' | 'clay' | 'blue';
export type CourtLocation = 'Indoor' | 'Outdoor';

export interface Court {
  id: number;
  name: string;
  surface: CourtSurface;
  location: CourtLocation;
  hasGlass: boolean;
}
