'use client';

import React from 'react';
import { Server, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ConfiguracionPage() {
  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-[20px] font-bold text-[#153b68]">Configuración del Sistema</h1>
        <p className="text-[13px] text-[#64748b]">
          Ajustes generales de la plataforma OptiFiber, credenciales de SmartOLT y parámetros de red.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {/* Parámetros SmartOLT */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[10px] mb-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
                <Server className="w-[16px] h-[16px]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#153b68]">Integración con SmartOLT</h3>
                <span className="text-[11px] text-[#059669] font-medium">Conectado (Modo Mock/Demo activo)</span>
              </div>
            </div>
            <p className="text-[12px] text-[#64748b] mb-[16px]">
              La comunicación con las OLTs se realiza a través del servicio backend en Laravel intermediario seguro.
            </p>
            <div className="flex flex-col gap-[8px] text-[12px]">
              <div className="flex justify-between py-[4px] border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Dominio API:</span>
                <span className="font-mono text-[#0f172a]">api.smartolt.com (Intermediario)</span>
              </div>
              <div className="flex justify-between py-[4px] border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">OLT Principal:</span>
                <span className="font-mono text-[#0f172a]">OLT-Kishuara-ZTE-C320</span>
              </div>
              <div className="flex justify-between py-[4px] border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Caché Local:</span>
                <span className="font-semibold text-[#059669]">Habilitada (10 minutos)</span>
              </div>
            </div>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex justify-end">
            <Button variant="outline" size="sm">
              Sincronizar ahora
            </Button>
          </div>
        </div>

        {/* Estándar TIA-598 */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[10px] mb-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                <Database className="w-[16px] h-[16px]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#153b68]">Norma de Color TIA-598</h3>
                <span className="text-[11px] text-[#059669] font-medium">12 Colores / 144 Hilos</span>
              </div>
            </div>
            <p className="text-[12px] text-[#64748b] mb-[16px]">
              Estandarización de tubos buffer e hilos de fibra óptica conforme a la norma internacional de telecomunicaciones.
            </p>
            <div className="grid grid-cols-6 gap-[6px]">
              {[
                { name: 'Azul', hex: '#0066ff' },
                { name: 'Naranja', hex: '#ff7700' },
                { name: 'Verde', hex: '#00cc44' },
                { name: 'Marrón', hex: '#8b4513' },
                { name: 'Gris', hex: '#808080' },
                { name: 'Blanco', hex: '#f8fafc' },
                { name: 'Rojo', hex: '#ef4444' },
                { name: 'Negro', hex: '#1e293b' },
                { name: 'Amarillo', hex: '#eab308' },
                { name: 'Violeta', hex: '#8b5cf6' },
                { name: 'Rosa', hex: '#ec4899' },
                { name: 'Turquesa', hex: '#06b6d4' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="p-[4px] rounded-[4px] border border-[#e2e8f0] flex flex-col items-center gap-[2px]"
                >
                  <span
                    className="w-[14px] h-[14px] rounded-full inline-block border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[9px] text-[#64748b] truncate w-full text-center">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex justify-end">
            <Button variant="outline" size="sm">
              Ver especificación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
