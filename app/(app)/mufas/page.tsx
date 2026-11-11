'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin, GitCommit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function MufasPage() {
  const mufasDemo = [
    {
      code: 'MUFA-01',
      name: 'Mufa Primaria Parque Principal',
      type: 'Domo',
      mount: 'Poste Concreto',
      capacity: 144,
      reserve: '30 m',
      status: 'Operativo',
    },
    {
      code: 'MUFA-02',
      name: 'Mufa Empalme Bolognesi Oeste',
      type: 'Horizontal',
      mount: 'Cámara Subterránea',
      capacity: 96,
      reserve: '20 m',
      status: 'Operativo',
    },
    {
      code: 'MUFA-03',
      name: 'Mufa Derivación Santa Victoria',
      type: 'Domo',
      mount: 'Poste Concreto',
      capacity: 48,
      reserve: '15 m',
      status: 'Operativo',
    },
  ];

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Mufas de Empalme Óptico</h1>
          <p className="text-[13px] text-[#64748b]">
            Registro de cierres de empalme, bandejas de fusión y reservas técnicas de fibra.
          </p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Link href="/mapa">
            <Button variant="outline" size="sm" className="gap-[6px]">
              <MapPin className="w-[14px] h-[14px]" />
              <span>Ver en mapa</span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" className="gap-[6px]">
            <Plus className="w-[14px] h-[14px]" />
            <span>Nueva mufa</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="relative w-full max-w-[320px]">
            <Search className="w-[14px] h-[14px] text-[#94a3b8] absolute left-[10px] top-[10px]" />
            <input
              type="text"
              placeholder="Buscar por código, tipo o instalación..."
              className="w-full pl-[32px] pr-[12px] py-[6px] text-[12px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <span className="text-[12px] text-[#64748b]">
            Mostrando <strong>{mufasDemo.length}</strong> mufas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[10px] px-[16px] font-semibold">Código</th>
                <th className="py-[10px] px-[16px] font-semibold">Nombre / Ubicación</th>
                <th className="py-[10px] px-[16px] font-semibold">Tipo</th>
                <th className="py-[10px] px-[16px] font-semibold">Montaje</th>
                <th className="py-[10px] px-[16px] font-semibold">Capacidad de Fusión</th>
                <th className="py-[10px] px-[16px] font-semibold">Reserva</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
                <th className="py-[10px] px-[16px] font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {mufasDemo.map((mufa) => (
                <tr key={mufa.code} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-[12px] px-[16px] font-semibold text-[#153b68]">
                    <div className="flex items-center gap-[6px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#153b68] border border-[#38bdf8] inline-block" />
                      {mufa.code}
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px] text-[#334155] font-medium">{mufa.name}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">{mufa.type}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">{mufa.mount}</td>
                  <td className="py-[12px] px-[16px] font-mono text-[#0f172a]">
                    {mufa.capacity} hilos
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <span className="px-[8px] py-[2px] bg-[#8b5cf6]/10 text-[#8b5cf6] text-[11px] font-semibold rounded-[4px]">
                      {mufa.reserve}
                    </span>
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <Badge variant="success" size="sm">
                      {mufa.status}
                    </Badge>
                  </td>
                  <td className="py-[12px] px-[16px] text-right">
                    <Link
                      href="/mapa"
                      className="inline-flex items-center gap-[4px] text-[12px] text-[#0066ff] hover:underline font-medium"
                    >
                      <GitCommit className="w-[12px] h-[12px]" />
                      <span>Matriz de Fusión</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
