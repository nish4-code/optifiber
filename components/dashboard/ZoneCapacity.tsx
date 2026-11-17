import React from 'react';
import type { ZoneCapacityItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface ZoneCapacityProps {
  zones?: ZoneCapacityItem[];
  totalPorts?: number;
}

export function ZoneCapacity({ zones = [], totalPorts = 0 }: ZoneCapacityProps) {
  const displayZones = zones;
  const calculatedTotal = zones.reduce((acc, z) => acc + z.total_ports, 0) || totalPorts;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h3 className="text-[14px] font-semibold text-[#1e293b]">
            Capacidad y Ocupación por Zonas
          </h3>
          <p className="text-[12px] text-[#64748b]">
            Distribución de splitters y puertos libres en cajas NAP
          </p>
        </div>
        <span className="bg-[#f1f5f9] text-[#475569] text-[12px] font-medium px-[10px] py-[4px] rounded-[6px]">
          Total puertos: {calculatedTotal}
        </span>
      </div>

      {/* Lista de Barras de Distribución */}
      <div className="flex flex-col gap-[14px]">
        {displayZones.length === 0 ? (
          <div className="py-[20px] text-center text-[12px] text-[#64748b] border border-dashed border-[#e2e8f0] rounded-[12px]">
            No hay zonas con cajas NAP registradas aún.
          </div>
        ) : displayZones.map((zone) => {
          const pct = Math.round(zone.occupancy_percentage);
          const isHigh = pct >= 80;
          const isMedium = pct >= 60 && pct < 80;

          const barColor = isHigh
            ? 'bg-[#ef4444]'
            : isMedium
            ? 'bg-[#f59e0b]'
            : 'bg-[#10b981]';

          const textColor = isHigh
            ? 'text-[#ef4444]'
            : isMedium
            ? 'text-[#f59e0b]'
            : 'text-[#059669]';

          return (
            <div key={zone.id} className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-[#334155]">{zone.name}</span>
                <span className="text-[#64748b]">
                  {zone.occupied_ports} / {zone.total_ports} puertos{' '}
                  <strong className={cn('font-bold', textColor)}>({pct}%)</strong>
                </span>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full h-[10px] bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', barColor)}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
