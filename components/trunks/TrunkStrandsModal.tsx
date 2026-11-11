'use client';

import React, { useState, useEffect } from 'react';
import { X, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

  if (!trunkId) return null;

  const selectedBufferData = data?.buffers.find((b) => b.buffer_number === activeBuffer);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-[16px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
              <GitBranch size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">
                {data ? `${data.code} — ${data.name}` : 'Distribución de Buffers e Hilos'}
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Estructura TIA-598-D ({data?.fiber_count || 0} hilos organizados por tubos buffer).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-[6px] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-[20px] overflow-y-auto flex-1">
          {loading ? (
            <div className="py-[40px] flex flex-col items-center justify-center gap-[12px] text-[#64748b]">
              <div className="w-[32px] h-[32px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px]">Cargando topología óptica de hilos...</p>
            </div>
          ) : !data ? (
            <p className="text-center text-[#64748b] py-[30px]">No se encontraron datos de hilos.</p>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {/* Selector de Tubos Buffer */}
              <div>
                <span className="text-[12px] font-semibold text-[#334155] block mb-[8px]">
                  Seleccionar Tubo Buffer ({data.buffers.length} tubos):
                </span>
                <div className="flex flex-wrap gap-[6px]">
                  {data.buffers.map((b) => {
                    const isSelected = b.buffer_number === activeBuffer;
                    return (
                      <button
                        key={b.buffer_number}
                        onClick={() => setActiveBuffer(b.buffer_number)}
                        className={`px-[10px] py-[6px] rounded-[6px] text-[12px] font-semibold border flex items-center gap-[6px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                            : 'bg-[#f8fafc] text-[#334155] border-[#e2e8f0] hover:border-[#cbd5e1]'
                        }`}
                      >
                        <span
                          className="w-[10px] h-[10px] rounded-full border border-black/20"
                          style={{ backgroundColor: b.color?.hex || '#0066CC' }}
                        />
                        <span>Buffer {b.buffer_number} ({b.color?.name})</span>
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
        </div>

        {/* Footer */}
        <div className="px-[20px] py-[14px] bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
