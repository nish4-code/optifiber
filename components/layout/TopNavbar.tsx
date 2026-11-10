'use client';

import React, { useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface TopNavbarProps {
  averageAttenuation?: number;
  oltBandwidth?: number;
  alertsCount?: number;
}

export function TopNavbar({
  averageAttenuation = -19.4,
  oltBandwidth = 9.84,
  alertsCount = 3,
}: TopNavbarProps) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = user?.name || 'Jerzy Leon';
  const roleName = user?.role === 'admin' ? 'Administrador' : user?.role || 'Administrador';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-[64px] bg-white border-b border-[#e2e8f0] px-[24px] flex items-center justify-between shadow-[0px_1px_2px_rgba(0,0,0,0.03)] shrink-0 sticky top-0 z-20">
      {/* Buscador Rápido */}
      <div className="relative w-[340px]">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Buscar por código, dirección o nombre..."
          className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-[38px] pr-[14px] py-[8px] text-[13px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-colors"
        />
      </div>

      {/* Chips de Telemetría en Vivo */}
      <div className="flex items-center gap-[8px]">
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] px-[12px] py-[6px] flex flex-col items-center shadow-[0px_1px_1px_rgba(0,0,0,0.03)] min-w-[140px]">
          <span className="text-[11px] text-[#153b68] font-medium leading-none mb-[2px]">
            Atenuación Media
          </span>
          <span className="text-[14px] font-bold text-[#16a34a] leading-none">
            {averageAttenuation > 0 ? `-${averageAttenuation}` : averageAttenuation} dBm
          </span>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-[8px] px-[12px] py-[6px] flex flex-col items-center shadow-[0px_1px_1px_rgba(0,0,0,0.03)] min-w-[110px]">
          <span className="text-[11px] text-[#334155] font-medium leading-none mb-[2px]">
            OLT
          </span>
          <span className="text-[14px] font-bold text-[#16a34a] leading-none">
            {oltBandwidth} Gbps
          </span>
        </div>
      </div>

      {/* Notificaciones y Perfil */}
      <div className="flex items-center gap-[12px]">
        {/* Campana de Notificaciones */}
        <button
          type="button"
          className="relative p-[8px] rounded-full text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
          title={`${alertsCount} alertas activas`}
        >
          <Bell className="w-[18px] h-[18px]" />
          {alertsCount > 0 && (
            <span className="absolute top-[4px] right-[4px] w-[14px] h-[14px] bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {alertsCount}
            </span>
          )}
        </button>

        <div className="h-[28px] w-px bg-[#e2e8f0]" />

        {/* Chip de Perfil de Usuario */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-[10px] p-[4px] rounded-[8px] hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-[#0f172a] text-white flex items-center justify-center text-[12px] font-bold shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-[#1e293b] leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-[#64748b] leading-tight">
                {roleName}
              </span>
            </div>
          </button>

          {/* Menú Flotante de Perfil */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-[8px] w-[180px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-lg py-[6px] z-50">
              <div className="px-[14px] py-[8px] border-b border-[#f1f5f9]">
                <p className="text-[12px] font-semibold text-[#0f172a] truncate">{displayName}</p>
                <p className="text-[11px] text-[#64748b] truncate">{user?.email || 'admin@fiberplus.pe'}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full px-[14px] py-[8px] text-[13px] text-[#ef4444] hover:bg-[#fef2f2] flex items-center gap-[8px] transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-[14px] h-[14px]" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
