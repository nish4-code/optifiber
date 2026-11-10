'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, MapPin, Activity, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

function ClientesContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const clientesDemo = [
    {
      id: '1',
      code: 'CLI-001',
      name: 'Restaurante El Cántaro SAC',
      dni_ruc: '20512345678',
      phone: '974829102',
      address: 'Jr. Bolognesi 345, Chiclayo',
      plan: 'Fibra Pro 300 Mbps',
      nap: 'NAP-01 (P1)',
      sn_onu: 'ZTEG98765432',
      rx_power: '-19.2 dBm',
      status: 'Activo',
    },
    {
      id: '2',
      code: 'CLI-002',
      name: 'Carlos Mendoza Ramos',
      dni_ruc: '45892103',
      phone: '979112233',
      address: 'Jr. Bolognesi 350 Dpto 2, Chiclayo',
      plan: 'Fibra Hogar 200 Mbps',
      nap: 'NAP-01 (P2)',
      sn_onu: 'HWTC12345678',
      rx_power: '-21.4 dBm',
      status: 'Activo',
    },
    {
      id: '3',
      code: 'CLI-003',
      name: 'Clínica Dental San José',
      dni_ruc: '20601293847',
      phone: '974003344',
      address: 'Jr. San José 412, Chiclayo',
      plan: 'Fibra Empresa 500 Mbps',
      nap: 'NAP-02 (P3)',
      sn_onu: 'ZTEG11223344',
      rx_power: '-18.7 dBm',
      status: 'Activo',
    },
    {
      id: '4',
      code: 'CLI-004',
      name: 'Hotel Costa del Sol Chiclayo',
      dni_ruc: '20102938475',
      phone: '974556677',
      address: 'Av. Balta 720, Chiclayo',
      plan: 'Fibra Dedicada 1 Gbps',
      nap: 'NAP-03 (P4)',
      sn_onu: 'HWTC99887766',
      rx_power: '-17.5 dBm',
      status: 'Activo',
    },
    {
      id: '10',
      code: 'CLI-010',
      name: 'María Elena Silva',
      dni_ruc: '08923451',
      phone: '974998811',
      address: 'Calle Los Tumbos 210, Santa Victoria',
      plan: 'Fibra Hogar 150 Mbps',
      nap: 'NAP-04 (P1)',
      sn_onu: 'ZTEG55443322',
      rx_power: '-22.1 dBm',
      status: 'Activo',
    },
  ];

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Abonados y Clientes FTTH</h1>
          <p className="text-[13px] text-[#64748b]">
            Padrón de clientes vinculados a puertos NAP y telemetría óptica de ONUs en SmartOLT.
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
            <span>Nuevo cliente</span>
          </Button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] shadow-xs">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="relative w-full max-w-[320px]">
            <Search className="w-[14px] h-[14px] text-[#94a3b8] absolute left-[10px] top-[10px]" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI/RUC, teléfono o SN ONU..."
              className="w-full pl-[32px] pr-[12px] py-[6px] text-[12px] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <span className="text-[12px] text-[#64748b]">
            Mostrando <strong>{clientesDemo.length}</strong> abonados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                <th className="py-[10px] px-[16px] font-semibold">Código</th>
                <th className="py-[10px] px-[16px] font-semibold">Cliente / Razón Social</th>
                <th className="py-[10px] px-[16px] font-semibold">DNI / RUC</th>
                <th className="py-[10px] px-[16px] font-semibold">Plan Contratado</th>
                <th className="py-[10px] px-[16px] font-semibold">Caja NAP</th>
                <th className="py-[10px] px-[16px] font-semibold">ONU / Potencia Rx</th>
                <th className="py-[10px] px-[16px] font-semibold">Estado</th>
                <th className="py-[10px] px-[16px] font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {clientesDemo.map((c) => {
                const isHighlighted = selectedId === c.id;
                return (
                  <tr
                    key={c.code}
                    className={`hover:bg-[#f8fafc] transition-colors ${
                      isHighlighted ? 'bg-[#0066ff]/5' : ''
                    }`}
                  >
                    <td className="py-[12px] px-[16px] font-semibold text-[#153b68]">
                      {c.code}
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="font-medium text-[#153b68]">{c.name}</div>
                      <div className="text-[11px] text-[#94a3b8]">{c.address}</div>
                    </td>
                    <td className="py-[12px] px-[16px] font-mono text-[#475569]">{c.dni_ruc}</td>
                    <td className="py-[12px] px-[16px] text-[#334155]">{c.plan}</td>
                    <td className="py-[12px] px-[16px]">
                      <span className="px-[8px] py-[2px] bg-[#059669]/10 text-[#059669] text-[11px] font-semibold rounded-[4px]">
                        {c.nap}
                      </span>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex items-center gap-[6px]">
                        <Wifi className="w-[12px] h-[12px] text-[#0066ff]" />
                        <span className="font-mono text-[12px]">{c.rx_power}</span>
                      </div>
                      <div className="text-[10px] text-[#94a3b8] font-mono">{c.sn_onu}</div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <Badge variant="success" size="sm">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <Link
                        href="/mapa"
                        className="inline-flex items-center gap-[4px] text-[12px] text-[#0066ff] hover:underline font-medium"
                      >
                        <Activity className="w-[12px] h-[12px]" />
                        <span>Detalles</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="p-[24px]">Cargando módulo de clientes...</div>}>
      <ClientesContent />
    </Suspense>
  );
}
