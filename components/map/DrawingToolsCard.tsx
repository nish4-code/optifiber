'use client';

import React from 'react';
import { PenTool, PlusCircle, Undo2, Check, X, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GisToolMode } from '@/types/map';

interface DrawingToolsCardProps {
  toolMode: GisToolMode;
  onToolModeChange: (mode: GisToolMode) => void;
  onUndoPoint?: () => void;
  onSaveTramo?: () => void;
  onCancel?: () => void;
  pointCount?: number;
}

export function DrawingToolsCard({
  toolMode,
  onToolModeChange,
  onUndoPoint,
  onSaveTramo,
  onCancel,
  pointCount = 0,
}: DrawingToolsCardProps) {
  return (
    <div className="w-[170px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-lg overflow-hidden backdrop-blur-md">
      {/* Cabecera */}
      <div className="px-[12px] py-[8px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
        <span className="text-[11px] font-bold text-[#153b68] tracking-wide uppercase">
          Herramientas
        </span>
        <span className="text-[10px] text-[#64748b] font-medium">
          {toolMode === 'draw_trunk' ? `${pointCount} pts` : toolMode}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="p-[6px] flex flex-col gap-[3px]">
        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'draw_trunk' ? 'select' : 'draw_trunk')}
          className={cn(
            'flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'draw_trunk'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <PenTool className="w-[13px] h-[13px] shrink-0" />
          <span>Dibujar tramo</span>
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'measure' ? 'select' : 'measure')}
          className={cn(
            'flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'measure'
              ? 'bg-[#10b981] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <Ruler className="w-[13px] h-[13px] shrink-0" />
          <span>Medir distancia</span>
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'add_nap' ? 'select' : 'add_nap')}
          className={cn(
            'flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'add_nap'
              ? 'bg-[#f59e0b] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <PlusCircle className="w-[13px] h-[13px] shrink-0" />
          <span>Añadir NAP</span>
        </button>

        <div className="h-px bg-[#f1f5f9] my-[2px]" />

        {toolMode === 'draw_trunk' && (
          <>
            <button
              type="button"
              onClick={onUndoPoint}
              disabled={pointCount === 0}
              className="flex items-center gap-[8px] px-[10px] py-[5px] rounded-[6px] text-[12px] text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-40 cursor-pointer"
            >
              <Undo2 className="w-[13px] h-[13px]" />
              <span>Deshacer punto</span>
            </button>

            <button
              type="button"
              onClick={onSaveTramo}
              disabled={pointCount < 2}
              className="flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-semibold bg-[#10b981] hover:bg-[#059669] text-white disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-[13px] h-[13px]" />
              <span>Guardar tramo</span>
            </button>
          </>
        )}

        {toolMode !== 'select' && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-[8px] px-[10px] py-[5px] rounded-[6px] text-[12px] text-[#ef4444] hover:bg-[#fef2f2] cursor-pointer"
          >
            <X className="w-[13px] h-[13px]" />
            <span>Cancelar</span>
          </button>
        )}
      </div>
    </div>
  );
}
