'use client';

import React from 'react';
import { Hand, PenTool, PlusCircle, Undo2, Trash2, Check, X, Ruler, Square, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GisToolMode } from '@/types/map';

interface DrawingToolsCardProps {
  toolMode: GisToolMode;
  onToolModeChange: (mode: GisToolMode) => void;
  onUndoPoint?: () => void;
  onReversePoints?: () => void;
  onClearPoints?: () => void;
  onSaveTramo?: () => void;
  onSaveZone?: () => void;
  onCancel?: () => void;
  pointCount?: number;
}

export function DrawingToolsCard({
  toolMode,
  onToolModeChange,
  onUndoPoint,
  onReversePoints,
  onClearPoints,
  onSaveTramo,
  onSaveZone,
  onCancel,
  pointCount = 0,
}: DrawingToolsCardProps) {
  return (
    <div className="w-[180px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-lg overflow-hidden backdrop-blur-md">
      {/* Cabecera */}
      <div className="px-[12px] py-[8px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
        <span className="text-[11px] font-bold text-[#153b68] tracking-wide uppercase">
          Herramientas
        </span>
        <span className="text-[10px] text-[#64748b] font-medium">
          {pointCount > 0 ? `${pointCount} pts` : toolMode === 'select' ? 'Manita' : toolMode}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="p-[6px] flex flex-col gap-[3px]">
        <button
          type="button"
          onClick={() => onToolModeChange('select')}
          title="Modo Manita: mover mapa y hacer zoom sin perder el trazo (Tecla H)"
          className={cn(
            'flex items-center justify-between gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'select'
              ? 'bg-[#153b68] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <span className="flex items-center gap-[8px]">
            <Hand className="w-[13px] h-[13px] shrink-0" />
            <span>Mover</span>
          </span>
          <kbd className="text-[9px] px-[4px] py-[1px] rounded bg-black/10 font-mono">H</kbd>
        </button>
        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'draw_trunk' ? 'select' : 'draw_trunk')}
          title="Dibujar tramo de fibra (Tecla P · Mantén Espacio para mover)"
          className={cn(
            'flex items-center justify-between gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'draw_trunk'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <span className="flex items-center gap-[8px]">
            <PenTool className="w-[13px] h-[13px] shrink-0" />
            <span>Dibujar tramo</span>
          </span>
          <kbd className="text-[9px] px-[4px] py-[1px] rounded bg-black/10 font-mono">P</kbd>
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'measure' ? 'select' : 'measure')}
          title="Medir distancia (Tecla M)"
          className={cn(
            'flex items-center justify-between gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'measure'
              ? 'bg-[#10b981] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <span className="flex items-center gap-[8px]">
            <Ruler className="w-[13px] h-[13px] shrink-0" />
            <span>Medir distancia</span>
          </span>
          <kbd className="text-[9px] px-[4px] py-[1px] rounded bg-black/10 font-mono">M</kbd>
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'add_nap' ? 'select' : 'add_nap')}
          title="Añadir Caja NAP en el mapa (Tecla N)"
          className={cn(
            'flex items-center justify-between gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'add_nap'
              ? 'bg-[#f59e0b] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <span className="flex items-center gap-[8px]">
            <PlusCircle className="w-[13px] h-[13px] shrink-0" />
            <span>Añadir NAP</span>
          </span>
          <kbd className="text-[9px] px-[4px] py-[1px] rounded bg-black/10 font-mono">N</kbd>
        </button>

        <button
          type="button"
          onClick={() => onToolModeChange(toolMode === 'draw_zone' ? 'select' : 'draw_zone')}
          title="Delimitar polígono de zona en el mapa (Tecla Z)"
          className={cn(
            'flex items-center justify-between gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-medium transition-colors text-left cursor-pointer',
            toolMode === 'draw_zone'
              ? 'bg-[#8b5cf6] text-white shadow-xs'
              : 'text-[#334155] hover:bg-[#f1f5f9]'
          )}
        >
          <span className="flex items-center gap-[8px]">
            <Square className="w-[13px] h-[13px] shrink-0" />
            <span>Delimitar zona</span>
          </span>
          <kbd className="text-[9px] px-[4px] py-[1px] rounded bg-black/10 font-mono">Z</kbd>
        </button>

        <div className="h-px bg-[#f1f5f9] my-[2px]" />

        {(toolMode === 'draw_trunk' || toolMode === 'draw_zone' || toolMode === 'measure' || pointCount > 0) && (
          <>
            <button
              type="button"
              onClick={onUndoPoint}
              disabled={pointCount === 0}
              title="Deshacer último punto (Ctrl+Z o clic derecho)"
              className="flex items-center gap-[8px] px-[10px] py-[5px] rounded-[6px] text-[12px] text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-40 cursor-pointer"
            >
              <Undo2 className="w-[13px] h-[13px]" />
              <span>Deshacer punto</span>
            </button>

            {onReversePoints && (
              <button
                type="button"
                onClick={onReversePoints}
                disabled={pointCount < 2}
                title="Invertir sentido para continuar desde el otro extremo"
                className="flex items-center gap-[8px] px-[10px] py-[5px] rounded-[6px] text-[12px] text-[#0066ff] hover:bg-[#eff6ff] disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeftRight className="w-[13px] h-[13px]" />
                <span>Invertir extremo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClearPoints}
              disabled={pointCount === 0}
              title="Eliminar todos los puntos del trazo actual"
              className="flex items-center gap-[8px] px-[10px] py-[5px] rounded-[6px] text-[12px] text-[#f59e0b] hover:bg-[#fffbeb] disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-[13px] h-[13px]" />
              <span>Limpiar trazo</span>
            </button>

            {toolMode === 'draw_zone' ? (
              <button
                type="button"
                onClick={onSaveZone}
                disabled={pointCount < 3}
                className="flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-semibold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-[13px] h-[13px]" />
                <span>Guardar zona</span>
              </button>
            ) : (
              (toolMode === 'draw_trunk' || (toolMode === 'select' && pointCount >= 2)) && (
                <button
                  type="button"
                  onClick={onSaveTramo}
                  disabled={pointCount < 2}
                  className="flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] text-[12px] font-semibold bg-[#10b981] hover:bg-[#059669] text-white disabled:opacity-40 cursor-pointer"
                >
                  <Check className="w-[13px] h-[13px]" />
                  <span>Guardar tramo</span>
                </button>
              )
            )}
          </>
        )}

        {(toolMode !== 'select' || pointCount > 0) && (
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
