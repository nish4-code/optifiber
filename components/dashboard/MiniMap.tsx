'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Minus, User } from 'lucide-react';

export function MiniMap() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[16px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Cabecera del Monitor */}
      <div className="px-[18px] py-[12px] border-b border-[#f1f5f9] flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <span className="relative flex h-[10px] w-[10px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-[#10b981]"></span>
          </span>
          <h3 className="text-[14px] font-semibold text-[#1e293b]">
            Monitor Geográfico de Nodos (FTTH Chiclayo)
          </h3>
          <span className="bg-[#f1f5f9] text-[#475569] text-[11px] font-medium px-[8px] py-[2px] rounded-[6px]">
            En vivo
          </span>
        </div>

        <Link
          href="/mapa"
          className="text-[12px] text-[#0066ff] hover:text-[#0052cc] font-medium flex items-center gap-[4px] transition-colors"
        >
          <span>Abrir Mapa de Red Completo</span>
          <ArrowUpRight className="w-[14px] h-[14px]" />
        </Link>
      </div>

      {/* Visor SVG Interactivo de Red */}
      <div className="relative h-[320px] bg-[#121820] overflow-hidden select-none">
        {/* Cuadrícula de Fondo */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Trazos de Fibra Óptica (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Línea Troncal Principal (Línea 45 - Chiclayo Centro) */}
          <path
            d="M 60 180 Q 200 120 280 60 T 430 65 T 540 170"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ramal de Distribución a Mufas */}
          <path
            d="M 280 60 L 280 200"
            stroke="#0066ff"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            fill="none"
          />
          <path
            d="M 430 65 L 480 135"
            stroke="#0066ff"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            fill="none"
          />
          {/* Acometidas de Clientes */}
          <path d="M 480 135 L 400 240" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M 480 135 L 480 130" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <path d="M 540 170 L 400 240" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
        </svg>

        {/* Nodo NAP-04 */}
        <div className="absolute top-[32px] left-[240px] bg-[#0f172a]/90 border border-[#34d399]/60 rounded-[8px] p-[6px] flex items-center gap-[8px] shadow-lg backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
          <div className="w-[24px] h-[24px] rounded-[6px] bg-[#10b981]/20 text-[#34d399] flex items-center justify-center text-[10px] font-bold">
            NAP
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6ee7b7] leading-none">NAP-04</span>
            <span className="text-[9px] text-[#94a3b8] leading-tight mt-[2px]">7/8 puertos</span>
          </div>
        </div>

        {/* Nodo MUF-07 */}
        <div className="absolute top-[40px] left-[400px] bg-[#0f172a]/90 border border-[#fbbf24]/60 rounded-[8px] p-[6px] flex items-center gap-[8px] shadow-lg backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
          <div className="w-[24px] h-[24px] rounded-[6px] bg-[#f59e0b]/20 text-[#fbbf24] flex items-center justify-center text-[10px] font-bold">
            MUF
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#fcd34d] leading-none">MUF-07</span>
            <span className="text-[9px] text-[#94a3b8] leading-tight mt-[2px]">24 empalmes</span>
          </div>
        </div>

        {/* Nodo NAP-05 */}
        <div className="absolute top-[144px] left-[500px] bg-[#0f172a]/90 border border-[#34d399]/60 rounded-[8px] p-[6px] flex items-center gap-[8px] shadow-lg backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
          <div className="w-[24px] h-[24px] rounded-[6px] bg-[#10b981]/20 text-[#34d399] flex items-center justify-center text-[10px] font-bold">
            NAP
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6ee7b7] leading-none">NAP-05</span>
            <span className="text-[9px] text-[#94a3b8] leading-tight mt-[2px]">4/8 puertos</span>
          </div>
        </div>

        {/* Nodo MUF-03 */}
        <div className="absolute top-[176px] left-[240px] bg-[#0f172a]/90 border border-[#fbbf24]/60 rounded-[8px] p-[6px] flex items-center gap-[8px] shadow-lg backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
          <div className="w-[24px] h-[24px] rounded-[6px] bg-[#f59e0b]/20 text-[#fbbf24] flex items-center justify-center text-[10px] font-bold">
            MUF
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#fcd34d] leading-none">MUF-03</span>
            <span className="text-[9px] text-[#94a3b8] leading-tight mt-[2px]">Ruta Bolognesi</span>
          </div>
        </div>

        {/* Clientes Conectados */}
        <div
          className="absolute top-[112px] left-[450px] w-[24px] h-[24px] rounded-full bg-[#0066ff] border-2 border-white/60 flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-110 transition-transform"
          title="Cliente C-001 (Juan Pérez)"
        >
          <User className="w-[12px] h-[12px]" />
        </div>

        <div
          className="absolute bottom-[40px] left-[380px] w-[24px] h-[24px] rounded-full bg-[#0066ff] border-2 border-white/60 flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-110 transition-transform"
          title="Cliente C-148 (María López)"
        >
          <User className="w-[12px] h-[12px]" />
        </div>

        {/* Controles de Zoom */}
        <div className="absolute top-[12px] right-[12px] flex flex-col gap-[4px]">
          <button
            type="button"
            className="w-[28px] h-[28px] bg-[#0f172a]/80 border border-[#334155] rounded-[4px] text-white flex items-center justify-center hover:bg-[#1e293b] cursor-pointer transition-colors"
          >
            <Plus className="w-[14px] h-[14px]" />
          </button>
          <button
            type="button"
            className="w-[28px] h-[28px] bg-[#0f172a]/80 border border-[#334155] rounded-[4px] text-white flex items-center justify-center hover:bg-[#1e293b] cursor-pointer transition-colors"
          >
            <Minus className="w-[14px] h-[14px]" />
          </button>
        </div>

        {/* Mini Leyenda Flotante */}
        <div className="absolute bottom-[12px] left-[12px] bg-[#0f172a]/80 border border-[#334155]/60 rounded-[8px] p-[10px] backdrop-blur-md flex flex-col gap-[6px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-[#34d399]" />
              <span className="text-[10px] text-[#cbd5e1]">Caja NAP</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-[#fbbf24]" />
              <span className="text-[10px] text-[#cbd5e1]">Mufa</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-[#60a5fa]" />
              <span className="text-[10px] text-[#cbd5e1]">Abonado</span>
            </div>
          </div>
          <div className="flex items-center gap-[12px] pt-[2px] border-t border-white/10">
            <div className="flex items-center gap-[6px]">
              <span className="w-[12px] h-[2px] bg-[#34d399]" />
              <span className="text-[10px] text-[#94a3b8]">Troncal</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[12px] h-[2px] bg-[#0066ff]" />
              <span className="text-[10px] text-[#94a3b8]">Distribución</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[12px] h-[2px] bg-[#fbbf24]" />
              <span className="text-[10px] text-[#94a3b8]">Acometida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
