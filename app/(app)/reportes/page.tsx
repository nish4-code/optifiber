'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  Activity,
  Zap,
  Users,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import { DashboardSummary, ZoneCapacityItem } from '@/types/dashboard';
import { PaginatedResponse } from '@/types/api';
import { NapItem } from '@/types/naps';
import { CustomerItem } from '@/types/customers';

export default function ReportesPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [zones, setZones] = useState<ZoneCapacityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiClient<DashboardSummary>('/dashboard/summary'),
      apiClient<{ zones: ZoneCapacityItem[] }>('/dashboard/zones-capacity'),
    ])
      .then(([sumRes, zonesRes]) => {
        if (!isMounted) return;
        setSummary(sumRes);
        setZones(zonesRes?.zones || []);
      })
      .catch((err) => console.error('Error cargando analítica de reportes:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number>>) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportZones = () => {
    setExporting('zones');
    try {
      downloadCsv(
        `optifiber-zonas-${new Date().toISOString().slice(0, 10)}.csv`,
        ['ID', 'Zona', 'Puertos Totales', 'Puertos Ocupados', 'Puertos Libres', 'Ocupación (%)'],
        zones.map((z) => [
          z.id,
          z.name,
          z.total_ports,
          z.occupied_ports,
          z.free_ports,
          `${z.occupancy_percentage}%`,
        ])
      );
    } finally {
      setExporting(null);
    }
  };

  const handleExportNaps = async () => {
    setExporting('naps');
    try {
      const res = await apiClient<PaginatedResponse<NapItem>>('/naps?per_page=100');
      downloadCsv(
        `optifiber-naps-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Código', 'Nombre / Ruta', 'Zona', 'Splitter', 'Capacidad', 'Ocupados', 'Libres', 'Ocupación (%)', 'Estado'],
        (res.items || []).map((n) => [
          n.code,
          n.name,
          n.zone?.name || 'Sin zona',
          n.splitter_ratio,
          n.port_capacity,
          n.occupied_ports,
          n.free_ports,
          `${n.occupancy_percentage}%`,
          n.status,
        ])
      );
    } catch (err) {
      console.error('Error exportando NAPs:', err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportCustomers = async () => {
    setExporting('customers');
    try {
      const res = await apiClient<PaginatedResponse<CustomerItem>>('/customers?per_page=100');
      downloadCsv(
        `optifiber-clientes-smartolt-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Código', 'Abonado', 'DNI', 'Teléfono', 'Plan', 'NAP', 'Puerto', 'ONT SN', 'Estado ONT', 'Rx (dBm)', 'Estado'],
        (res.items || []).map((c) => [
          c.code,
          c.full_name,
          c.document || '',
          c.phone || '',
          c.plan,
          c.nap?.code || 'Sin asignar',
          c.nap?.port_number || '',
          c.smartolt?.sn || '',
          c.smartolt?.status || '',
          c.smartolt?.signal_rx ?? '',
          c.status,
        ])
      );
    } catch (err) {
      console.error('Error exportando clientes:', err);
    } finally {
      setExporting(null);
    }
  };

  const avgRx = summary?.telemetry.average_attenuation_dbm ?? -19.4;
  const napOcc = summary?.kpis.naps.occupancy_percentage ?? 0;
  const activeCustomers = summary?.kpis.customers.active ?? 0;
  const totalCustomers = summary?.kpis.customers.total ?? 0;
  const activeAlerts = summary?.kpis.active_alerts.count ?? 0;

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Reportes y Analítica FTTH</h1>
          <p className="text-[13px] text-[#64748b]">
            Informes en tiempo real de atenuación óptica, ocupación de puertos NAP y exportación de inventarios CSV.
          </p>
        </div>

        <div className="flex items-center gap-[8px]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-[6px] text-[#64748b]"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar Datos
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCustomers}
            disabled={exporting !== null}
            className="gap-[6px]"
          >
            <Download className="w-[14px] h-[14px]" />
            <span>{exporting === 'customers' ? 'Exportando...' : 'Exportar Abonados CSV'}</span>
          </Button>
        </div>
      </div>

      {/* KPIs en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center mb-[12px]">
              <Activity className="w-[18px] h-[18px]" />
            </div>
            <h3 className="text-[14px] font-bold text-[#153b68]">Atenuación Promedio Óptica</h3>
            <p className="text-[12px] text-[#64748b] mt-[4px]">
              Nivel Rx promedio de todas las ONUs Online sincronizadas desde SmartOLT.
            </p>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex items-baseline justify-between">
            <span className="text-[24px] font-bold font-mono text-[#059669]">
              {Number(avgRx).toFixed(1)} dBm
            </span>
            <Badge variant={avgRx >= -24 ? 'success' : avgRx >= -27 ? 'warning' : 'critical'}>
              {avgRx >= -24 ? 'Óptimo (>= -24 dBm)' : 'Degradado'}
            </Badge>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-[12px]">
              <Zap className="w-[18px] h-[18px]" />
            </div>
            <h3 className="text-[14px] font-bold text-[#153b68]">Tasa de Ocupación NAP</h3>
            <p className="text-[12px] text-[#64748b] mt-[4px]">
              Porcentaje global de puertos de distribución ocupados respecto al total instalado.
            </p>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex items-baseline justify-between">
            <span className="text-[24px] font-bold font-mono text-[#153b68]">
              {napOcc}%
            </span>
            <span className="text-[11px] font-semibold text-[#64748b]">
              {summary?.kpis.naps.total || 0} cajas NAP activas
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center mb-[12px]">
              <Users className="w-[18px] h-[18px]" />
            </div>
            <h3 className="text-[14px] font-bold text-[#153b68]">Abonados y Alertas Activas</h3>
            <p className="text-[12px] text-[#64748b] mt-[4px]">
              Relación de abonados operativos frente a incidencias activas en planta externa.
            </p>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex items-baseline justify-between">
            <span className="text-[24px] font-bold font-mono text-[#0066ff]">
              {activeCustomers} / {totalCustomers}
            </span>
            <Badge variant={activeAlerts > 0 ? 'warning' : 'success'}>
              {activeAlerts > 0 ? (
                <span className="flex items-center gap-[4px]">
                  <AlertTriangle size={11} />
                  {activeAlerts} alertas
                </span>
              ) : (
                '0 alertas'
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabla de Capacidad por Zonas y Exportaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px]">
        <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs">
          <div className="flex items-center justify-between mb-[16px]">
            <h3 className="text-[15px] font-bold text-[#153b68]">
              Capacidad y Saturación por Zona Geográfica
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportZones}
              disabled={zones.length === 0}
              className="h-[30px] text-[12px] gap-[4px]"
            >
              <FileSpreadsheet size={13} />
              CSV Zonas
            </Button>
          </div>

          <div className="flex flex-col gap-[14px]">
            {loading ? (
              <p className="text-[13px] text-[#64748b] py-[20px] text-center">Cargando capacidad...</p>
            ) : zones.length === 0 ? (
              <p className="text-[13px] text-[#64748b] py-[20px] text-center">Sin datos de zonas.</p>
            ) : (
              zones.map((z) => (
                <div key={z.id} className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[#0f172a]">{z.name}</span>
                    <span className="text-[12px] text-[#64748b]">
                      <strong className="text-[#0f172a]">{z.occupied_ports}</strong> / {z.total_ports} puertos ({z.occupancy_percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-[8px] rounded-full bg-[#e2e8f0] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        z.occupancy_percentage >= 85
                          ? 'bg-[#ef4444]'
                          : z.occupancy_percentage >= 70
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#10b981]'
                      }`}
                      style={{ width: `${Math.min(z.occupancy_percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Centro de Descarga CSV */}
        <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between gap-[14px]">
          <div>
            <h3 className="text-[15px] font-bold text-[#153b68] mb-[6px]">
              Centro de Exportación
            </h3>
            <p className="text-[12px] text-[#64748b] mb-[16px]">
              Descarga padrones e inventarios en formato CSV compatible con Excel para auditoría de campo.
            </p>

            <div className="flex flex-col gap-[10px]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportNaps}
                disabled={exporting !== null}
                className="justify-start gap-[8px] w-full"
              >
                <FileSpreadsheet size={15} className="text-[#10b981]" />
                {exporting === 'naps' ? 'Generando CSV...' : 'Inventario de Cajas NAP (CSV)'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCustomers}
                disabled={exporting !== null}
                className="justify-start gap-[8px] w-full"
              >
                <FileSpreadsheet size={15} className="text-[#0066ff]" />
                {exporting === 'customers' ? 'Generando CSV...' : 'Padrón de Abonados + Señal Rx (CSV)'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportZones}
                disabled={zones.length === 0 || exporting !== null}
                className="justify-start gap-[8px] w-full"
              >
                <FileSpreadsheet size={15} className="text-[#8b5cf6]" />
                Capacidad por Zona (CSV)
              </Button>
            </div>
          </div>

          <div className="p-[10px] bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0] text-[11px] text-[#64748b]">
            Los archivos se generan al instante con los datos vivos de PostgreSQL y SmartOLT.
          </div>
        </div>
      </div>
    </div>
  );
}
