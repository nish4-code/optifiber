import React from 'react';
import { Map, Layers, Users, BarChart3 } from 'lucide-react';

export function AuthLeftColumn() {
  const features = [
    { title: 'Mapa interactivo de la red', icon: Map },
    { title: 'Gestión de NAP, mufas y cables', icon: Layers },
    { title: 'Administración de clientes', icon: Users },
    { title: 'Reportes y monitoreo en tiempo real', icon: BarChart3 },
  ];

  return (
    <div className="hidden lg:flex w-[480px] xl:w-[512px] bg-gradient-to-b from-[#153b68] via-[#0f2a4b] to-[#010915] text-white flex-col justify-between p-[48px] xl:p-[56px] relative overflow-hidden shrink-0 shadow-2xl">
      {/* Patrón de Fondo de Cuadrícula Sutil */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to bottom, transparent, rgba(1, 9, 21, 0.8))',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col">
        {/* Cabecera con Logo */}
        <div className="mb-[40px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[44px] shrink-0">
              <svg viewBox="0 0 39 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M5 38C12 28 8 16 2 8C14 14 18 26 15 36" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M14 38C22 26 20 12 12 2C24 9 28 22 24 35" stroke="#ec1f26" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M24 38C30 28 28 16 22 8C32 14 36 24 34 35" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="font-extrabold text-[28px] text-white tracking-tight">Fiber</span>
                <span className="font-extrabold italic text-[28px] text-[#ec1f26] ml-[1px]">plus</span>
              </div>
              <p className="text-[11px] text-white/80 font-medium tracking-wide">
                Sistema de Gestión de Red de Fibra Óptica
              </p>
            </div>
          </div>
        </div>

        {/* Slogan */}
        <div className="mb-[36px]">
          <h2 className="text-[40px] xl:text-[44px] font-black leading-[1.08] tracking-tight mb-[14px]">
            Conectando <br />
            <span className="text-[#38bdf8]">un mejor futuro</span>
          </h2>
          <p className="text-[15px] text-white/80 leading-relaxed max-w-[380px]">
            Gestiona, administra y optimiza tu red de fibra óptica desde una sola plataforma.
          </p>
        </div>

        {/* Lista de Características Clave */}
        <div className="flex flex-col gap-[18px]">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="flex items-center gap-[14px]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center shrink-0 text-[#38bdf8]">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[14px] font-medium text-white/90 tracking-wide">
                  {feature.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pie de Ilustración de Red */}
      <div className="relative z-10 pt-[32px] border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
        <span>OptiFiber v1.0 • TIA-598 Compliant</span>
        <span>SmartOLT Ready</span>
      </div>
    </div>
  );
}
