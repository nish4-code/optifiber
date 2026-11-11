'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  Activity,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { PaginatedResponse } from '@/types/api';

interface FiberColorItem {
  id: number;
  position: number;
  name: string;
  hex: string;
}

interface SmartOltOnuItem {
  id: number;
  external_id: string;
  sn: string;
  name: string;
  zone: string;
  board: string;
  port: string;
  onu_number: number;
  status: 'Online' | 'LOS' | 'Power fail' | 'Offline';
  signal_rx: number | string | null;
  signal_tx: number | string | null;
  distance_m: number | null;
  olt?: { id: number; name: string } | null;
  customer?: { id: number; code: string; full_name: string } | null;
}

export default function ConfiguracionPage() {
  const [colors, setColors] = useState<FiberColorItem[]>([]);
  const [onusData, setOnusData] = useState<PaginatedResponse<SmartOltOnuItem> | null>(null);
  const [loadingOnus, setLoadingOnus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Cargar colores TIA-598 reales del backend
  useEffect(() => {
    let isMounted = true;
    apiClient<FiberColorItem[]>('/fiber-colors')
      .then((res) => {
        if (isMounted && Array.isArray(res)) setColors(res);
      })
      .catch((err) => console.error('Error cargando colores TIA-598:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar ONUs de SmartOLT paginadas
  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('per_page', '10');
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);

    apiClient<PaginatedResponse<SmartOltOnuItem>>(`/smartolt/onus?${params.toString()}`)
      .then((res) => {
        if (isMounted) setOnusData(res);
      })
      .catch((err) => console.error('Error cargando ONUs SmartOLT:', err))
      .finally(() => {
        if (isMounted) setLoadingOnus(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, search, statusFilter, refreshTrigger]);

  const handleSyncSmartOlt = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await apiClient<{ synced_olts?: number; synced_onus?: number; mode?: string }>(
        '/smartolt/sync',
        { method: 'POST' }
      );
      setSyncMessage(
        `Sincronización completada (${res?.mode || 'Mock/Local'}): ${res?.synced_onus ?? 0} ONUs actualizadas.`
      );
      setLoadingOnus(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setSyncMessage(
        err instanceof Error ? err.message : 'Error al sincronizar con SmartOLT.'
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      <div>
        <h1 className="text-[20px] font-bold text-[#153b68]">Configuración del Sistema y SmartOLT</h1>
        <p className="text-[13px] text-[#64748b]">
          Sincronización del servicio intermediario con SmartOLT, monitor de ONUs y estándar TIA-598-D.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {/* Parámetros SmartOLT */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[10px] mb-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
                <Server className="w-[16px] h-[16px]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#153b68]">Integración con SmartOLT</h3>
                <span className="text-[11px] text-[#059669] font-medium">
                  Servicio Intermediario Seguro en Laravel (X-Token protegido)
                </span>
              </div>
            </div>
            <p className="text-[12px] text-[#64748b] mb-[14px]">
              Mantiene las tablas espejo locales actualizadas para proteger la cuenta ante Rate Limits (429).
            </p>
            <div className="flex flex-col gap-[8px] text-[12px]">
              <div className="flex justify-between py-[4px] border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Endpoint Puente:</span>
                <span className="font-mono text-[#0f172a]">/api/smartolt/sync</span>
              </div>
              <div className="flex justify-between py-[4px] border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">ONUs Espejo Registradas:</span>
                <span className="font-mono font-semibold text-[#0f172a]">
                  {onusData?.total ?? 0} unidades
                </span>
              </div>
              <div className="flex justify-between py-[4px] border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Caché de Telemetría:</span>
                <span className="font-semibold text-[#059669]">Habilitada</span>
              </div>
            </div>

            {syncMessage && (
              <div className="mt-[12px] p-[8px] rounded-[6px] bg-[#ecfdf5] border border-[#d1fae5] text-[#047857] text-[12px] flex items-center gap-[6px]">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncSmartOlt}
              disabled={syncing}
              className="gap-[6px]"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando OLT...' : 'Sincronizar ahora'}
            </Button>
          </div>
        </div>

        {/* Estándar TIA-598 desde API */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[10px] mb-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                <Database className="w-[16px] h-[16px]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#153b68]">Norma de Color TIA-598-D</h3>
                <span className="text-[11px] text-[#059669] font-medium">
                  Catálogo Maestro API (12 Colores / 144 Hilos)
                </span>
              </div>
            </div>
            <p className="text-[12px] text-[#64748b] mb-[14px]">
              Codificación oficial obtenida desde `/api/fiber-colors` para tubos buffer e hilos de sílice.
            </p>
            <div className="grid grid-cols-6 gap-[6px]">
              {colors.map((c) => (
                <div
                  key={c.id}
                  className="p-[6px] rounded-[6px] border border-[#e2e8f0] flex flex-col items-center gap-[4px] bg-[#f8fafc]"
                >
                  <span
                    className="w-[16px] h-[16px] rounded-full inline-block border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] font-medium text-[#334155] truncate w-full text-center">
                    {c.position}. {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Monitoreo ONUs SmartOLT */}
      <div className="bg-white border border-[#e2e8f0] rounded-[12px] overflow-hidden shadow-xs flex flex-col">
        <div className="p-[16px] border-b border-[#f1f5f9] bg-[#f8fafc] flex flex-col md:flex-row items-start md:items-center justify-between gap-[12px]">
          <div>
            <h2 className="text-[15px] font-bold text-[#153b68]">
              Monitor de ONUs Sincronizadas (SmartOLT)
            </h2>
            <p className="text-[12px] text-[#64748b]">
              Estado óptico y asignación en tarjetas PON de los terminales ópticos registrados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-[8px] w-full md:w-auto">
            <div className="w-full sm:w-[220px]">
              <Input
                placeholder="Buscar SN, nombre o zona..."
                icon={<Search size={14} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[38px] px-[10px] text-[12px] bg-white border border-[#e2e8f0] rounded-[8px] cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="Online">Online</option>
              <option value="LOS">LOS</option>
              <option value="Power fail">Power fail</option>
              <option value="Offline">Offline</option>
            </select>

            {(search || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="text-[#64748b] gap-[4px]"
              >
                <RotateCcw size={13} />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#f1f5f9]">
                <th className="py-[10px] px-[16px] font-bold">Serial (SN)</th>
                <th className="py-[10px] px-[16px] font-bold">Nombre / Abonado</th>
                <th className="py-[10px] px-[16px] font-bold">OLT / PON</th>
                <th className="py-[10px] px-[16px] font-bold">Señal Rx</th>
                <th className="py-[10px] px-[16px] font-bold">Distancia</th>
                <th className="py-[10px] px-[16px] font-bold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#334155]">
              {loadingOnus ? (
                <tr>
                  <td colSpan={6} className="py-[32px] text-center text-[#64748b]">
                    Cargando ONUs sincronizadas...
                  </td>
                </tr>
              ) : !onusData || onusData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-[32px] text-center text-[#64748b]">
                    No se encontraron ONUs en el espejo local.
                  </td>
                </tr>
              ) : (
                onusData.items.map((onu) => {
                  const rx = onu.signal_rx !== null && onu.signal_rx !== undefined ? Number(onu.signal_rx) : NaN;
                  return (
                    <tr key={onu.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-[12px] px-[16px] font-mono text-[12px] font-semibold text-[#0f172a]">
                        {onu.sn}
                      </td>
                      <td className="py-[12px] px-[16px]">
                        <span className="font-medium text-[#0f172a] block">{onu.name}</span>
                        {onu.customer && (
                          <span className="text-[11px] text-[#0066ff]">
                            {onu.customer.code} — {onu.customer.full_name}
                          </span>
                        )}
                      </td>
                      <td className="py-[12px] px-[16px] text-[12px] text-[#64748b]">
                        <span className="block text-[#0f172a] font-medium">
                          {onu.olt?.name || 'OLT Principal'}
                        </span>
                        <span>
                          Slot {onu.board} / Port {onu.port} / ONU #{onu.onu_number}
                        </span>
                      </td>
                      <td className="py-[12px] px-[16px] font-mono text-[12px]">
                        {!isNaN(rx) ? (
                          <Badge variant={rx >= -24 ? 'success' : rx >= -27 ? 'warning' : 'critical'}>
                            <Activity size={10} className="mr-[3px]" />
                            {rx.toFixed(2)} dBm
                          </Badge>
                        ) : (
                          <span className="text-[#94a3b8]">N/A</span>
                        )}
                      </td>
                      <td className="py-[12px] px-[16px] text-[12px] text-[#64748b]">
                        {onu.distance_m ? `${onu.distance_m} m` : '-'}
                      </td>
                      <td className="py-[12px] px-[16px]">
                        <Badge
                          variant={
                            onu.status === 'Online'
                              ? 'success'
                              : onu.status === 'LOS'
                              ? 'critical'
                              : 'warning'
                          }
                        >
                          {onu.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {onusData && onusData.total > 0 && (
          <div className="px-[16px] py-[12px] bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between text-[12px] text-[#64748b]">
            <span>
              Mostrando <strong>{onusData.from || 0}</strong> a <strong>{onusData.to || 0}</strong> de{' '}
              <strong>{onusData.total}</strong> ONUs
            </span>
            <div className="flex items-center gap-[6px]">
              <Button
                variant="outline"
                size="sm"
                disabled={onusData.currentPage <= 1 || loadingOnus}
                onClick={() => setCurrentPage(onusData.currentPage - 1)}
                className="h-[28px] px-[8px] text-[12px] gap-[4px]"
              >
                <ChevronLeft size={13} />
                Anterior
              </Button>
              <span className="font-semibold text-[#0f172a]">
                {onusData.currentPage} / {onusData.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={onusData.currentPage >= onusData.lastPage || loadingOnus}
                onClick={() => setCurrentPage(onusData.currentPage + 1)}
                className="h-[28px] px-[8px] text-[12px] gap-[4px]"
              >
                Siguiente
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
