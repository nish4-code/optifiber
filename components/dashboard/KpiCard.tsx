import React from 'react';
import { cn } from '@/lib/utils';

interface SubStat {
  label: string;
  value: string | number;
  color?: string;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'critical' | 'info' | 'neutral';
  icon: React.ReactNode;
  iconBgColor?: string;
  subStats?: SubStat[];
  sparkline?: React.ReactNode;
  valueColor?: string;
  borderColor?: string;
}

export function KpiCard({
  title,
  value,
  badgeText,
  badgeVariant = 'success',
  icon,
  iconBgColor = 'bg-[#ecfdf5]',
  subStats,
  sparkline,
  valueColor = 'text-[#0f172a]',
  borderColor = 'border-[#e2e8f0]',
}: KpiCardProps) {
  const badgeColors = {
    success: 'bg-[#ecfdf5] text-[#059669]',
    warning: 'bg-[#fffbeb] text-[#b45309]',
    critical: 'bg-[#ffe4e6] text-[#be123c]',
    info: 'bg-[#eff6ff] text-[#1e40af]',
    neutral: 'bg-[#f1f5f9] text-[#64748b]',
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-[12px] p-[16px] flex flex-col justify-between shadow-[0px_1px_1px_rgba(0,0,0,0.05)] min-h-[160px]',
        borderColor
      )}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold tracking-[0.6px] uppercase text-[#64748b]">
          {title}
        </span>
        <div
          className={cn(
            'w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0',
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>

      {/* Valor principal y badge */}
      <div className="my-[8px]">
        <div className="flex items-baseline gap-[10px]">
          <span className={cn('text-[30px] font-bold tracking-tight leading-none', valueColor)}>
            {value}
          </span>
          {badgeText && (
            <span
              className={cn(
                'text-[12px] font-medium px-[6px] py-[2px] rounded-[4px] leading-tight',
                badgeColors[badgeVariant]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        {sparkline && <div className="mt-[8px]">{sparkline}</div>}
      </div>

      {/* Subestadísticas inferiores */}
      {subStats && subStats.length > 0 && (
        <div className="pt-[10px] border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
          {subStats.map((stat, index) => (
            <span
              key={index}
              className={stat.color || 'text-[#64748b]'}
            >
              <strong className="font-semibold">{stat.value}</strong> {stat.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
