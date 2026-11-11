import { ZoneOption } from './api';

export interface TrunkItem {
  id: number;
  code: string;
  name: string;
  fiber_count: 12 | 24 | 48 | 96 | 144;
  buffer_count: number;
  strands_per_buffer: number;
  length_km: number;
  map_color: string;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
  is_visible: boolean;
  zone?: ZoneOption | null;
}

export interface TrunkFormData {
  zone_id: number | null;
  code: string;
  name: string;
  fiber_count: 12 | 24 | 48 | 96 | 144;
  length_km: number;
  map_color: string;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
  is_visible: boolean;
}

export interface TrunkStrandItem {
  strand_number: number;
  global_number: number;
  color: { id: number; name: string; hex: string };
  status: 'libre' | 'ocupado' | 'reservado' | 'averiado';
}

export interface TrunkBufferItem {
  buffer_number: number;
  color: { id: number; name: string; hex: string };
  strands: TrunkStrandItem[];
}

export interface TrunkStrandsDto {
  cable_id: number;
  code: string;
  name: string;
  fiber_count: number;
  buffers: TrunkBufferItem[];
}
