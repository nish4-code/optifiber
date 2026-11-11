'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Zap, Network } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SpliceItem } from '@/types/closures';

interface SpliceMatrixProps {
  splices: SpliceItem[];
  onAddSplice: (globalNumber?: number) => void;
  onDeleteSplice: (spliceId: number) => void;
}

export const SpliceMatrix: React.FC<SpliceMatrixProps> = ({
  splices,
  onAddSplice,
  onDeleteSplice,
}) => {
  const [filterTray, setFilterTray] = useState<string>('');

  const filteredSplices = splices.filter((s) => {
    if (filterTray && s.tray_number.toString() !== filterTray) return false;
    return true;
  });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden shadow-xs flex flex-col">
      {/* Table Header & Controls */}
      <div className="p-[16px] border-b border-[#f1f5f9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[10px] bg-[#f8fafc]">
        <div>
          <h3 className="text-[14px] font-bold text-[#0f172a]">
            Matriz de Fusión Óptica ({splices.length} Fusiones registradas)
          </h3>
          <p className="text-[12px] text-[#64748b]">
            Registro pormenorizado hilo por hilo, pérdidas ópticas en dB y destinos de derivación.
          </p>
        </div>

        <div className="flex items-center gap-[8px] w-full sm:w-auto">
          <select
            value={filterTray}
            onChange={(e) => setFilterTray(e.target.value)}
            className="h-[32px] px-[8px] text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] cursor-pointer"
          >
            <option value="">Todas las bandejas</option>
            <option value="1">Bandeja 1</option>
            <option value="2">Bandeja 2</option>
            <option value="3">Bandeja 3</option>
            <option value="4">Bandeja 4</option>
          </select>

          <Button
            size="sm"
            onClick={() => onAddSplice()}
            className="h-[32px] text-[12px] gap-[4px] ml-auto sm:ml-0"
          >
            <Plus size={14} />
            Nueva Fusión
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f1f5f9] bg-white text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              <th className="py-[10px] px-[16px]">Bandeja</th>
              <th className="py-[10px] px-[16px]">Hilo Entrada</th>
              <th className="py-[10px] px-[16px]">Buffer / Color</th>
              <th className="py-[10px] px-[16px]">Pérdida (dB)</th>
              <th className="py-[10px] px-[16px]">Destino / Hilo Salida / NAP</th>
              <th className="py-[10px] px-[16px]">Estado</th>
              <th className="py-[10px] px-[16px] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#334155]">
            {filteredSplices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-[36px] text-center text-[#64748b]">
                  No se encontraron fusiones con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredSplices.map((splice) => {
                const inStrand = splice.strand_in;
                const outStrand = splice.strand_out;
                const nap = splice.nap_box;

                return (
                  <tr key={splice.id} className="hover:bg-[#f8fafc] transition-colors">
                    {/* Bandeja */}
                    <td className="py-[12px] px-[16px] font-semibold text-[#0f172a] whitespace-nowrap">
                      Bandeja {splice.tray_number}
                    </td>

                    {/* Hilo Entrada */}
                    <td className="py-[12px] px-[16px] whitespace-nowrap">
                      <div className="flex items-center gap-[6px]">
                        <span
                          className="w-[10px] h-[10px] rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: inStrand.color_hex }}
                        />
                        <span className="font-semibold text-[#0f172a]">
                          Hilo {inStrand.strand_number}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748b]">
                          (G#{inStrand.global_number})
                        </span>
                      </div>
                    </td>

                    {/* Buffer / Color */}
                    <td className="py-[12px] px-[16px] whitespace-nowrap">
                      <div className="flex items-center gap-[6px]">
                        <span className="text-[12px] font-medium text-[#334155]">
                          Buffer {inStrand.buffer} ({inStrand.buffer_color})
                        </span>
                      </div>
                    </td>

                    {/* Pérdida */}
                    <td className="py-[12px] px-[16px] whitespace-nowrap font-mono">
                      <div className="flex items-center gap-[4px] text-[12px] text-[#0066ff] font-semibold">
                        <Zap size={12} />
                        <span>{splice.loss_db || 0.04} dB</span>
                      </div>
                    </td>

                    {/* Destino */}
                    <td className="py-[12px] px-[16px] whitespace-nowrap">
                      {outStrand ? (
                        <div className="flex items-center gap-[6px]">
                          <span
                            className="w-[10px] h-[10px] rounded-full shrink-0"
                            style={{ backgroundColor: outStrand.color_hex }}
                          />
                          <span className="text-[12px] font-medium text-[#0f172a]">
                            {outStrand.cable} · Hilo {outStrand.strand_number} (G#{outStrand.global_number})
                          </span>
                        </div>
                      ) : nap ? (
                        <div className="flex items-center gap-[6px] text-[#10b981] font-medium text-[12px]">
                          <Network size={13} />
                          <span>Alimenta {nap.code} ({nap.name})</span>
                        </div>
                      ) : (
                        <span className="text-[#94a3b8] italic text-[12px]">Sin conexión</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-[12px] px-[16px] whitespace-nowrap">
                      <Badge variant={splice.status === 'activo' ? 'success' : 'warning'}>
                        {splice.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="py-[12px] px-[16px] whitespace-nowrap text-right">
                      <button
                        onClick={() => onDeleteSplice(splice.id)}
                        className="p-[6px] text-[#94a3b8] hover:text-[#ef4444] rounded-[4px] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                        title="Eliminar fusión"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
