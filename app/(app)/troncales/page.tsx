'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function TroncalesPage() {
  const tramosDemo = [
    {
      code: 'TR-012',
      name: 'Troncal Jr. Bolognesi - San José',
      zone: 'Chiclayo Centro',
      fibers: 144,
      length: '850 m (0.85 km)',
      color: '#0066ff',
      status: 'Activo',
    },
    {
      code: 'TR-013',
      name: 'Troncal Av. José Balta - Santa Victoria',
      zone: 'Chiclayo Centro',
      fibers: 96,
      length: '1,120 m (1.12 km)',
      color: '#ff7700',
      status: 'Activo',
    },
    {
      code: 'TR-014',
      name: 'Distribución Norte Federico Villarreal',
      zone: 'Chiclayo Norte',
      fibers: 48,
      length: '580 m (0.58 km)',
      color: '#00cc44',
      status: 'Activo',
    },
  ];

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Trazados y Cables Troncales</h1>
          <p className="text-[13px] text-[#64748b]">
            Gestión de cables troncales FTTH según codificación TIA-598 de 12 a 144 hilos.
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
            <span>Nuevo trazado</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="relative w-full max-w-[320px]">
            <Search className="w-[14px] h-[14px] text-[#94a3b8] absolute left-[10px] top-[10px]" />
            <input
              type="text"
              placeholder="Buscar por código, zona o ruta..."
              className="w-full pl-[32px] pr-[12px] py-[6px] text-[12px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <span className="text-[12px] text-[#64748b]">
            Mostrando <strong>{tramosDemo.length}</strong> tramos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[10px] px-[16px] font-semibold">Código</th>
                <th className="py-[10px] px-[16px] font-semibold">Nombre / Ruta</th>
                <th className="py-[10px] px-[16px] font-semibold">Zona</th>
                <th className="py-[10px] px-[16px] font-semibold">Capacidad</th>
                <th className="py-[10px] px-[16px] font-semibold">Longitud</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
                <th className="py-[10px] px-[16px] font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {tramosDemo.map((t) => (
                <tr key={t.code} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-[12px] px-[16px] font-semibold text-[#153b68]">
                    <div className="flex items-center gap-[6px]">
                      <span
                        className="w-[10px] h-[10px] rounded-full inline-block"
                        style={{ backgroundColor: t.color }}
                      />
                      {t.code}
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px] text-[#334155] font-medium">{t.name}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">{t.zone}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">
                    <span className="font-semibold text-[#153b68]">{t.fibers}</span> hilos (TIA-598)
                  </td>
                  <td className="py-[12px] px-[16px] font-mono text-[#0f172a]">{t.length}</td>
                  <td className="py-[12px] px-[16px]">
                    <Badge variant="success" size="sm">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-[12px] px-[16px] text-right">
                    <Link
                      href="/mapa"
                      className="inline-flex items-center gap-[4px] text-[12px] text-[#0066ff] hover:underline font-medium"
                    >
                      <span>Inspeccionar</span>
                      <ArrowRight className="w-[12px] h-[12px]" />
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
