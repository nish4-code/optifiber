'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightAdornment, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-[13px] font-medium text-[#334155] mb-[6px]">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-[#94a3b8]">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'w-full bg-white border border-[#e2e8f0] rounded-[8px] text-[14px] text-[#0f172a] placeholder-[#94a3b8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] disabled:bg-[#f8fafc] disabled:cursor-not-allowed',
              icon ? 'pl-[44px]' : 'pl-[14px]',
              rightAdornment ? 'pr-[44px]' : 'pr-[14px]',
              'py-[10px]',
              error && 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20',
              className
            )}
            {...props}
          />
          {rightAdornment && (
            <div className="absolute inset-y-0 right-0 pr-[14px] flex items-center">
              {rightAdornment}
            </div>
          )}
        </div>
        {error && <p className="mt-[4px] text-[12px] text-[#ef4444]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
