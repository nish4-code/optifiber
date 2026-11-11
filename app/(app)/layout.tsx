'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMapPage = pathname === '/mapa';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
      {/* Barra Lateral Izquierda */}
      <Sidebar />

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar />
        <main
          className={`flex-1 ${
            isMapPage
              ? 'p-0 overflow-hidden'
              : 'p-[20px] lg:p-[28px] overflow-y-auto'
          }`}
        >
          <div className={isMapPage ? 'w-full h-full' : 'max-w-[1400px] mx-auto w-full'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
            <aside className="w-[256px] bg-white border-r border-[#8aabe0] shrink-0 h-screen" />
            <div className="flex-1 flex flex-col min-w-0 h-screen">
              <header className="h-[64px] bg-white border-b border-[#e2e8f0]" />
              <main className="flex-1 p-[20px] lg:p-[28px] overflow-y-auto" />
            </div>
          </div>
        }
      >
        <AppLayoutContent>{children}</AppLayoutContent>
      </Suspense>
    </AuthProvider>
  );
}
