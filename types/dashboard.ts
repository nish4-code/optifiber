export interface TelemetryData {
  system_online: boolean;
  average_attenuation_dbm: number;
  olt_bandwidth_gbps: number;
}

export interface NapsKpi {
  total: number;
  occupancy_percentage: number;
  active: number;
  maintenance: number;
  inactive: number;
}

export interface ClosuresKpi {
  total: number;
  fusion_ok: boolean;
  active: number;
  maintenance: number;
  inactive: number;
}

export interface CustomersKpi {
  total: number;
  new_this_month: number;
  active: number;
  suspended: number;
  pending: number;
}

export interface NetworkTrafficKpi {
  peak_gbps: number;
  down_gbps: number;
  up_mbps: number;
}

export interface ActiveAlertsKpi {
  count: number;
  attention_required: boolean;
}

export interface DashboardSummary {
  telemetry: TelemetryData;
  kpis: {
    zones?: { total: number };
    trunks?: { total: number; total_km: number };
    reserves?: { total: number };
    naps: NapsKpi;
    closures: ClosuresKpi;
    customers: CustomersKpi;
    network_traffic: NetworkTrafficKpi;
    active_alerts: ActiveAlertsKpi;
  };
}

export interface ZoneCapacityItem {
  id: number;
  name: string;
  total_ports: number;
  occupied_ports: number;
  free_ports: number;
  occupancy_percentage: number;
}

export interface LatestCustomerItem {
  id: number;
  code: string;
  name: string;
  plan: string;
  nap: string;
  port: string | null;
  status: 'activo' | 'suspendido' | 'pendiente';
  installed_at: string | null;
}

export interface AlertItem {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  created_at: string;
  resolved_at: string | null;
}
