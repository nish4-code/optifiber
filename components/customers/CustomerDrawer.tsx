'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Network,
  Cpu,
  History,
  Phone,
  MapPin,
  Calendar,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import { CustomerDetailDto } from '@/types/customers';

interface CustomerDrawerProps {
  customerId: number | null;
  onClose: () => void;
  onRefreshList?: () => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  customerId,
  onClose,
  onRefreshList,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'connection' | 'equipment' | 'history'>('info');
  const [detail, setDetail] = useState<CustomerDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingSignal, setUpdatingSignal] = useState<boolean>(false);
  const [signalMessage, setSignalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;

    let isMounted = true;

    apiClient<CustomerDetailDto>(`/customers/${customerId}`)
      .then((res) => {
        if (isMounted) setDetail(res);
      })
      .catch((err) => {
        console.error('Error cargando ficha del cliente:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [customerId]);

  if (!customerId) return null;

  const handleRefreshSignal = async () => {
    if (!detail?.equipment?.external_id) return;

    setUpdatingSignal(true);
    setSignalMessage(null);

    try {
      const res = await apiClient<{ signal_rx: number; signal_tx: number; status: 'Online' | 'LOS' | 'Power fail' | 'Offline' }>(
        `/smartolt/onus/${detail.equipment.external_id}/signal`
      );

      setDetail((prev) => {
        if (!prev || !prev.equipment) return prev;
        return {
          ...prev,
          equipment: {
            ...prev.equipment,
            signal_rx: res.signal_rx,
            signal_tx: res.signal_tx,
            status: res.status,
            last_synced_at: new Date().toISOString(),
          },
        };
      });

      setSignalMessage('Señal óptica actualizada en tiempo real.');
      onRefreshList?.();
    } catch (err) {
      console.error('Error actualizando señal SmartOLT:', err);
      setSignalMessage('No se pudo conectar con la OLT.');
    } finally {
      setUpdatingSignal(false);
    }
  };

  const getSignalRxDetails = (rx: number | string | null | undefined) => {
    const num = rx !== null && rx !== undefined ? Number(rx) : NaN;
    if (isNaN(num)) return { label: 'Sin datos', color: 'text-[#64748b]', badge: 'neutral' as const };
    if (num < -27) return { label: 'Crítico / Alerta', color: 'text-[#ef4444]', badge: 'critical' as const };
    if (num < -24) return { label: 'Degradado', color: 'text-[#f59e0b]', badge: 'warning' as const };
    return { label: 'Óptimo', color: 'text-[#10b981]', badge: 'success' as const };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0f172a]/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center font-bold text-[14px]">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-[8px]">
                <h2 className="text-[16px] font-bold text-[#0f172a]">
                  {detail?.info.full_name || 'Cargando abonado...'}
                </h2>
                {detail && (
                  <Badge variant={detail.info.status === 'activo' ? 'success' : 'warning'}>
                    {detail.info.status.toUpperCase()}
                  </Badge>
                )}
              </div>
              <span className="text-[12px] font-mono text-[#64748b]">
                {detail?.info.code} · Plan: {detail?.info.plan}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-[6px] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e2e8f0] bg-white px-[12px] text-[13px] font-medium text-[#64748b]">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-[10px] px-[12px] flex items-center gap-[6px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#0066ff] text-[#0066ff] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <User size={15} />
            Información
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-[10px] px-[12px] flex items-center gap-[6px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'connection'
                ? 'border-[#0066ff] text-[#0066ff] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Network size={15} />
            Conexión Óptica
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-[10px] px-[12px] flex items-center gap-[6px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'equipment'
                ? 'border-[#0066ff] text-[#0066ff] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <Cpu size={15} />
            Equipo SmartOLT
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-[10px] px-[12px] flex items-center gap-[6px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#0066ff] text-[#0066ff] font-semibold'
                : 'border-transparent hover:text-[#0f172a]'
            }`}
          >
            <History size={15} />
            Historial ({detail?.events.length || 0})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-[20px]">
          {loading ? (
            <div className="py-[60px] flex flex-col items-center justify-center gap-[12px] text-[#64748b]">
              <div className="w-[32px] h-[32px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px]">Cargando datos técnicos de la ONT y fibra...</p>
            </div>
          ) : !detail ? (
            <p className="text-center text-[#64748b] py-[40px]">No se pudo cargar la información.</p>
          ) : (
            <>
              {/* TAB 1: INFORMACIÓN */}
              {activeTab === 'info' && (
                <div className="flex flex-col gap-[16px]">
                  <div className="grid grid-cols-2 gap-[12px] bg-[#f8fafc] p-[14px] rounded-[8px] border border-[#e2e8f0]">
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Código de Abonado</span>
                      <span className="text-[13px] font-bold text-[#0f172a]">{detail.info.code}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Documento de Identidad</span>
                      <span className="text-[13px] font-bold text-[#0f172a]">{detail.info.document || 'No registrado'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Teléfono Móvil</span>
                      <span className="text-[13px] font-bold text-[#0f172a] flex items-center gap-[4px]">
                        <Phone size={12} className="text-[#0066ff]" />
                        {detail.info.phone || 'No registrado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Fecha de Instalación</span>
                      <span className="text-[13px] font-bold text-[#0f172a] flex items-center gap-[4px]">
                        <Calendar size={12} className="text-[#0066ff]" />
                        {detail.info.installed_at || 'Reciente'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[12px] font-semibold text-[#334155] block mb-[4px]">Dirección de Instalación</span>
                    <div className="p-[12px] rounded-[8px] bg-white border border-[#e2e8f0] flex items-start gap-[8px] text-[13px] text-[#0f172a]">
                      <MapPin size={16} className="text-[#0066ff] shrink-0 mt-[2px]" />
                      <span>{detail.info.address || 'Sin dirección registrada'}</span>
                    </div>
                  </div>

                  <div className="p-[14px] rounded-[8px] bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-[#1e40af] block">Plan de Internet FTTH</span>
                      <span className="text-[16px] font-bold text-[#1e40af]">{detail.info.plan}</span>
                      <span className="text-[11px] text-[#3b82f6] block">Fibra Óptica Simétrica Monomodo</span>
                    </div>
                    <Badge variant="info">Activo</Badge>
                  </div>
                </div>
              )}

              {/* TAB 2: CONEXIÓN ÓPTICA */}
              {activeTab === 'connection' && (
                <div className="flex flex-col gap-[16px]">
                  {detail.connection ? (
                    <>
                      <div className="p-[16px] rounded-[10px] border border-[#bfdbfe] bg-[#eff6ff]/50 flex flex-col gap-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[8px]">
                            <Network size={18} className="text-[#0066ff]" />
                            <span className="text-[14px] font-bold text-[#0f172a]">
                              {detail.connection.nap_code} — {detail.connection.nap_name}
                            </span>
                          </div>
                          <Badge variant="blue">Puerto {detail.connection.port_number}</Badge>
                        </div>
                        <p className="text-[12px] text-[#64748b]">{detail.connection.address}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-[12px]">
                        <div className="p-[12px] rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
                          <span className="text-[11px] text-[#64748b] block">Splitter Óptico</span>
                          <span className="text-[14px] font-bold text-[#0f172a]">
                            Ratio {detail.connection.splitter_ratio}
                          </span>
                        </div>
                        <div className="p-[12px] rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
                          <span className="text-[11px] text-[#64748b] block">Capacidad de Caja</span>
                          <span className="text-[14px] font-bold text-[#0f172a]">
                            {detail.connection.total_ports} Puertos
                          </span>
                        </div>
                      </div>

                      <div className="p-[12px] rounded-[8px] bg-white border border-[#e2e8f0] flex flex-col gap-[6px]">
                        <span className="text-[11px] font-semibold text-[#64748b]">Acometida Drop Exterior</span>
                        <span className="text-[12px] text-[#334155]">
                          Cable drop preconectorizado SC/APC monomodo G.657A2 hacia roseta óptica interior.
                        </span>
                      </div>

                      <Link href="/mapa" className="w-full">
                        <Button variant="outline" size="sm" className="w-full gap-[6px]">
                          <MapPin size={14} />
                          Localizar en Visor Cartográfico GIS
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="py-[40px] text-center text-[#64748b]">
                      <Network size={28} className="mx-auto mb-[8px] text-[#94a3b8]" />
                      <p className="text-[13px]">El cliente aún no está asignado a ninguna Caja NAP.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EQUIPO ONT / SMARTOLT */}
              {activeTab === 'equipment' && (
                <div className="flex flex-col gap-[16px]">
                  {detail.equipment ? (
                    <>
                      {/* Estado y SN */}
                      <div className="p-[16px] rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] flex flex-col gap-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[8px]">
                            <Cpu size={18} className="text-[#0066ff]" />
                            <span className="text-[14px] font-bold text-[#0f172a]">
                              {detail.equipment.sn}
                            </span>
                          </div>
                          <Badge
                            variant={
                              detail.equipment.status === 'Online'
                                ? 'success'
                                : detail.equipment.status === 'LOS'
                                ? 'critical'
                                : 'warning'
                            }
                          >
                            {detail.equipment.status}
                          </Badge>
                        </div>
                        <div className="text-[12px] text-[#64748b] flex flex-wrap gap-x-[16px] gap-y-[4px]">
                          <span>OLT: {detail.equipment.olt_name || 'Huawei MA5800'}</span>
                          <span>Tarjeta: {detail.equipment.board}</span>
                          <span>Puerto PON: {detail.equipment.port}</span>
                          <span>ONU ID: #{detail.equipment.onu_number}</span>
                        </div>
                      </div>

                      {/* Potencia Óptica Rx / Tx */}
                      <div className="p-[16px] rounded-[10px] border border-[#bfdbfe] bg-[#eff6ff]/30 flex flex-col gap-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-[#1e40af] flex items-center gap-[6px]">
                            <Activity size={14} />
                            Telemetría Óptica en Vivo
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshSignal}
                            disabled={updatingSignal}
                            className="h-[28px] px-[8px] text-[11px] gap-[4px] bg-white text-[#0066ff]"
                          >
                            <RefreshCw size={12} className={updatingSignal ? 'animate-spin' : ''} />
                            {updatingSignal ? 'Midiendo...' : 'Actualizar Señal'}
                          </Button>
                        </div>

                        {signalMessage && (
                          <div className="text-[11px] text-[#0066ff] font-medium bg-white p-[6px] rounded-[6px] border border-[#bfdbfe]">
                            {signalMessage}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-[12px]">
                          <div className="bg-white p-[12px] rounded-[8px] border border-[#e2e8f0]">
                            <span className="text-[11px] text-[#64748b] block">Potencia Rx (Recepción)</span>
                            <span className="text-[18px] font-bold text-[#0f172a] block">
                              {detail.equipment.signal_rx !== null && detail.equipment.signal_rx !== undefined
                                ? `${Number(detail.equipment.signal_rx).toFixed(2)} dBm`
                                : 'N/A'}
                            </span>
                            <Badge variant={getSignalRxDetails(detail.equipment.signal_rx).badge}>
                              {getSignalRxDetails(detail.equipment.signal_rx).label}
                            </Badge>
                          </div>

                          <div className="bg-white p-[12px] rounded-[8px] border border-[#e2e8f0]">
                            <span className="text-[11px] text-[#64748b] block">Potencia Tx (Transmisión)</span>
                            <span className="text-[18px] font-bold text-[#0f172a] block">
                              {detail.equipment.signal_tx !== null && detail.equipment.signal_tx !== undefined
                                ? `${Number(detail.equipment.signal_tx).toFixed(2)} dBm`
                                : 'N/A'}
                            </span>
                            <span className="text-[10px] text-[#64748b]">Rango normal: +1.5 a +5 dBm</span>
                          </div>
                        </div>

                        {detail.equipment.distance_m && (
                          <div className="text-[11px] text-[#64748b]">
                            Distancia física a la central OLT: <strong>{detail.equipment.distance_m} metros</strong>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-[40px] text-center text-[#64748b]">
                      <Cpu size={28} className="mx-auto mb-[8px] text-[#94a3b8]" />
                      <p className="text-[13px]">Sin dispositivo ONT de SmartOLT vinculado.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HISTORIAL DE EVENTOS */}
              {activeTab === 'history' && (
                <div className="flex flex-col gap-[14px]">
                  {detail.events.length === 0 ? (
                    <p className="text-center text-[#64748b] py-[30px] text-[13px]">
                      No hay eventos registrados en la bitácora técnica.
                    </p>
                  ) : (
                    <div className="relative pl-[20px] border-l-2 border-[#e2e8f0] flex flex-col gap-[16px] my-[10px]">
                      {detail.events.map((evt) => (
                        <div key={evt.id} className="relative">
                          <div className="absolute -left-[27px] top-[2px] w-[12px] h-[12px] rounded-full bg-[#0066ff] border-2 border-white" />
                          <div>
                            <span className="text-[11px] font-mono text-[#64748b] block">
                              {new Date(evt.occurred_at).toLocaleString('es-PE')}
                            </span>
                            <span className="text-[13px] font-bold text-[#0f172a] capitalize block">
                              {evt.type}
                            </span>
                            <p className="text-[12px] text-[#475569] mt-[2px]">{evt.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-[20px] py-[14px] bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Ficha
          </Button>
        </div>
      </div>
    </div>
  );
};
