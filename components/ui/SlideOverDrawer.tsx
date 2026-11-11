'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  '2xl': 'max-w-3xl',
};

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0f172a]/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidthMap[maxWidth]} bg-white h-full shadow-2xl flex flex-col border-l border-[#e2e8f0] animate-in slide-in-from-right duration-300`}
      >
        {/* Header */}
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            {icon && (
              <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center font-bold text-[14px] shrink-0">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-[8px]">
                <h2 className="text-[16px] font-bold text-[#0f172a]">{title}</h2>
                {badge}
              </div>
              {subtitle && (
                <p className="text-[12px] text-[#64748b] leading-tight mt-[2px]">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-[32px] h-[32px] rounded-[6px] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-[20px]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-[20px] py-[14px] border-t border-[#f1f5f9] bg-[#f8fafc] flex items-center justify-end gap-[10px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
