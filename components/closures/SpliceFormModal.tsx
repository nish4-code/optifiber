'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { NapItem } from '@/types/naps';
import { PaginatedResponse } from '@/types/api';

interface SpliceFormModalProps {
  isOpen: boolean;
  closureId: number;
  initialTray?: number;
  initialStrandInId?: number;
  onClose: () => void;
  onSaved: () => void;
}

export const SpliceFormModal: React.FC<SpliceFormModalProps> = ({
  isOpen,
  closureId,
  initialTray = 1,
  initialStrandInId,
  onClose,
  onSaved,
}) => {
  const [trayNumber, setTrayNumber] = useState<number>(initialTray);
  const [strandInId, setStrandInId] = useState<number>(initialStrandInId || 1);
  const [targetType, setTargetType] = useState<'nap' | 'strand'>('nap');
  const [napBoxId, setNapBoxId] = useState<number | null>(null);
  const [strandOutId, setStrandOutId] = useState<number | null>(null);
  const [lossDb, setLossDb] = useState<number>(0.04);
  const [status, setStatus] = useState<'activo' | 'alerta' | 'mantenimiento'>('activo');

  const [naps, setNaps] = useState<NapItem[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    apiClient<PaginatedResponse<NapItem>>('/naps?per_page=50')
      .then((res) => {
        if (isMounted && res.items) {
          setNaps(res.items);
          if (res.items.length > 0 && !napBoxId) {
            setNapBoxId(res.items[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Error cargando NAPs para fusión:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, napBoxId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setSaving(true);
    try {
      const payload = {
        tray_number: trayNumber,
        strand_in_id: strandInId,
        strand_out_id: targetType === 'strand' ? strandOutId : null,
        nap_box_id: targetType === 'nap' ? napBoxId : null,
        loss_db: lossDb,
        status: status,
      };

      await apiClient(`/closures/${closureId}/splices`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al registrar la fusión.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-[16px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">Registrar Nueva Fusión Óptica</h2>
              <p className="text-[12px] text-[#64748b]">
                Asignación de hilo de entrada, bandeja y derivación o salida.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-[6px] hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[14px]">
          {error && (
            <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                N° de Bandeja
              </label>
              <select
                value={trayNumber}
                onChange={(e) => setTrayNumber(Number(e.target.value))}
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value={1}>Bandeja 1</option>
                <option value={2}>Bandeja 2</option>
                <option value={3}>Bandeja 3</option>
                <option value={4}>Bandeja 4</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                ID Hilo Entrada *
              </label>
              <Input
                type="number"
                value={strandInId}
                onChange={(e) => setStrandInId(Number(e.target.value))}
                required
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Tipo de Destino
            </label>
            <div className="grid grid-cols-2 gap-[10px]">
              <button
                type="button"
                onClick={() => setTargetType('nap')}
                className={`py-[8px] px-[12px] rounded-[8px] text-[12px] font-semibold border transition-all cursor-pointer ${
                  targetType === 'nap'
                    ? 'bg-[#0066ff]/10 border-[#0066ff] text-[#0066ff]'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                }`}
              >
                Alimentar Caja NAP
              </button>
              <button
                type="button"
                onClick={() => setTargetType('strand')}
                className={`py-[8px] px-[12px] rounded-[8px] text-[12px] font-semibold border transition-all cursor-pointer ${
                  targetType === 'strand'
                    ? 'bg-[#0066ff]/10 border-[#0066ff] text-[#0066ff]'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                }`}
              >
                Empalme a Otro Troncal
              </button>
            </div>
          </div>

          {targetType === 'nap' ? (
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Caja NAP de Destino *
              </label>
              <select
                value={napBoxId || ''}
                onChange={(e) => setNapBoxId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
                required
              >
                <option value="">Seleccione una NAP...</option>
                {naps.map((nap) => (
                  <option key={nap.id} value={nap.id}>
                    {nap.code} — {nap.name} ({nap.splitter_ratio})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                ID Hilo Salida *
              </label>
              <Input
                type="number"
                value={strandOutId || ''}
                onChange={(e) => setStrandOutId(e.target.value ? Number(e.target.value) : null)}
                placeholder="ej. 14"
                min={1}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Pérdida Medida (dB)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={lossDb}
                onChange={(e) => setLossDb(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'activo' | 'alerta' | 'mantenimiento')}
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value="activo">Activo</option>
                <option value="alerta">Alerta</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-[14px] border-t border-[#f1f5f9] flex items-center justify-end gap-[10px] mt-[10px]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-[6px]">
              <Check size={14} />
              {saving ? 'Guardando...' : 'Guardar Fusión'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
