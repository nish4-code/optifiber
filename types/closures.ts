import { ZoneOption } from './api';

export interface SpliceClosureItem {
  id: number;
  code: string;
  name: string;
  type: 'empalme' | 'distribucion' | 'reserva';
  mount_type: 'poste' | 'camara' | 'pared';
  fiber_capacity: number;
  latitude: number;
  longitude: number;
  reserve_meters: number;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
  zone?: ZoneOption | null;
  splices_count?: number;
}

export interface SpliceStrandRef {
  id: number;
  cable: string;
  buffer: number;
  buffer_color: string;
  strand_number: number;
  global_number: number;
  strand_color: string;
  color_hex: string;
}

export interface SpliceItem {
  id: number;
  tray_number: number;
  strand_in: SpliceStrandRef;
  strand_out: SpliceStrandRef | null;
  nap_box: {
    id: number;
    code: string;
    name: string;
  } | null;
  loss_db: number;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
}

export interface SpliceTelemetry {
  total_fibers: number;
  fused_fibers: number;
  available_fibers: number;
  average_loss_db: number;
  buffers_config: string;
}

export interface ClosureDetailDto {
  closure: {
    id: number;
    code: string;
    name: string;
    type: 'empalme' | 'distribucion' | 'reserva';
    mount_type: 'poste' | 'camara' | 'pared';
    status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
    reserve_meters: number;
  };
  telemetry: SpliceTelemetry;
  splices: SpliceItem[];
}

export interface ClosureFormData {
  zone_id: number | null;
  code: string;
  name: string;
  type: 'empalme' | 'distribucion' | 'reserva';
  mount_type: 'poste' | 'camara' | 'pared';
  fiber_capacity: number;
  latitude: number;
  longitude: number;
  reserve_meters: number;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
}

export interface SpliceFormData {
  tray_number: number;
  strand_in_id: number;
  strand_out_id?: number | null;
  nap_box_id?: number | null;
  loss_db: number;
  status: 'activo' | 'alerta' | 'mantenimiento' | 'inactivo';
}
