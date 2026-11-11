'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { apiClient } from '@/lib/api/client';
import { TrunkStrandsDto } from '@/types/trunks';

interface TrunkStrandsModalProps {
  trunkId: number | null;
  onClose: () => void;
}

export const TrunkStrandsModal: React.FC<TrunkStrandsModalProps> = ({ trunkId, onClose }) => {
  const [data, setData] = useState<TrunkStrandsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBuffer, setActiveBuffer] = useState<number>(1);

  useEffect(() => {
    if (!trunkId) return;

    let isMounted = true;
    apiClient<TrunkStrandsDto>(`/trunks/${trunkId}/strands`)
      .then((res) => {
        if (isMounted) {
          setData(res);
          if (res.buffers && res.buffers.length > 0) {
            setActiveBuffer(res.buffers[0].buffer_number);
          }
        }
      })
      .catch((err) => {
        console.error('Error cargando hilos de troncal:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [trunkId]);

  const selectedBufferData = data?.buffers.find((b) => b.buffer_number === activeBuffer);

  // Estadísticas calculadas sobre los hilos
  const allStrands = data?.buffers.flatMap((b) => b.strands) || [];
  const stats = {
    total: allStrands.length,
    free: allStrands.filter((s) => s.status === 'libre').length,
    occupied: allStrands.filter((s) => s.status === 'ocupado').length,
    damaged: allStrands.filter((s) => s.status === 'averiado').length,
  };

  return (
    <SlideOverDrawer
      isOpen={!!trunkId}
      onClose={onClose}
      title={data ? `${data.code} — ${data.name}` : 'Mapeo de Hilos de Fibra'}
      subtitle={`Estándar TIA-598: ${data?.fiber_count || 144} hilos en ${data?.buffers.length || 12} tubos buffer.`}
      icon={<GitBranch size={20} />}
      maxWidth="xl"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {loading ? (
        <div className="py-[60px] text-center text-[#64748b] text-[13px]">
          Cargando matriz de hilos y ocupación...
        </div>
      ) : (
        <div className="flex flex-col gap-[20px]">
          {/* Resumen de ocupación */}
          <div className="grid grid-cols-4 gap-[10px] text-center">
            <div className="p-[10px] bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0]">
              <span className="block text-[10px] uppercase font-bold text-[#64748b]">Total Hilos</span>
              <span className="text-[16px] font-bold text-[#0f172a]">{stats.total}</span>
            </div>
            <div className="p-[10px] bg-[#f0fdf4] rounded-[8px] border border-[#bbf7d0]">
              <span className="block text-[10px] uppercase font-bold text-[#166534]">Libres</span>
              <span className="text-[16px] font-bold text-[#166534]">{stats.free}</span>
            </div>
            <div className="p-[10px] bg-[#eff6ff] rounded-[8px] border border-[#bfdbfe]">
              <span className="block text-[10px] uppercase font-bold text-[#1e40af]">Ocupados</span>
              <span className="text-[16px] font-bold text-[#1e40af]">{stats.occupied}</span>
            </div>
            <div className="p-[10px] bg-[#fef2f2] rounded-[8px] border border-[#fecaca]">
              <span className="block text-[10px] uppercase font-bold text-[#991b1b]">Dañados</span>
              <span className="text-[16px] font-bold text-[#991b1b]">{stats.damaged}</span>
            </div>
          </div>

          {/* Selector de Tubos Buffer */}
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[8px]">
              Seleccionar Tubo Buffer (TIA-598)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-[8px]">
              {data?.buffers.map((buf) => {
                const isSelected = buf.buffer_number === activeBuffer;
                return (
                  <button
                    key={buf.buffer_number}
                    onClick={() => setActiveBuffer(buf.buffer_number)}
                    className={`p-[8px] rounded-[8px] border text-left flex items-center gap-[6px] transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0066ff] bg-[#0066ff]/10 font-bold shadow-xs'
                        : 'border-[#cbd5e1] bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span
                      className="w-[12px] h-[12px] rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: buf.color?.hex || '#0066CC' }}
                    />
                    <div className="overflow-hidden">
                      <span className="block text-[11px] truncate text-[#0f172a]">
                        B#{buf.buffer_number}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hilos dentro del Buffer Activo */}
          {selectedBufferData && (
            <div className="border border-[#e2e8f0] rounded-[10px] overflow-hidden">
              <div className="bg-[#f8fafc] px-[14px] py-[10px] border-b border-[#e2e8f0] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#0f172a]">
                  Hilos del Tubo Buffer {selectedBufferData.buffer_number} ({selectedBufferData.color?.name})
                </span>
                <span className="text-[11px] text-[#64748b]">
                  {selectedBufferData.strands.filter((s) => s.status === 'libre').length} libres de {selectedBufferData.strands.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-[1px] bg-[#f1f5f9]">
                {selectedBufferData.strands.map((strand) => (
                  <div
                    key={strand.global_number}
                    className="bg-white p-[10px] flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="w-[14px] h-[14px] rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: strand.color?.hex || '#0066CC' }}
                      />
                      <div>
                        <span className="font-semibold text-[#0f172a] block">
                          Hilo {strand.strand_number} — {strand.color?.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748b]">
                          Global #{strand.global_number}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        strand.status === 'libre'
                          ? 'success'
                          : strand.status === 'ocupado'
                          ? 'info'
                          : strand.status === 'averiado'
                          ? 'critical'
                          : 'warning'
                      }
                    >
                      {strand.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SlideOverDrawer>
  );
};
