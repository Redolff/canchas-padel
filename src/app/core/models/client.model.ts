export interface Client {
  id: number;
  nombre: string;
  apellido: string | null;
  telefono: string;
  dni: string | null;
  reservationsCount: number;
}

export interface ClientPageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ClientPage {
  data: Client[];
  meta: ClientPageMeta;
}
