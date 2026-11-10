'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  MapPin,
  GitBranch,
  Box,
  Layers,
  Users,
  Bookmark,
  BarChart3,
  Settings,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

const navItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mapa de red', href: '/mapa', icon: Map },
  { name: 'Zonas de red', href: '/zonas', icon: MapPin, badge: 4 },
  { name: 'Troncales', href: '/troncales', icon: GitBranch, badge: 7 },
  { name: 'Cajas NAP', href: '/naps', icon: Box, badge: 12 },
  { name: 'Mufas', href: '/mufas', icon: Layers, badge: 28 },
  { name: 'Clientes', href: '/clientes', icon: Users, badge: 186 },
  { name: 'Reservas', href: '/reservas', icon: Bookmark, badge: 3 },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[256px] bg-white border-r border-[#8aabe0] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-[0px_4px_6px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col">
        {/* Header con Logo Fiberplus */}
        <div className="h-[70px] px-[20px] flex items-center border-b border-[#ef4444]/20">
          <BrandLogo size="md" />
        </div>

        {/* Lista de Navegación */}
        <nav className="p-[12px] flex flex-col gap-[4px]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  'flex items-center justify-between px-[14px] py-[10px] rounded-[8px] text-[14px] transition-all duration-150',
                  isActive
                    ? 'bg-[#0066ff] text-white font-medium shadow-[0px_4px_6px_-1px_rgba(59,130,246,0.3)]'
                    : 'text-[#153b68] hover:bg-[#f1f5f9]'
                )}
              >
                <div className="flex items-center gap-[12px]">
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px]',
                      isActive ? 'text-white' : 'text-[#153b68]'
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'px-[8px] py-[2px] rounded-full text-[11px] font-semibold border',
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-white text-[#153b68] border-[#cbd5e1]'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Estado en Vivo */}
      <div className="bg-[#153b68] border-t border-[#1e293b] px-[16px] py-[14px]">
        <div className="flex items-center gap-[8px]">
          <span className="relative flex h-[10px] w-[10px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-[#10b981]"></span>
          </span>
          <span className="text-[12px] text-[#34d399] font-medium tracking-[0.2px]">
            Sistema en línea
          </span>
        </div>
      </div>
    </aside>
  );
}
