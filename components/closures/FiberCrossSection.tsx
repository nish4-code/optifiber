'use client';

import React, { useState } from 'react';
import { TIA598_COLORS } from './FiberColorLegend';

interface FiberCrossSectionProps {
  totalCapacity?: number;
  onSelectStrand?: (globalNumber: number) => void;
}

export const FiberCrossSection: React.FC<FiberCrossSectionProps> = ({
  totalCapacity = 144,
  onSelectStrand,
}) => {
  const [selectedBuffer, setSelectedBuffer] = useState<number>(1);
  const [hoveredStrand, setHoveredStrand] = useState<{
    buffer: number;
    strand: number;
    global: number;
    name: string;
  } | null>(null);

  // Cantidad de tubos buffers según capacidad (ej. 144 -> 12 tubos, 48 -> 4 tubos, 96 -> 8 tubos)
  const bufferCount = Math.min(12, Math.ceil(totalCapacity / 12));
  const activeBuffers = TIA598_COLORS.slice(0, bufferCount);

  // Cálculo de posiciones polares en SVG
  const calculateCirclePos = (index: number, total: number, radius: number, cx: number, cy: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const currentBufferColor = TIA598_COLORS[selectedBuffer - 1] || TIA598_COLORS[0];

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-[20px] shadow-xs flex flex-col gap-[16px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[6px] border-b border-[#f1f5f9] pb-[12px]">
        <div>
          <h3 className="text-[14px] font-bold text-[#0f172a]">
            Corte Transversal Dual de Fibra Óptica (TIA-598-D)
          </h3>
          <p className="text-[12px] text-[#64748b]">
            Visualización concéntrica de los 12 tubos buffer holgados y matriz interna de 12 hilos sílice.
          </p>
        </div>
        <div className="flex items-center gap-[6px] text-[12px]">
          <span className="text-[#64748b]">Buffer activo:</span>
          <span
            className="px-[8px] py-[2px] rounded-[6px] text-white font-semibold text-[11px] shadow-2xs"
            style={{ backgroundColor: currentBufferColor.hex }}
          >
            Tubo {selectedBuffer} — {currentBufferColor.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] items-center">
        {/* Diagrama 1: Cable General con los 12 Tubos Buffer */}
        <div className="flex flex-col items-center">
          <span className="text-[12px] font-semibold text-[#475569] mb-[8px]">
            1. Distribución de Tubos Buffer en Cable ({totalCapacity} Hilos)
          </span>

          <div className="relative w-[240px] h-[240px]">
            <svg viewBox="0 0 240 240" className="w-full h-full select-none">
              {/* Chaqueta externa de PE */}
              <circle cx="120" cy="120" r="110" fill="#1e293b" stroke="#334155" strokeWidth="3" />
              {/* Capa de protección interna */}
              <circle cx="120" cy="120" r="98" fill="#0f172a" />
              {/* Gel antihumedad */}
              <circle cx="120" cy="120" r="92" fill="#1e3a5f" opacity="0.3" />
              {/* Elemento central de tracción dieléctrico (FRP) */}
              <circle cx="120" cy="120" r="26" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
              <text x="120" y="124" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                FRP
              </text>

              {/* 12 Tubos Buffer */}
              {activeBuffers.map((b, i) => {
                const pos = calculateCirclePos(i, bufferCount, 62, 120, 120);
                const isSelected = selectedBuffer === b.position;

                return (
                  <g
                    key={b.position}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedBuffer(b.position)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 17 : 14}
                      fill={b.hex}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={b.textColor}
                    >
                      B{b.position}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <span className="text-[11px] text-[#64748b] mt-[6px]">
            Haz clic en un tubo para inspeccionar sus hilos
          </span>
        </div>

        {/* Diagrama 2: Detalle Ampliado de los 12 Hilos del Tubo Seleccionado */}
        <div className="flex flex-col items-center">
          <span className="text-[12px] font-semibold text-[#475569] mb-[8px]">
            2. Matriz Interna: Tubo {selectedBuffer} ({currentBufferColor.name})
          </span>

          <div className="relative w-[240px] h-[240px]">
            <svg viewBox="0 0 240 240" className="w-full h-full select-none">
              {/* Pared del tubo buffer seleccionado */}
              <circle
                cx="120"
                cy="120"
                r="110"
                fill={currentBufferColor.hex}
                stroke="#0f172a"
                strokeWidth="4"
                opacity="0.85"
              />
              {/* Cavidad interior del tubo rellena de gel hidrófugo */}
              <circle cx="120" cy="120" r="96" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

              {/* Centro de la cavidad */}
              <circle cx="120" cy="120" r="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
              <text x="120" y="123" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#64748b">
                GEL
              </text>

              {/* 12 Hilos de Fibra Óptica Sílice TIA-598 */}
              {TIA598_COLORS.map((strand, i) => {
                const pos = calculateCirclePos(i, 12, 60, 120, 120);
                const globalNum = (selectedBuffer - 1) * 12 + strand.position;
                const isHovered = hoveredStrand?.global === globalNum;

                return (
                  <g
                    key={strand.position}
                    className="cursor-pointer transition-transform"
                    onMouseEnter={() =>
                      setHoveredStrand({
                        buffer: selectedBuffer,
                        strand: strand.position,
                        global: globalNum,
                        name: strand.name,
                      })
                    }
                    onMouseLeave={() => setHoveredStrand(null)}
                    onClick={() => onSelectStrand?.(globalNum)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHovered ? 15 : 12}
                      fill={strand.hex}
                      stroke={isHovered ? '#0066ff' : strand.border ? '#cbd5e1' : '#ffffff'}
                      strokeWidth={isHovered ? 3 : 1.5}
                      className="transition-all"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={strand.textColor}
                    >
                      {strand.position}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tooltip de Hilo */}
          <div className="h-[28px] mt-[6px] flex items-center justify-center">
            {hoveredStrand ? (
              <span className="text-[12px] font-semibold text-[#0066ff] bg-[#eff6ff] px-[10px] py-[3px] rounded-full border border-[#bfdbfe]">
                Hilo {hoveredStrand.strand} ({hoveredStrand.name}) — Global: #{hoveredStrand.global}
              </span>
            ) : (
              <span className="text-[11px] text-[#94a3b8]">
                Pasa el cursor sobre un hilo para ver su número global
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
