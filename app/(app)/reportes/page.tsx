'use client';

import React from 'react';
import { Download, Calendar, Activity, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ReportesPage() {
  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68]">Reportes y Analítica FTTH</h1>
          <p className="text-[13px] text-[#64748b]">
            Informes de atenuación óptica, capacidad de puertos NAP, consumo de ancho de banda y salud de red.
          </p>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button variant="outline" size="sm" className="gap-[6px]">
            <Calendar className="w-[14px] h-[14px]" />
            <span>Últimos 30 días</span>
          </Button>
          <Button variant="primary" size="sm" className="gap-[6px]">
            <Download className="w-[14px] h-[14px]" />
            <span>Exportar CSV / PDF</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center mb-[12px]">
              <Activity className="w-[18px] h-[18px]" />
            </div>
            <h3 className="text-[14px] font-bold text-[#153b68]">Atenuación Promedio Óptica</h3>
            <p className="text-[12px] text-[#64748b] mt-[4px]">
              Nivel de recepción promedio de las ONUs conectadas a OLT Kishuara.
            </p>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex items-baseline justify-between">
            <span className="text-[24px] font-bold font-mono text-[#059669]">-19.4 dBm</span>
            <span className="text-[11px] font-semibold text-[#059669] bg-[#059669]/10 px-[6px] py-[2px] rounded-[4px]">
              Óptimo (&lt; -24 dBm)
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-[12px]">
              <Zap className="w-[18px] h-[18px]" />
            </div>
            <h3 className="text-[14px] font-bold text-[#153b68]">Tasa de Ocupación NAP</h3>
            <p className="text-[12px] text-[#64748b] mt-[4px]">
              Porcentaje global de puertos de distribución ocupados respecto al total instalado.
            </p>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex items-baseline justify-between">
            <span className="text-[24px] font-bold font-mono text-[#153b68]">68.4%</span>
            <span className="text-[11px] font-semibold text-[#64748b]">
              72 de 104 puertos
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center mb-[12px]">
              <Users className="w-[18px] h-[18px]" />
            </div>
            <h3 className="text-[14px] font-bold text-[#153b68]">Disponibilidad de Servicio</h3>
            <p className="text-[12px] text-[#64748b] mt-[4px]">
              SLA de conectividad en planta externa del distrito de Chiclayo.
            </p>
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-[#f1f5f9] flex items-baseline justify-between">
            <span className="text-[24px] font-bold font-mono text-[#0066ff]">99.85%</span>
            <span className="text-[11px] font-semibold text-[#0066ff] bg-[#0066ff]/10 px-[6px] py-[2px] rounded-[4px]">
              SLA Cumplido
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
