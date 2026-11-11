'use client';

import React from 'react';
import { Cable, CheckCircle2, CircleDot, Activity } from 'lucide-react';
import { SpliceTelemetry } from '@/types/closures';

interface SpliceKpisProps {
  telemetry: SpliceTelemetry;
}

export const SpliceKpis: React.FC<SpliceKpisProps> = ({ telemetry }) => {
  const avgLoss = telemetry.average_loss_db || 0.05;
  const isLossOptimal = avgLoss <= 0.1;

  const kpis = [
    {
      title: 'Capacidad Total',
      value: `${telemetry.total_fibers} Hilos`,
      subtitle: telemetry.buffers_config || '12 Tubos × 12 Hilos',
      icon: <Cable size={20} className="text-[#0066ff]" />,
      bg: 'bg-[#0066ff]/10',
    },
    {
      title: 'Hilos Fusionados',
      value: telemetry.fused_fibers,
      subtitle: `${Math.round((telemetry.fused_fibers / (telemetry.total_fibers || 1)) * 100)}% de ocupación`,
      icon: <CheckCircle2 size={20} className="text-[#10b981]" />,
      bg: 'bg-[#10b981]/10',
    },
    {
      title: 'Hilos Disponibles',
      value: telemetry.available_fibers,
      subtitle: 'Listos para derivación',
      icon: <CircleDot size={20} className="text-[#8b5cf6]" />,
      bg: 'bg-[#8b5cf6]/10',
    },
    {
      title: 'Atenuación Promedio',
      value: `${avgLoss} dB`,
      subtitle: isLossOptimal ? 'Calidad de fusión óptima' : 'Atenuación elevada',
      icon: <Activity size={20} className={isLossOptimal ? 'text-[#10b981]' : 'text-[#f59e0b]'} />,
      bg: isLossOptimal ? 'bg-[#10b981]/10' : 'bg-[#f59e0b]/10',
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
