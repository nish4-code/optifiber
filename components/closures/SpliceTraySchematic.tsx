'use client';

import React, { useState } from 'react';
import { Layers, ArrowRight, Zap, Network, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SpliceItem } from '@/types/closures';

interface SpliceTraySchematicProps {
  splices: SpliceItem[];
  onAddSplice: (trayNumber: number) => void;
  onDeleteSplice: (spliceId: number) => void;
}

export const SpliceTraySchematic: React.FC<SpliceTraySchematicProps> = ({
  splices,
  onAddSplice,
  onDeleteSplice,
}) => {
  const [selectedTray, setSelectedTray] = useState<number>(1);
  const trays = [1, 2, 3, 4];

  const traySplices = splices.filter((s) => (s.tray_number || 1) === selectedTray);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-[20px] shadow-xs flex flex-col gap-[16px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[10px] border-b border-[#f1f5f9] pb-[12px]">
        <div>
          <h3 className="text-[14px] font-bold text-[#0f172a] flex items-center gap-[6px]">
            <Layers size={16} className="text-[#0066ff]" />
            Esquemático Interactivo de Bandejas de Empalme
          </h3>
          <p className="text-[12px] text-[#64748b]">
            Distribución física por bandeja y protectores termorretráctiles de fusión.
          </p>
        </div>

        {/* Selector de Bandeja */}
        <div className="flex items-center gap-[6px]">
          {trays.map((tray) => {
            const count = splices.filter((s) => (s.tray_number || 1) === tray).length;
            const isSelected = selectedTray === tray;

            return (
              <button
                key={tray}
                onClick={() => setSelectedTray(tray)}
                className={`px-[12px] py-[6px] rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0066ff] text-white shadow-xs'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                }`}
              >
                Bandeja {tray} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Vista de la Bandeja */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[16px]">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="text-[12px] font-bold text-[#1e293b]">
            Bandeja {selectedTray} — {traySplices.length} Fusiones registradas
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddSplice(selectedTray)}
            className="h-[28px] text-[12px] gap-[4px]"
          >
            <Plus size={13} />
            Nueva Fusión en Bandeja {selectedTray}
          </Button>
        </div>

        {traySplices.length === 0 ? (
          <div className="py-[30px] text-center text-[#64748b] bg-white rounded-[6px] border border-dashed border-[#cbd5e1]">
            <p className="text-[13px]">No hay fusiones registradas en la Bandeja {selectedTray}.</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddSplice(selectedTray)}
              className="mt-[8px] text-[#0066ff] text-[12px]"
            >
              + Agregar primer empalme
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {traySplices.map((splice, idx) => {
              const inStrand = splice.strand_in;
              const outStrand = splice.strand_out;
              const nap = splice.nap_box;

              return (
                <div
                  key={splice.id || idx}
                  className="bg-white border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col md:flex-row items-start md:items-center justify-between gap-[12px] shadow-2xs hover:border-[#bfdbfe] transition-all"
                >
                  {/* Entrada */}
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[11px] font-mono text-[#64748b] w-[20px]">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="w-[12px] h-[12px] rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: inStrand.color_hex }}
                      />
                      <div>
                        <span className="text-[12px] font-bold text-[#0f172a] block">
                          {inStrand.cable}
                        </span>
                        <span className="text-[11px] text-[#64748b]">
                          Buffer {inStrand.buffer} ({inStrand.buffer_color}) · Hilo {inStrand.strand_number} (G#{inStrand.global_number})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fusión Protector */}
                  <div className="flex items-center gap-[8px] self-center">
                    <div className="h-[2px] w-[24px] bg-[#cbd5e1]" />
                    <div className="px-[8px] py-[3px] bg-[#eff6ff] border border-[#bfdbfe] rounded-full flex items-center gap-[4px] text-[11px] font-mono text-[#1e40af] font-semibold">
                      <Zap size={11} className="text-[#0066ff]" />
                      <span>{splice.loss_db || 0.04} dB</span>
                    </div>
                    <div className="h-[2px] w-[24px] bg-[#cbd5e1]" />
                    <ArrowRight size={14} className="text-[#94a3b8]" />
                  </div>

                  {/* Salida / Destino */}
                  <div className="flex items-center justify-between md:justify-end gap-[12px] w-full md:w-auto">
                    {outStrand ? (
                      <div className="flex items-center gap-[8px]">
                        <span
                          className="w-[12px] h-[12px] rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: outStrand.color_hex }}
                        />
                        <div>
                          <span className="text-[12px] font-bold text-[#0f172a] block">
                            {outStrand.cable}
                          </span>
                          <span className="text-[11px] text-[#64748b]">
                            Buffer {outStrand.buffer} ({outStrand.buffer_color}) · Hilo {outStrand.strand_number} (G#{outStrand.global_number})
                          </span>
                        </div>
                      </div>
                    ) : nap ? (
                      <div className="flex items-center gap-[6px]">
                        <div className="w-[24px] h-[24px] rounded-[6px] bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                          <Network size={14} />
                        </div>
                        <div>
                          <span className="text-[12px] font-bold text-[#10b981] block">
                            Alimenta {nap.code}
                          </span>
                          <span className="text-[11px] text-[#64748b]">{nap.name}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#94a3b8] italic">Hilo en espera</span>
                    )}

                    <button
                      onClick={() => onDeleteSplice(splice.id)}
                      className="p-[6px] text-[#94a3b8] hover:text-[#ef4444] rounded-[4px] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                      title="Eliminar fusión"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
