export interface SmartOltOltItem {
  id: string;
  name: string;
  olt_hardware_version?: string | null;
  ip?: string | null;
  telnet_port?: string | null;
  snmp_port?: string | null;
  status?: string | null;
}

export interface SmartOltTraceHop {
  type: 'onu' | 'odb' | 'olt';
  id: number | string;
  label: string;
  status?: string;
  signal_rx?: number | null;
  address?: string | null;
  pon_port?: string | null;
  total_ports?: number;
  used_ports?: number;
  zone?: string | null;
  ip?: string | null;
  hardware?: string | null;
  board?: string | null;
  port?: string | null;
  onu_number?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SmartOltTraceDto {
  onu_id: string;
  sn: string;
  status: string;
  distance_m?: number | null;
  hops: SmartOltTraceHop[];
  polyline: Array<[number, number]>;
}
