'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary: 'bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-sm',
      secondary: 'bg-[#153b68] hover:bg-[#0f2a4b] text-white',
      outline: 'border border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]',
      ghost: 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
      danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white',
    };

    const sizes = {
      sm: 'text-[12px] px-[10px] py-[6px] gap-[6px]',
      md: 'text-[14px] px-[16px] py-[10px] gap-[8px]',
      lg: 'text-[16px] px-[20px] py-[14px] gap-[10px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
