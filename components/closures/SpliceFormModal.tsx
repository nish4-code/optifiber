'use client';

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      tray_number: Number(trayNumber),
      strand_in_id: Number(strandInId),
      target_type: targetType,
      nap_box_id: targetType === 'nap' ? napBoxId : null,
      strand_out_id: targetType === 'strand' ? strandOutId : null,
      loss_db: Number(lossDb),
      status,
    };

    try {
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
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Fusión Óptica"
      subtitle={`Registrar empalme en bandeja o derivación a NAP para la mufa #${closureId}.`}
      icon={<Zap size={20} />}
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving}
            className="gap-[6px]"
            onClick={() => {
              const form = document.getElementById('splice-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            <Check size={14} />
            {saving ? 'Guardando...' : 'Guardar Fusión'}
          </Button>
        </>
      }
    >
      <form id="splice-form" onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
        {error && (
          <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Bandeja de Fusión *
            </label>
            <select
              value={trayNumber}
              onChange={(e) => setTrayNumber(Number(e.target.value))}
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((tray) => (
                <option key={tray} value={tray}>
                  Bandeja #{tray} (Hilos {(tray - 1) * 24 + 1} - {tray * 24})
                </option>
              ))}
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
              min={1}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
            Tipo de Destino *
          </label>
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={() => setTargetType('nap')}
              className={`flex-1 py-[8px] px-[12px] text-[13px] font-semibold rounded-[8px] border transition-all cursor-pointer ${
                targetType === 'nap'
                  ? 'bg-[#0066ff] text-white border-[#0066ff] shadow-xs'
                  : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f8fafc]'
              }`}
            >
              Alimentar Caja NAP
            </button>
            <button
              type="button"
              onClick={() => setTargetType('strand')}
              className={`flex-1 py-[8px] px-[12px] text-[13px] font-semibold rounded-[8px] border transition-all cursor-pointer ${
                targetType === 'strand'
                  ? 'bg-[#0066ff] text-white border-[#0066ff] shadow-xs'
                  : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f8fafc]'
              }`}
            >
              Paso a Hilo Salida
            </button>
          </div>
        </div>

        {targetType === 'nap' ? (
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Caja NAP a Alimentar *
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
      </form>
    </SlideOverDrawer>
  );
};
