'use client';

import React from 'react';

export const TIA598_COLORS = [
  { position: 1, name: 'Azul', enName: 'Blue', hex: '#0066CC', textColor: '#ffffff' },
  { position: 2, name: 'Naranja', enName: 'Orange', hex: '#FF6600', textColor: '#ffffff' },
  { position: 3, name: 'Verde', enName: 'Green', hex: '#009933', textColor: '#ffffff' },
  { position: 4, name: 'Marrón', enName: 'Brown', hex: '#8B4513', textColor: '#ffffff' },
  { position: 5, name: 'Gris', enName: 'Slate', hex: '#808080', textColor: '#ffffff' },
  { position: 6, name: 'Blanco', enName: 'White', hex: '#F8FAFC', textColor: '#0f172a', border: true },
  { position: 7, name: 'Rojo', enName: 'Red', hex: '#E60000', textColor: '#ffffff' },
  { position: 8, name: 'Negro', enName: 'Black', hex: '#1E293B', textColor: '#ffffff' },
  { position: 9, name: 'Amarillo', enName: 'Yellow', hex: '#FFD700', textColor: '#0f172a' },
  { position: 10, name: 'Violeta', enName: 'Violet', hex: '#8A2BE2', textColor: '#ffffff' },
  { position: 11, name: 'Rosa', enName: 'Rose', hex: '#FF69B4', textColor: '#ffffff' },
  { position: 12, name: 'Turquesa', enName: 'Aqua', hex: '#00CED1', textColor: '#0f172a' },
];

export const FiberColorLegend: React.FC = () => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-[16px] shadow-xs flex flex-col gap-[10px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[4px]">
        <h3 className="text-[13px] font-bold text-[#0f172a]">
          Código Internacional de Colores TIA-598-D
        </h3>
        <span className="text-[11px] font-mono text-[#64748b] bg-[#f8fafc] px-[8px] py-[2px] rounded-[4px] border border-[#e2e8f0]">
          Hilo Global = ((Buffer - 1) × 12) + Hilo Local
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-[6px]">
        {TIA598_COLORS.map((c) => (
          <div
            key={c.position}
            className="flex items-center gap-[6px] p-[6px] rounded-[6px] bg-[#f8fafc] border border-[#f1f5f9] hover:border-[#cbd5e1] transition-all"
          >
            <span
              className={`w-[14px] h-[14px] rounded-full shrink-0 shadow-2xs ${
                c.border ? 'border border-[#cbd5e1]' : ''
              }`}
              style={{ backgroundColor: c.hex }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold text-[#0f172a]">{c.position}. {c.name}</span>
              <span className="text-[9px] text-[#64748b]">{c.enName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
