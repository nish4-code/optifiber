'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ReservasPage() {
  const reservasDemo = [
    {
      code: 'RES-01',
      name: 'Reserva Poste Bolognesi 345',
      cable: 'TR-012 (Troncal Jr. Bolognesi)',
      zone: 'Chiclayo Centro',
      meters: '30 m',
      type: 'Bucle en Poste de Concreto',
      status: 'Disponible',
    },
    {
      code: 'RES-02',
      name: 'Reserva Cámara Subterránea San José',
      cable: 'TR-012 (Troncal Jr. Bolognesi)',
      zone: 'Chiclayo Centro',
      meters: '20 m',
      type: 'Cámara Subterránea',
      status: 'Disponible',
    },
    {
      code: 'RES-03',
      name: 'Reserva Postes Santa Victoria',
      cable: 'TR-013 (Av. Balta)',
      zone: 'Chiclayo Centro',
      meters: '15 m',
      type: 'Cruceta Aérea',
      status: 'Disponible',
    },
  ];

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Reservas Técnicas de Fibra</h1>
          <p className="text-[13px] text-[#64748b]">
            Seguimiento de bucles de mantenimiento, reservas en cámaras y excedentes de cable para cortes o empalmes.
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
            <span>Nueva reserva</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="relative w-full max-w-[320px]">
            <Search className="w-[14px] h-[14px] text-[#94a3b8] absolute left-[10px] top-[10px]" />
            <input
              type="text"
              placeholder="Buscar por código, cable o ubicación..."
              className="w-full pl-[32px] pr-[12px] py-[6px] text-[12px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <span className="text-[12px] text-[#64748b]">
            Mostrando <strong>{reservasDemo.length}</strong> reservas técnicas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[10px] px-[16px] font-semibold">Código</th>
                <th className="py-[10px] px-[16px] font-semibold">Nombre / Ubicación</th>
                <th className="py-[10px] px-[16px] font-semibold">Cable Troncal</th>
                <th className="py-[10px] px-[16px] font-semibold">Zona</th>
                <th className="py-[10px] px-[16px] font-semibold">Longitud Excedente</th>
                <th className="py-[10px] px-[16px] font-semibold">Tipo Montaje</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {reservasDemo.map((r) => (
                <tr key={r.code} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-[12px] px-[16px] font-semibold text-[#153b68]">
                    <div className="flex items-center gap-[6px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#8b5cf6] inline-block" />
                      {r.code}
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px] text-[#334155] font-medium">{r.name}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">{r.cable}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">{r.zone}</td>
                  <td className="py-[12px] px-[16px] font-mono font-semibold text-[#8b5cf6]">
                    {r.meters}
                  </td>
                  <td className="py-[12px] px-[16px] text-[#475569]">{r.type}</td>
                  <td className="py-[12px] px-[16px]">
                    <Badge variant="success" size="sm">
                      {r.status}
                    </Badge>
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
