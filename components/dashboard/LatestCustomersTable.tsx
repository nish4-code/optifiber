import React from 'react';
import Link from 'next/link';
import type { LatestCustomerItem } from '@/types/dashboard';
import { Badge } from '@/components/ui/Badge';

interface LatestCustomersTableProps {
  customers?: LatestCustomerItem[];
  totalCount?: number;
}

const defaultCustomers: LatestCustomerItem[] = [
  {
    id: 1,
    code: 'C-001',
    name: 'Juan Pérez García',
    nap: 'NAP-04',
    port: 'P1',
    plan: '300 Mbps Fibra Simétrica',
    status: 'activo',
    installed_at: '2026-11-01',
  },
  {
    id: 2,
    code: 'C-148',
    name: 'María López Torres',
    nap: 'NAP-04',
    port: 'P2',
    plan: '500 Mbps Dúo Fibra',
    status: 'activo',
    installed_at: '2026-11-03',
  },
  {
    id: 3,
    code: 'C-004',
    name: 'Ana Fernández Silva',
    nap: 'NAP-04',
    port: 'P4',
    plan: '1 Gbps Corporativo Pro',
    status: 'activo',
    installed_at: '2026-11-05',
  },
];

export function LatestCustomersTable({
  customers = defaultCustomers,
  totalCount = 186,
}: LatestCustomersTableProps) {
  const displayCustomers = customers.length > 0 ? customers : defaultCustomers;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[16px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Cabecera */}
      <div className="px-[20px] py-[14px] border-b border-[#f1f5f9] flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#1e293b]">
          Últimos Clientes Conectados
        </h3>
        <Link
          href="/clientes"
          className="text-[12px] text-[#0066ff] hover:text-[#0052cc] font-medium transition-colors"
        >
          Ver todos ({totalCount})
        </Link>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-medium">
            <tr>
              <th className="py-[10px] px-[16px]"># Código</th>
              <th className="py-[10px] px-[16px]">Abonado / Nombre</th>
              <th className="py-[10px] px-[16px]">Caja NAP / Puerto</th>
              <th className="py-[10px] px-[16px]">Plan Contratado</th>
              <th className="py-[10px] px-[16px]">Estado</th>
              <th className="py-[10px] px-[16px] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {displayCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                <td className="py-[12px] px-[16px] font-semibold text-[#0f172a]">
                  {c.code}
                </td>
                <td className="py-[12px] px-[16px] text-[#1e293b] font-medium">
                  {c.name}
                </td>
                <td className="py-[12px] px-[16px]">
                  <span className="bg-[#ecfdf5] text-[#047857] px-[8px] py-[3px] rounded-[4px] font-medium text-[11px]">
                    {c.nap} • {c.port || 'P1'}
                  </span>
                </td>
                <td className="py-[12px] px-[16px] text-[#475569]">
                  {c.plan}
                </td>
                <td className="py-[12px] px-[16px]">
                  <Badge
                    variant={c.status === 'activo' ? 'success' : c.status === 'suspendido' ? 'critical' : 'warning'}
                    pill
                  >
                    {c.status === 'activo' ? 'Activo' : c.status === 'suspendido' ? 'Suspendido' : 'Pendiente'}
                  </Badge>
                </td>
                <td className="py-[12px] px-[16px] text-right">
                  <Link
                    href={`/clientes?id=${c.id}`}
                    prefetch={false}
                    className="text-[#0066ff] hover:text-[#0052cc] font-medium transition-colors"
                  >
                    Detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
