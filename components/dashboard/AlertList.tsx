import React from 'react';
import Link from 'next/link';
import type { AlertItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface AlertListProps {
  alerts?: AlertItem[];
}

const defaultAlerts: AlertItem[] = [
  {
    id: 1,
    title: 'NAP-04: Capacidad al 87%',
    description:
      'Queda sólo 1 puerto libre (7 de 8 asignados). Se requiere añadir splitter secundario.',
    severity: 'critical',
    type: 'capacidad_nap',
    created_at: 'Hace 18 min',
    resolved_at: null,
  },
  {
    id: 2,
    title: 'Mantenimiento en MUF-08',
    description:
      'Fusión de hilo de respaldo programada para las 15:00 hrs. Afectación temporal nula.',
    severity: 'warning',
    type: 'mantenimiento',
    created_at: 'Hoy 15:00',
    resolved_at: null,
  },
  {
    id: 3,
    title: 'Instalación Pendiente',
    description:
      'Jr. Bolognesi 458: Cliente solicita activación antes de las 18:00 hrs.',
    severity: 'info',
    type: 'acometida',
    created_at: 'Asignada C-2',
    resolved_at: null,
  },
];

export function AlertList({ alerts = defaultAlerts }: AlertListProps) {
  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const severityStyles = {
    critical: {
      bg: 'bg-[#fff1f2]',
      border: 'border-[#fecdd3]',
      title: 'text-[#9f1239]',
      badgeBg: 'bg-[#fecdd3]',
      badgeText: 'text-[#881337]',
      badgeLabel: 'Crítico',
      link: 'text-[#0066ff]',
      borderDivider: 'border-[#fecdd3]/60',
    },
    warning: {
      bg: 'bg-[#fffbeb]',
      border: 'border-[#fde68a]',
      title: 'text-[#92400e]',
      badgeBg: 'bg-[#fde68a]',
      badgeText: 'text-[#78350f]',
      badgeLabel: 'Programado',
      link: 'text-[#b45309]',
      borderDivider: 'border-[#fde68a]/60',
    },
    info: {
      bg: 'bg-[#eff6ff]',
      border: 'border-[#bfdbfe]',
      title: 'text-[#1e40af]',
      badgeBg: 'bg-[#bfdbfe]',
      badgeText: 'text-[#1e3a8a]',
      badgeLabel: 'Acometida',
      link: 'text-[#0066ff]',
      borderDivider: 'border-[#bfdbfe]/60',
    },
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[16px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[12px]">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-[12px] border-b border-[#f1f5f9]">
        <div className="flex items-center gap-[8px]">
          <span className="w-[10px] h-[10px] rounded-full bg-[#ef4444]" />
          <h3 className="text-[14px] font-semibold text-[#1e293b]">
            Alertas e Incidentes
          </h3>
        </div>
        <span className="bg-[#ffe4e6] text-[#ef4444] text-[11px] font-bold px-[8px] py-[2px] rounded-full">
          {displayAlerts.length} eventos
        </span>
      </div>

      {/* Lista de Alertas */}
      <div className="flex flex-col gap-[10px]">
        {displayAlerts.map((alert) => {
          const style =
            severityStyles[alert.severity as keyof typeof severityStyles] ||
            severityStyles.info;

          return (
            <div
              key={alert.id}
              className={cn(
                'border rounded-[12px] p-[12px] flex flex-col gap-[6px]',
                style.bg,
                style.border
              )}
            >
              {/* Título y Badge */}
              <div className="flex items-center justify-between">
                <span className={cn('text-[12px] font-bold leading-tight', style.title)}>
                  {alert.title}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold px-[6px] py-[2px] rounded-[4px] leading-none',
                    style.badgeBg,
                    style.badgeText
                  )}
                >
                  {style.badgeLabel}
                </span>
              </div>

              {/* Descripción */}
              <p className="text-[12px] text-[#475569] leading-relaxed">
                {alert.description}
              </p>

              {/* Pie con tiempo y enlace de acción */}
              <div
                className={cn(
                  'pt-[8px] mt-[2px] border-t flex items-center justify-between text-[11px]',
                  style.borderDivider
                )}
              >
                <span className="text-[#94a3b8]">{alert.created_at}</span>
                <Link
                  href={alert.severity === 'critical' ? '/naps' : '/mufas'}
                  className={cn('font-semibold hover:underline', style.link)}
                >
                  {alert.severity === 'critical'
                    ? 'Gestionar caja'
                    : alert.severity === 'warning'
                    ? 'Ver detalles'
                    : 'Ver orden'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
