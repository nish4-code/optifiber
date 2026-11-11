'use client';

import React from 'react';
import {
  Box,
  Layers,
  Users,
  GitBranch,
  Bookmark,
  AlertTriangle,
  MapPin,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import type { LayerVisibilityState, MapTileMode, MapZone } from '@/types/map';
import { cn } from '@/lib/utils';

interface TopMapControlsProps {
  tileMode: MapTileMode;
  onTileModeChange: (mode: MapTileMode) => void;
  layers: LayerVisibilityState;
  onToggleLayer: (layer: keyof LayerVisibilityState) => void;
  zones?: MapZone[];
  selectedZoneId?: number | null;
  onSelectZone?: (zone: MapZone) => void;
  onFitAllBounds?: () => void;
  counts?: {
    naps: number;
    mufas: number;
    clientes: number;
    troncales: number;
    reservas: number;
    alertas: number;
  };
}

export function TopMapControls({
  tileMode,
  onTileModeChange,
  layers,
  onToggleLayer,
  zones = [],
  selectedZoneId,
  onSelectZone,
  onFitAllBounds,
  counts = { naps: 12, mufas: 28, clientes: 186, troncales: 7, reservas: 3, alertas: 3 },
}: TopMapControlsProps) {
  const layerButtons: Array<{
    key: keyof LayerVisibilityState;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    color: string;
  }> = [
    { key: 'naps', label: 'NAP', icon: Box, count: counts.naps, color: 'text-[#059669]' },
    { key: 'mufas', label: 'Mufas', icon: Layers, count: counts.mufas, color: 'text-[#d97706]' },
    { key: 'clientes', label: 'Clientes', icon: Users, count: counts.clientes, color: 'text-[#0066ff]' },
    { key: 'troncales', label: 'Troncales', icon: GitBranch, count: counts.troncales, color: 'text-[#10b981]' },
    { key: 'reservas', label: 'Reservas', icon: Bookmark, count: counts.reservas, color: 'text-[#8b5cf6]' },
    { key: 'alertas', label: 'Alertas', icon: AlertTriangle, count: counts.alertas, color: 'text-[#ef4444]' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-[8px] sm:gap-[10px] bg-white/95 backdrop-blur-md p-[6px] rounded-[10px] border border-[#e2e8f0] shadow-md pointer-events-auto">
      {/* Selector de Ciudad / Región / OLT */}
      {zones.length > 0 && (
        <div className="flex items-center gap-[4px] bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-[8px] py-[3px]">
          <MapPin className="w-[14px] h-[14px] text-[#0066ff] shrink-0" />
          <div className="relative flex items-center">
            <select
              value={selectedZoneId || ''}
              onChange={(e) => {
                const zoneId = Number(e.target.value);
                const found = zones.find((z) => z.id === zoneId);
                if (found && onSelectZone) onSelectZone(found);
              }}
              className="appearance-none bg-transparent text-[12px] font-bold text-[#153b68] pr-[20px] focus:outline-none cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-[12px] h-[12px] text-[#64748b] absolute right-0 pointer-events-none" />
          </div>

          {/* Botón de auto-encuadre */}
          {onFitAllBounds && (
            <button
              type="button"
              onClick={onFitAllBounds}
              title="Encuadrar toda la red de la zona"
              className="ml-[4px] p-[3px] text-[#64748b] hover:text-[#0066ff] hover:bg-[#e2e8f0] rounded-[4px] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-[12px] h-[12px]" />
            </button>
          )}
        </div>
      )}

      {/* Switch Mapa / Satélite */}
      <div className="flex items-center bg-[#f1f5f9] p-[2px] rounded-[6px] border border-[#e2e8f0]">
        <button
          type="button"
          onClick={() => onTileModeChange('map')}
          className={cn(
            'px-[10px] py-[4px] rounded-[4px] text-[12px] font-semibold transition-all cursor-pointer',
            tileMode === 'map'
              ? 'bg-white text-[#153b68] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          )}
        >
          Mapa
        </button>
        <button
          type="button"
          onClick={() => onTileModeChange('satellite')}
          className={cn(
            'px-[10px] py-[4px] rounded-[4px] text-[12px] font-semibold transition-all cursor-pointer',
            tileMode === 'satellite'
              ? 'bg-[#153b68] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          )}
        >
          Satélite
        </button>
      </div>

      <div className="h-[20px] w-px bg-[#e2e8f0] hidden sm:block" />

      {/* Filtros de Capas con Pills */}
      <div className="flex flex-wrap items-center gap-[6px]">
        {layerButtons.map((btn) => {
          const isActive = layers[btn.key];
          const Icon = btn.icon;

          return (
            <button
              key={btn.key}
              type="button"
              onClick={() => onToggleLayer(btn.key)}
              className={cn(
                'flex items-center gap-[6px] px-[8px] py-[4px] rounded-[6px] text-[12px] font-medium border transition-all cursor-pointer select-none',
                isActive
                  ? 'bg-white text-[#0f172a] border-[#cbd5e1] shadow-xs'
                  : 'bg-[#f8fafc] text-[#94a3b8] border-[#e2e8f0] opacity-60'
              )}
            >
              <Icon className={cn('w-[13px] h-[13px]', isActive ? btn.color : 'text-[#94a3b8]')} />
              <span>{btn.label}</span>
              <span
                className={cn(
                  'text-[10px] font-bold px-[5px] py-px rounded-full',
                  isActive ? 'bg-[#f1f5f9] text-[#475569]' : 'bg-[#e2e8f0] text-[#94a3b8]'
                )}
              >
                {btn.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
