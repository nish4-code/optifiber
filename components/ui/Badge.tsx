import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'blue';
  size?: 'sm' | 'md';
  pill?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  pill = false,
  className,
}: BadgeProps) {
  const variants = {
    success: 'bg-[#ecfdf5] text-[#047857] border-[#d1fae5]',
    warning: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
    critical: 'bg-[#ffe4e6] text-[#881337] border-[#fecdd3]',
    info: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
    neutral: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
    blue: 'bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20',
  };

  const sizes = {
    sm: 'text-[10px] px-[6px] py-[2px]',
    md: 'text-[12px] px-[8px] py-[3px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border border-solid whitespace-nowrap',
        pill ? 'rounded-full' : 'rounded-[4px]',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
