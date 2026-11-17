'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

interface MiniMapProps {
  napsCount?: number;
  closuresCount?: number;
  customersCount?: number;
}

export function MiniMap({
  napsCount = 0,
  closuresCount = 0,
  customersCount = 0,
}: MiniMapProps) {
  const totalNodes = napsCount + closuresCount + customersCount;

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
            Monitor Geográfico de Nodos (Red FTTH)
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

      {/* Visor de Resumen Geográfico */}
      <div className="relative h-[260px] bg-[#121820] overflow-hidden select-none flex items-center justify-center p-[24px]">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {totalNodes === 0 ? (
          <div className="relative z-10 flex flex-col items-center text-center gap-[10px] max-w-[360px]">
            <div className="w-[42px] h-[42px] rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#60a5fa]">
              <MapPin className="w-[20px] h-[20px]" />
            </div>
            <p className="text-[14px] font-semibold text-white">
              Sin nodos registrados en el mapa todavía
            </p>
            <p className="text-[12px] text-[#94a3b8]">
              Abre el visor cartográfico GIS para delimitar zonas, trazar troncales de fibra y registrar cajas NAP o mufas.
            </p>
            <Link
              href="/mapa"
              className="mt-[4px] inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] bg-[#0066ff] hover:bg-[#0052cc] text-white text-[12px] font-semibold transition-colors"
            >
              <span>Ir al Mapa GIS</span>
              <ArrowUpRight className="w-[14px] h-[14px]" />
            </Link>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-3 gap-[16px] w-full max-w-[540px]">
            <div className="bg-[#0f172a]/90 border border-[#34d399]/50 rounded-[12px] p-[16px] flex flex-col items-center gap-[4px] backdrop-blur-sm">
              <span className="text-[24px] font-bold text-[#6ee7b7]">{napsCount}</span>
              <span className="text-[11px] font-medium text-[#cbd5e1]">Cajas NAP</span>
            </div>
            <div className="bg-[#0f172a]/90 border border-[#fbbf24]/50 rounded-[12px] p-[16px] flex flex-col items-center gap-[4px] backdrop-blur-sm">
              <span className="text-[24px] font-bold text-[#fcd34d]">{closuresCount}</span>
              <span className="text-[11px] font-medium text-[#cbd5e1]">Mufas</span>
            </div>
            <div className="bg-[#0f172a]/90 border border-[#60a5fa]/50 rounded-[12px] p-[16px] flex flex-col items-center gap-[4px] backdrop-blur-sm">
              <span className="text-[24px] font-bold text-[#93c5fd]">{customersCount}</span>
              <span className="text-[11px] font-medium text-[#cbd5e1]">Abonados</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
