'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-[#f1f5f9]">
        {/* Barra Lateral Izquierda */}
        <Sidebar />

        {/* Área de Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-[20px] lg:p-[28px] overflow-y-auto">
            <div className="max-w-[1400px] mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
