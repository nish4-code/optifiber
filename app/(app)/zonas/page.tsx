'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Search, Map, ExternalLink, Edit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import type { MapZone } from '@/types/map';
import { ZoneFormModal } from '@/components/zones/ZoneFormModal';

export default function ZonasPage() {
  const [zones, setZones] = useState<MapZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState<MapZone | null>(null);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    apiClient<MapZone[]>('/zones')
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : [];
        setZones(
          list.map((z) => ({
            ...z,
            center_lat: Number(z.center_lat || 0),
            center_lng: Number(z.center_lng || 0),
          }))
        );
      })
      .catch((err) => {
        console.error('Error cargando zonas:', err);
      })
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

  const handleOpenOnMap = (zone: MapZone) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('optifiber_active_zone', zone.id.toString());
    }
    router.push('/mapa');
  };

  const filteredZones = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (z.description && z.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Zonas y Regiones de Cobertura</h1>
          <p className="text-[13px] text-[#64748b]">
            Sectores geográficos, provincias y nodos de red FTTH vinculados a OLTs de SmartOLT.
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
            Refrescar
          </Button>
          <Link href="/mapa">
            <Button variant="outline" size="sm" className="gap-[6px]">
              <Map className="w-[14px] h-[14px]" />
              <span>Ver mapa general</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setZoneToEdit(null);
              setIsModalOpen(true);
            }}
            className="gap-[6px]"
          >
            <Plus className="w-[14px] h-[14px]" />
            <span>Nueva zona / ciudad</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px] gap-[12px]">
          <div className="relative w-full max-w-[320px]">
            <Search className="w-[14px] h-[14px] text-[#94a3b8] absolute left-[10px] top-[10px]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, zona o ciudad..."
              className="w-full pl-[32px] pr-[12px] py-[6px] text-[12px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <span className="text-[12px] text-[#64748b]">
            Mostrando <strong>{filteredZones.length}</strong> zonas activas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[10px] px-[16px] font-semibold">Código</th>
                <th className="py-[10px] px-[16px] font-semibold">Zona / Sector</th>
                <th className="py-[10px] px-[16px] font-semibold">Coordenadas Centro</th>
                <th className="py-[10px] px-[16px] font-semibold">Infraestructura</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
                <th className="py-[10px] px-[16px] font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-[32px] text-center text-[#64748b]">
                    Cargando zonas geográficas...
                  </td>
                </tr>
              ) : filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-[32px] text-center text-[#64748b]">
                    No se encontraron zonas registradas.
                  </td>
                </tr>
              ) : (
                filteredZones.map((z) => (
                  <tr key={z.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-[12px] px-[16px] font-semibold text-[#153b68]">
                      <div className="flex items-center gap-[6px]">
                        <MapPin className="w-[13px] h-[13px] text-[#0066ff]" />
                        <span>{z.code}</span>
                      </div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="font-medium text-[#153b68]">{z.name}</div>
                      <div className="text-[11px] text-[#94a3b8]">{z.description}</div>
                    </td>
                    <td className="py-[12px] px-[16px] font-mono text-[11px] text-[#475569]">
                      {z.center_lat ? Number(z.center_lat).toFixed(4) : '-'},{' '}
                      {z.center_lng ? Number(z.center_lng).toFixed(4) : '-'}
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex items-center gap-[6px] text-[11px]">
                        <span className="px-[6px] py-[2px] bg-[#0066ff]/10 text-[#0066ff] font-semibold rounded-[3px]">
                          {z.trunk_cables_count ?? 0} troncales
                        </span>
                        <span className="px-[6px] py-[2px] bg-[#059669]/10 text-[#059669] font-semibold rounded-[3px]">
                          {z.nap_boxes_count ?? 0} NAPs
                        </span>
                        <span className="px-[6px] py-[2px] bg-[#8b5cf6]/10 text-[#8b5cf6] font-semibold rounded-[3px]">
                          {z.customers_count ?? 0} abonados
                        </span>
                      </div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <Badge variant="success" size="sm">
                        Operativo
                      </Badge>
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <div className="flex items-center justify-end gap-[6px]">
                        <button
                          type="button"
                          onClick={() => {
                            setZoneToEdit(z);
                            setIsModalOpen(true);
                          }}
                          className="p-[6px] text-[#64748b] hover:text-[#0f172a] rounded-[4px] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                          title="Editar zona"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenOnMap(z)}
                          className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#0066ff]/10 hover:bg-[#0066ff]/20 text-[#0066ff] text-[12px] font-semibold rounded-[6px] transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-[12px] h-[12px]" />
                          <span>Abrir en mapa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ZoneFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleRefresh}
          zoneToEdit={zoneToEdit}
        />
      )}
    </div>
  );
}
