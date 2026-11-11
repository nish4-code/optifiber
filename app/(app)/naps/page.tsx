'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function NapsPage() {
  const napsDemo = [
    {
      code: 'NAP-01',
      name: 'Bolognesi esq. San José',
      ratio: '1:8',
      ports: '7/8',
      pct: 88,
      address: 'Jr. Bolognesi 345, Chiclayo',
      status: 'Operativo',
    },
    {
      code: 'NAP-02',
      name: 'Bolognesi / Av. Saenz Peña',
      ratio: '1:16',
      ports: '12/16',
      pct: 75,
      address: 'Jr. Bolognesi 580, Chiclayo',
      status: 'Operativo',
    },
    {
      code: 'NAP-03',
      name: 'Av. Balta Frente CC Boulevard',
      ratio: '1:8',
      ports: '8/8',
      pct: 100,
      address: 'Av. Balta 720, Chiclayo',
      status: 'Saturado',
    },
    {
      code: 'NAP-04',
      name: 'Santa Victoria - Los Parques',
      ratio: '1:8',
      ports: '3/8',
      pct: 38,
      address: 'Calle Los Tumbos 210, Santa Victoria',
      status: 'Operativo',
    },
  ];

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Cajas de Distribución NAP</h1>
          <p className="text-[13px] text-[#64748b]">
            Monitoreo y administración de cajas terminales ópticas FTTH y asignación de splitters.
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
            <span>Nueva caja NAP</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="relative w-full max-w-[320px]">
            <Search className="w-[14px] h-[14px] text-[#94a3b8] absolute left-[10px] top-[10px]" />
            <input
              type="text"
              placeholder="Buscar por código, dirección o splitter..."
              className="w-full pl-[32px] pr-[12px] py-[6px] text-[12px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <span className="text-[12px] text-[#64748b]">
            Mostrando <strong>{napsDemo.length}</strong> cajas NAP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[10px] px-[16px] font-semibold">Código</th>
                <th className="py-[10px] px-[16px] font-semibold">Nombre / Ubicación</th>
                <th className="py-[10px] px-[16px] font-semibold">Dirección</th>
                <th className="py-[10px] px-[16px] font-semibold">Splitter</th>
                <th className="py-[10px] px-[16px] font-semibold">Ocupación de Puertos</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
                <th className="py-[10px] px-[16px] font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {napsDemo.map((nap) => (
                <tr key={nap.code} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-[12px] px-[16px] font-semibold text-[#153b68]">
                    <div className="flex items-center gap-[6px]">
                      <span className="w-[8px] h-[8px] rounded-[2px] bg-[#059669] inline-block" />
                      {nap.code}
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px] text-[#334155] font-medium">{nap.name}</td>
                  <td className="py-[12px] px-[16px] text-[#64748b]">{nap.address}</td>
                  <td className="py-[12px] px-[16px] font-mono text-[#0f172a]">{nap.ratio}</td>
                  <td className="py-[12px] px-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[80px] bg-[#f1f5f9] rounded-full h-[6px] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            nap.pct === 100
                              ? 'bg-[#ef4444]'
                              : nap.pct >= 80
                              ? 'bg-[#d97706]'
                              : 'bg-[#059669]'
                          }`}
                          style={{ width: `${nap.pct}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-mono text-[#334155]">{nap.ports}</span>
                    </div>
                  </td>
                  <td className="py-[12px] px-[16px]">
                    <Badge variant={nap.pct === 100 ? 'critical' : 'success'} size="sm">
                      {nap.status}
                    </Badge>
                  </td>
                  <td className="py-[12px] px-[16px] text-right">
                    <Link
                      href="/mapa"
                      className="inline-flex items-center gap-[4px] text-[12px] text-[#0066ff] hover:underline font-medium"
                    >
                      <span>Ver en mapa</span>
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
