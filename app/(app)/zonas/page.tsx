'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Search, Map, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import type { MapZone } from '@/types/map';

const INITIAL_ZONES: MapZone[] = [
  {
    id: 1,
    code: 'ZON-BOLOG',
    name: 'Chiclayo Centro (Jr. Bolognesi)',
    description: 'Sector urbano Centro - Chiclayo (NAP-01 a NAP-04)',
    center_lat: -6.7725,
    center_lng: -79.8402,
    zoom_level: 16,
    city: 'Chiclayo (Lambayeque)',
    trunk_cables_count: 2,
    nap_boxes_count: 4,
    splice_closures_count: 2,
    customers_count: 58,
  },
  {
    id: 2,
    code: 'ZON-BALTA',
    name: 'Chiclayo (Av. Balta / Boulevard)',
    description: 'Sector comercial Av. Balta (NAP-05 a NAP-08)',
    center_lat: -6.776,
    center_lng: -79.844,
    zoom_level: 16,
    city: 'Chiclayo (Lambayeque)',
    trunk_cables_count: 1,
    nap_boxes_count: 4,
    splice_closures_count: 1,
    customers_count: 64,
  },
  {
    id: 3,
    code: 'ZON-SANJOSE',
    name: 'Chiclayo (San José - Sáenz Peña)',
    description: 'Sector residencial San José (NAP-09 a NAP-12)',
    center_lat: -6.769,
    center_lng: -79.837,
    zoom_level: 16,
    city: 'Chiclayo (Lambayeque)',
    trunk_cables_count: 1,
    nap_boxes_count: 4,
    splice_closures_count: 1,
    customers_count: 42,
  },
  {
    id: 4,
    code: 'ZON-KISH',
    name: 'Red de Kishuara (OLT Apurímac)',
    description: 'Zona troncal principal y nodo central de distribución FTTH',
    center_lat: -13.6441,
    center_lng: -73.0871,
    zoom_level: 15,
    city: 'Apurímac (Andahuaylas)',
    trunk_cables_count: 3,
    nap_boxes_count: 8,
    splice_closures_count: 4,
    customers_count: 22,
  },
];

export default function ZonasPage() {
  const [zones, setZones] = useState<MapZone[]>(INITIAL_ZONES);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadZones() {
      try {
        const res = await apiClient<MapZone[] | { data: MapZone[] }>('/zones');
        const list = Array.isArray(res) ? res : res.data;
        if (list?.length) {
          setZones(
            list.map((z) => ({
              ...z,
              center_lat: Number(z.center_lat),
              center_lng: Number(z.center_lng),
            }))
          );
        }
      } catch {
        // En modo offline mantiene INITIAL_ZONES
      }
    }
    loadZones();
  }, []);

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
      (z.city && z.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Zonas y Regiones de Cobertura</h1>
          <p className="text-[13px] text-[#64748b]">
            Sectores geográficos, provincias y nodos de red FTTH vinculados a OLTs de SmartOLT.
          </p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Link href="/mapa">
            <Button variant="outline" size="sm" className="gap-[6px]">
              <Map className="w-[14px] h-[14px]" />
              <span>Ver mapa general</span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" className="gap-[6px]">
            <Plus className="w-[14px] h-[14px]" />
            <span>Nueva zona / ciudad</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px]">
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
                <th className="py-[10px] px-[16px] font-semibold">Región / Ciudad</th>
                <th className="py-[10px] px-[16px] font-semibold">Coordenadas Centro</th>
                <th className="py-[10px] px-[16px] font-semibold">Infraestructura</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
                <th className="py-[10px] px-[16px] font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {filteredZones.map((z) => (
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
                  <td className="py-[12px] px-[16px] text-[#334155] font-medium">
                    {z.city || 'Lambayeque'}
                  </td>
                  <td className="py-[12px] px-[16px] font-mono text-[11px] text-[#475569]">
                    {z.center_lat.toFixed(4)}, {z.center_lng.toFixed(4)}
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <div className="flex items-center gap-[6px] text-[11px]">
                      <span className="px-[6px] py-[2px] bg-[#0066ff]/10 text-[#0066ff] font-semibold rounded-[3px]">
                        {z.trunk_cables_count ?? 1} troncales
                      </span>
                      <span className="px-[6px] py-[2px] bg-[#059669]/10 text-[#059669] font-semibold rounded-[3px]">
                        {z.nap_boxes_count ?? 4} NAPs
                      </span>
                      <span className="px-[6px] py-[2px] bg-[#8b5cf6]/10 text-[#8b5cf6] font-semibold rounded-[3px]">
                        {z.customers_count ?? 30} abonados
                      </span>
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <Badge variant="success" size="sm">
                      Operativo
                    </Badge>
                  </td>
                  <td className="py-[12px] px-[16px] text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenOnMap(z)}
                      className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#0066ff]/10 hover:bg-[#0066ff]/20 text-[#0066ff] text-[12px] font-semibold rounded-[6px] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-[12px] h-[12px]" />
                      <span>Abrir en mapa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
