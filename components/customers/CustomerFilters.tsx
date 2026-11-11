'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ZoneOption } from '@/types/api';
import { NapItem } from '@/types/naps';

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedZone: string;
  onZoneChange: (value: string) => void;
  selectedNap: string;
  onNapChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  zones: ZoneOption[];
  naps: NapItem[];
  onReset: () => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  search,
  onSearchChange,
  selectedZone,
  onZoneChange,
  selectedNap,
  onNapChange,
  selectedStatus,
  onStatusChange,
  zones,
  naps,
  onReset,
}) => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-[16px] shadow-xs flex flex-col md:flex-row gap-[12px] items-stretch md:items-center justify-between">
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Buscar por nombre, código, DNI o teléfono..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-[10px]">
        <select
          value={selectedZone}
          onChange={(e) => onZoneChange(e.target.value)}
          className="h-[38px] px-[12px] text-[13px] text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] cursor-pointer"
        >
          <option value="">Todas las zonas</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id.toString()}>
              {z.name}
            </option>
          ))}
        </select>

        <select
          value={selectedNap}
          onChange={(e) => onNapChange(e.target.value)}
          className="h-[38px] px-[12px] text-[13px] text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] cursor-pointer"
        >
          <option value="">Todas las NAPs</option>
          {naps.map((n) => (
            <option key={n.id} value={n.id.toString()}>
              {n.code} — {n.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-[38px] px-[12px] text-[13px] text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
          <option value="suspendido">Suspendido</option>
        </select>

        {(search || selectedZone || selectedNap || selectedStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-[#64748b] hover:text-[#0f172a] gap-[6px]"
          >
            <RotateCcw size={14} />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
};
