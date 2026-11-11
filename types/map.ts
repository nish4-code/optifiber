export interface MapTrunk {
  id: number;
  code: string;
  name: string;
  fiber_count: number;
  path: Array<[number, number]>; // [lat, lng]
  length_km: number;
  map_color: string;
  status: string;
}

export interface FeederStrandInfo {
  global_number: number;
  buffer_color: string;
  strand_color: string;
}

export interface MapNap {
  id: number;
  code: string;
  name: string;
  splitter_ratio: string;
  port_capacity: number;
  occupied_ports: number;
  free_ports: number;
  occupancy_percentage: number;
  address: string;
  latitude: number;
  longitude: number;
  feeder_strand: FeederStrandInfo | null;
  map_color: string;
  map_icon: string;
  status: string;
}

export interface MapClosure {
  id: number;
  code: string;
  name: string;
  type: string;
  mount_type: string;
  fiber_capacity: number;
  latitude: number;
  longitude: number;
  reserve_meters: number;
  status: string;
}

export interface MapCustomer {
  id: number;
  code: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  plan: string;
  nap_code: string | null;
  port_number: number | null;
  status: string;
}

export interface MapElementsResponse {
  trunks?: MapTrunk[];
  naps?: MapNap[];
  closures?: MapClosure[];
  customers?: MapCustomer[];
}

export interface LayerVisibilityState {
  naps: boolean;
  mufas: boolean;
  clientes: boolean;
  troncales: boolean;
  reservas: boolean;
  alertas: boolean;
}

export interface MapZone {
  id: number;
  code: string;
  name: string;
  description?: string;
  center_lat: number;
  center_lng: number;
  zoom_level?: number;
  city?: string;
  trunk_cables_count?: number;
  nap_boxes_count?: number;
  splice_closures_count?: number;
  customers_count?: number;
}

export type MapTileMode = 'map' | 'satellite';
export type GisToolMode = 'select' | 'draw_trunk' | 'add_nap' | 'trace' | 'measure';
