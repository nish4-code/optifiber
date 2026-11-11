import { ZoneOption } from './api';

export interface NapItem {
  id: number;
  code: string;
  name: string;
  zone?: ZoneOption | null;
  splitter_ratio: '1:8' | '1:16';
  port_capacity: number;
  occupied_ports: number;
  free_ports: number;
  occupancy_percentage: number;
  address: string;
  latitude: number;
  longitude: number;
  map_color?: string;
  map_icon?: string;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
  notes?: string | null;
  created_at?: string;
}

export interface NapPortCustomer {
  id: number;
  code: string;
  name: string;
  phone?: string | null;
  plan?: string | null;
}

export interface NapPortItem {
  id: number;
  port_number: number;
  status: 'libre' | 'ocupado' | 'reservado' | 'dañado';
  customer?: NapPortCustomer | null;
}

export interface NapDetail extends NapItem {
  feeder_strand?: {
    id: number;
    global_number: number;
    strand_number: number;
    color?: { name: string; hex: string };
    buffer?: { buffer_number: number; color?: { name: string; hex: string } };
  } | null;
  ports: NapPortItem[];
}

export interface NapFormData {
  zone_id: number | null;
  code: string;
  name: string;
  splitter_ratio: '1:8' | '1:16';
  address: string;
  latitude: number;
  longitude: number;
  feeder_strand_id?: number | null;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
  notes?: string;
}
