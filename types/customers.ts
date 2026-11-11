import { ZoneOption } from './api';

export interface CustomerItem {
  id: number;
  code: string;
  full_name: string;
  document?: string | null;
  phone?: string | null;
  address?: string | null;
  plan: string;
  zone?: ZoneOption | null;
  nap?: {
    id: number;
    code: string;
    name: string;
    port_number: number;
  } | null;
  smartolt?: {
    sn: string;
    status: 'Online' | 'LOS' | 'Power fail' | 'Offline';
    signal_rx: number | null;
  } | null;
  status: 'activo' | 'pendiente' | 'suspendido';
  installed_at?: string | null;
}

export interface CustomerEventItem {
  id: number;
  type: string;
  description: string;
  payload?: Record<string, unknown> | null;
  occurred_at: string;
}

export interface CustomerDetailDto {
  info: {
    id: number;
    code: string;
    full_name: string;
    document?: string | null;
    phone?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    plan: string;
    status: 'activo' | 'pendiente' | 'suspendido';
    installed_at?: string | null;
  };
  connection: {
    nap_id: number;
    nap_code: string;
    nap_name: string;
    address: string;
    port_number: number;
    total_ports: number;
    splitter_ratio: string;
  } | null;
  equipment: {
    external_id: string;
    sn: string;
    name: string;
    olt_name?: string | null;
    board: string;
    port: string;
    onu_number: string;
    status: 'Online' | 'LOS' | 'Power fail' | 'Offline';
    signal_rx: number | null;
    signal_tx: number | null;
    distance_m: number | null;
    last_synced_at?: string | null;
  } | null;
  events: CustomerEventItem[];
}

export interface CustomerFormData {
  zone_id: number | null;
  code: string;
  full_name: string;
  document?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  plan: string;
  nap_port_id?: number | null;
  smartolt_onu_external_id?: string;
  status: 'activo' | 'pendiente' | 'suspendido';
}
