import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function BrandLogo({
  showSubtitle = true,
  size = 'md',
  href = '/dashboard',
}: BrandLogoProps) {
  const content = (
    <div className="flex items-center gap-[12px] group">
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className={size === 'lg' ? 'w-[44px] h-[48px]' : size === 'sm' ? 'w-[28px] h-[32px]' : 'w-[36px] h-[40px]'}
          viewBox="0 0 39 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 38C12 28 8 16 2 8C14 14 18 26 15 36"
            stroke="#153b68"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M14 38C22 26 20 12 12 2C24 9 28 22 24 35"
            stroke="#ec1f26"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M24 38C30 28 28 16 22 8C32 14 36 24 34 35"
            stroke="#0066ff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline tracking-[-0.75px]">
          <span
            className={`font-black text-[#153b68] leading-none ${
              size === 'lg' ? 'text-[32px]' : size === 'sm' ? 'text-[20px]' : 'text-[26px]'
            }`}
          >
            Fiber
          </span>
          <span
            className={`font-black italic text-[#ec1f26] leading-none ml-[1px] ${
              size === 'lg' ? 'text-[32px]' : size === 'sm' ? 'text-[20px]' : 'text-[26px]'
            }`}
          >
            plus
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-[#02436c] font-medium tracking-[0.2px] mt-[2px] leading-tight">
            La fibra que une el Perú
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
