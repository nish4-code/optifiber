'use client';

import React, { useEffect, useState } from 'react';
import { Box, Layers, Users, Activity, AlertTriangle } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MiniMap } from '@/components/dashboard/MiniMap';
import { ZoneCapacity } from '@/components/dashboard/ZoneCapacity';
import { LatestCustomersTable } from '@/components/dashboard/LatestCustomersTable';
import { AlertList } from '@/components/dashboard/AlertList';
import { apiClient } from '@/lib/api/client';
import type {
  DashboardSummary,
  ZoneCapacityItem,
  LatestCustomerItem,
  AlertItem,
} from '@/types/dashboard';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [zones, setZones] = useState<ZoneCapacityItem[]>([]);
  const [customers, setCustomers] = useState<LatestCustomerItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summaryRes, zonesRes, customersRes, alertsRes] = await Promise.allSettled([
          apiClient<DashboardSummary>('/dashboard/summary'),
          apiClient<{ zones: ZoneCapacityItem[] }>('/dashboard/zones-capacity'),
          apiClient<{ customers: LatestCustomerItem[] }>('/dashboard/latest-customers'),
          apiClient<{ data: AlertItem[] }>('/alerts'),
        ]);

        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
        if (zonesRes.status === 'fulfilled') setZones(zonesRes.value.zones);
        if (customersRes.status === 'fulfilled') setCustomers(customersRes.value.customers);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data);
      } catch {
        // Usa datos de respaldo en caso de desconexión temporal
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const naps = summary?.kpis.naps;
  const closures = summary?.kpis.closures;
  const custKpi = summary?.kpis.customers;
  const traffic = summary?.kpis.network_traffic;
  const activeAlerts = summary?.kpis.active_alerts;

  return (
    <div className="flex flex-col gap-[20px] pb-[40px]">
      {/* Indicador sutil de sincronización */}
      {isLoading && (
        <div className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] text-[12px] px-[14px] py-[6px] rounded-[8px] flex items-center gap-[8px]">
          <span className="w-[8px] h-[8px] rounded-full bg-[#3b82f6] animate-ping" />
          <span>Sincronizando telemetría en tiempo real con SmartOLT y base de datos...</span>
        </div>
      )}

      {/* Sección 1: Cuadrícula de Métricas KPI (5 tarjetas) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[14px]">
        {/* Tarjeta 1: Cajas NAP */}
        <KpiCard
          title="Cajas NAP"
          value={naps?.total ?? 0}
          badgeText={`${naps?.occupancy_percentage ?? 0}% ocupación`}
          badgeVariant="success"
          icon={<Box className="w-[18px] h-[18px] text-[#059669]" />}
          iconBgColor="bg-[#ecfdf5]"
          subStats={[
            { label: 'activas', value: naps?.active ?? 0, color: 'text-[#059669]' },
            { label: 'mant.', value: naps?.maintenance ?? 0 },
            { label: 'inactivas', value: naps?.inactive ?? 0 },
          ]}
        />

        {/* Tarjeta 2: Mufas */}
        <KpiCard
          title="Mufas & Empalmes"
          value={closures?.total ?? 0}
          badgeText="Fusión OK"
          badgeVariant="neutral"
          icon={<Layers className="w-[18px] h-[18px] text-[#0066ff]" />}
          iconBgColor="bg-[#eff6ff]"
          subStats={[
            { label: 'activas', value: closures?.active ?? 0, color: 'text-[#0066ff]' },
            { label: 'en mant.', value: closures?.maintenance ?? 0 },
            { label: 'inactiva', value: closures?.inactive ?? 0 },
          ]}
        />

        {/* Tarjeta 3: Abonados / Clientes */}
        <KpiCard
          title="Abonados / Clientes"
          value={custKpi?.total ?? 0}
          badgeText={`+${custKpi?.new_this_month ?? 0} este mes`}
          badgeVariant="success"
          icon={<Users className="w-[18px] h-[18px] text-[#4f46e5]" />}
          iconBgColor="bg-[#eef2ff]"
          subStats={[
            { label: 'activos', value: custKpi?.active ?? 0, color: 'text-[#059669]' },
            { label: 'susp.', value: custKpi?.suspended ?? 0 },
            { label: 'pend.', value: custKpi?.pending ?? 0 },
          ]}
        />

        {/* Tarjeta 4: Tráfico de Red */}
        <KpiCard
          title="Tráfico de Red"
          value={traffic?.peak_gbps ?? 0}
          badgeText="Gbps pico"
          badgeVariant="neutral"
          icon={<Activity className="w-[18px] h-[18px] text-[#0891b2]" />}
          iconBgColor="bg-[#ecfeff]"
          sparkline={
            <div className="h-[20px] w-full flex items-center">
              <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                <path
                  d="M0 16 Q20 4 35 12 T70 6 T100 14"
                  stroke="#0891b2"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          }
          subStats={[
            { label: 'Down', value: `${traffic?.down_gbps ?? 0} Gbps` },
            { label: 'Up', value: `${traffic?.up_mbps ?? 0} Mbps` },
          ]}
        />

        {/* Tarjeta 5: Alertas Críticas */}
        <KpiCard
          title="Alertas Activas"
          value={activeAlerts?.count ?? 0}
          valueColor="text-[#ef4444]"
          badgeText={(activeAlerts?.count ?? 0) > 0 ? 'Atención requerida' : 'Sin alertas'}
          badgeVariant={(activeAlerts?.count ?? 0) > 0 ? 'critical' : 'success'}
          borderColor="border-[#fecdd3]"
          icon={<AlertTriangle className="w-[18px] h-[18px] text-[#e11d48]" />}
          iconBgColor="bg-[#ffe4e6]"
          subStats={[
            { label: 'críticas', value: alerts.filter((a) => a.severity === 'critical').length, color: 'text-[#be123c]' },
            { label: 'avisos', value: alerts.filter((a) => a.severity === 'warning').length, color: 'text-[#be123c]' },
          ]}
        />
      </section>

      {/* Sección 2: Dos Columnas (Operaciones en Vivo y Visualización vs Alarmas y Accesos) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] items-start">
        {/* Columna Izquierda (Ancho 8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-[20px]">
          {/* Mini Visor de Mapa de Red con Estilo Fiberplus */}
          <MiniMap
            napsCount={naps?.total ?? 0}
            closuresCount={closures?.total ?? 0}
            customersCount={custKpi?.total ?? 0}
          />

          {/* Capacidad y Ocupación por Zonas */}
          <ZoneCapacity zones={zones} />

          {/* Altas Recientes / Últimos Clientes Conectados */}
          <LatestCustomersTable customers={customers} totalCount={custKpi?.total ?? 0} />
        </div>

        {/* Columna Derecha (Ancho 4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-[20px]">
          {/* Alertas e Incidentes Activas */}
          <AlertList alerts={alerts} />
        </div>
      </section>
    </div>
  );
}
