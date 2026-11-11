'use client';

import React from 'react';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';

interface CustomerKpisProps {
  total: number;
  activeCount: number;
  pendingCount: number;
  suspendedCount: number;
}

export const CustomerKpis: React.FC<CustomerKpisProps> = ({
  total,
  activeCount,
  pendingCount,
  suspendedCount,
}) => {
  const kpis = [
    {
      title: 'Total Abonados',
      value: total,
      subtitle: 'Red FTTH Chiclayo & Apurímac',
      icon: <Users size={20} className="text-[#0066ff]" />,
      bg: 'bg-[#0066ff]/10',
    },
    {
      title: 'Servicio Activo',
      value: activeCount,
      subtitle: `${total > 0 ? Math.round((activeCount / total) * 100) : 0}% con conexión estable`,
      icon: <UserCheck size={20} className="text-[#10b981]" />,
      bg: 'bg-[#10b981]/10',
    },
    {
      title: 'Instalaciones Pendientes',
      value: pendingCount,
      subtitle: 'En cola de activación técnica',
      icon: <Clock size={20} className="text-[#f59e0b]" />,
      bg: 'bg-[#f59e0b]/10',
    },
    {
      title: 'Servicio Suspendido',
      value: suspendedCount,
      subtitle: 'Cortes por mora o solicitud',
      icon: <UserX size={20} className="text-[#ef4444]" />,
      bg: 'bg-[#ef4444]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="bg-white border border-[#e2e8f0] rounded-[10px] p-[16px] shadow-xs flex items-center gap-[14px]"
        >
          <div className={`w-[44px] h-[44px] rounded-[10px] ${kpi.bg} flex items-center justify-center shrink-0`}>
            {kpi.icon}
          </div>
          <div>
            <span className="text-[12px] text-[#64748b] block">{kpi.title}</span>
            <span className="text-[20px] font-bold text-[#0f172a] block leading-tight">{kpi.value}</span>
            <span className="text-[11px] text-[#94a3b8]">{kpi.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
