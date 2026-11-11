'use client';

import React, { useState } from 'react';
import { GitBranch, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { MapTrunk } from '@/types/map';

interface BottomTramosTableProps {
  trunks: MapTrunk[];
  onSelectTrunk?: (trunk: MapTrunk) => void;
  selectedTrunkId?: number | null;
}

export function BottomTramosTable({
  trunks,
  onSelectTrunk,
  selectedTrunkId,
}: BottomTramosTableProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalKm = trunks.reduce((acc, t) => acc + Number(t.length_km || 0), 0);

  return (
    <div className="bg-white/95 backdrop-blur-md border border-[#e2e8f0] rounded-[10px] shadow-lg overflow-hidden transition-all duration-300">
      {/* Header colapsable */}
      <div
        className="px-[16px] py-[10px] bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-[10px]">
          <div className="w-[28px] h-[28px] rounded-[6px] bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff]">
            <GitBranch className="w-[15px] h-[15px]" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#153b68]">
              Tramos y Trazados de Fibra
            </h4>
            <span className="text-[11px] text-[#64748b]">
              {trunks.length} tramos registrados • {totalKm.toFixed(2)} km de tendido
            </span>
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            className="text-[#64748b] hover:text-[#0f172a] p-[4px] rounded-[4px] transition-colors"
            aria-label={isExpanded ? 'Colapsar tabla' : 'Expandir tabla'}
          >
            {isExpanded ? (
              <ChevronDown className="w-[16px] h-[16px]" />
            ) : (
              <ChevronUp className="w-[16px] h-[16px]" />
            )}
          </button>
        </div>
      </div>

      {/* Contenido colapsable */}
      {isExpanded && (
        <div className="max-h-[160px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f5f9] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[6px] px-[12px] font-semibold">Código</th>
                <th className="py-[6px] px-[12px] font-semibold">Nombre / Ruta</th>
                <th className="py-[6px] px-[12px] font-semibold">Fibras</th>
                <th className="py-[6px] px-[12px] font-semibold">Longitud</th>
                <th className="py-[6px] px-[12px] font-semibold">Estado</th>
                <th className="py-[6px] px-[12px] font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[12px]">
              {trunks.map((trunk) => {
                const isSelected = selectedTrunkId === trunk.id;
                const km = Number(trunk.length_km || 0);
                return (
                  <tr
                    key={trunk.id}
                    className={`hover:bg-[#f8fafc] transition-colors ${
                      isSelected ? 'bg-[#0066ff]/5' : ''
                    }`}
                  >
                    <td className="py-[8px] px-[12px] font-semibold text-[#153b68]">
                      <div className="flex items-center gap-[6px]">
                        <span
                          className="w-[8px] h-[8px] rounded-full inline-block shrink-0"
                          style={{ backgroundColor: trunk.map_color || '#0066ff' }}
                        />
                        {trunk.code}
                      </div>
                    </td>
                    <td className="py-[8px] px-[12px] text-[#334155] font-medium">
                      {trunk.name}
                    </td>
                    <td className="py-[8px] px-[12px] text-[#64748b]">
                      {trunk.fiber_count} hilos
                    </td>
                    <td className="py-[8px] px-[12px] font-mono text-[#0f172a]">
                      {(km * 1000).toFixed(0)} m ({km.toFixed(2)} km)
                    </td>
                    <td className="py-[8px] px-[12px]">
                      <Badge variant="success" size="sm">
                        {trunk.status || 'Activo'}
                      </Badge>
                    </td>
                    <td className="py-[8px] px-[12px] text-right">
                      <button
                        type="button"
                        onClick={() => onSelectTrunk?.(trunk)}
                        className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-[4px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#153b68] text-[11px] font-medium transition-colors cursor-pointer"
                        title="Centrar tramo en mapa"
                      >
                        <Navigation className="w-[11px] h-[11px]" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {trunks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-[16px] text-center text-[12px] text-[#94a3b8]">
                    No hay tramos de fibra registrados en esta zona.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
