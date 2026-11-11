'use client';

import React, { useState } from 'react';
import { GitBranch, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { apiClient } from '@/lib/api/client';
import { TrunkItem, TrunkFormData } from '@/types/trunks';
import { ZoneOption } from '@/types/api';

interface TrunkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  trunkToEdit?: TrunkItem | null;
  zones: ZoneOption[];
}

export const TrunkFormModal: React.FC<TrunkFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  trunkToEdit,
  zones,
}) => {
  const [formData, setFormData] = useState<TrunkFormData>({
    zone_id: trunkToEdit?.zone?.id || (zones[0]?.id ?? null),
    code: trunkToEdit?.code || '',
    name: trunkToEdit?.name || '',
    fiber_count: trunkToEdit?.fiber_count || 144,
    length_km: trunkToEdit?.length_km || 1.2,
    map_color: trunkToEdit?.map_color || '#3B82F6',
    status: trunkToEdit?.status || 'activo',
    is_visible: trunkToEdit?.is_visible ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.code.trim() || !formData.name.trim()) {
      setError('El código y nombre del trazado son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      if (trunkToEdit) {
        await apiClient(`/trunks/${trunkToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiClient('/trunks', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al procesar el cable troncal.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={trunkToEdit ? `Editar ${trunkToEdit.code}` : 'Nuevo Cable Troncal'}
      subtitle="Definición de capacidad de hilos TIA-598, zona y trazado de fibra."
      icon={<GitBranch size={20} />}
      maxWidth="lg"
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
              const form = document.getElementById('trunk-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            <Check size={14} />
            {saving ? 'Guardando...' : trunkToEdit ? 'Actualizar Troncal' : 'Crear Troncal'}
          </Button>
        </>
      }
    >
      <form id="trunk-form" onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
        {error && (
          <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Código Troncal *
            </label>
            <Input
              placeholder="ej. TRK-48"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Zona Geográfica
            </label>
            <select
              value={formData.zone_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  zone_id: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              <option value="">Seleccionar zona...</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
            Nombre del Trazado / Ruta *
          </label>
          <Input
            placeholder="ej. Troncal Alimentadora Chiclayo - Reque"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Capacidad de Fibra
            </label>
            <select
              value={formData.fiber_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fiber_count: Number(e.target.value) as 12 | 24 | 48 | 96 | 144,
                })
              }
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              <option value={12}>12 Hilos (1 Buffer)</option>
              <option value={24}>24 Hilos (2 Buffers)</option>
              <option value={48}>48 Hilos (4 Buffers)</option>
              <option value={96}>96 Hilos (8 Buffers)</option>
              <option value={144}>144 Hilos (12 Buffers TIA-598)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Longitud Estimada (km)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.length_km}
              onChange={(e) =>
                setFormData({ ...formData, length_km: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Color en Mapa GIS
            </label>
            <div className="flex items-center gap-[8px]">
              <input
                type="color"
                value={formData.map_color}
                onChange={(e) => setFormData({ ...formData, map_color: e.target.value })}
                className="w-[40px] h-[38px] p-[2px] border border-[#cbd5e1] rounded-[6px] cursor-pointer"
              />
              <span className="text-[12px] font-mono text-[#64748b] uppercase">
                {formData.map_color}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'activo' | 'alerta' | 'mantenimiento' | 'inactivo',
                })
              }
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              <option value="activo">Activo</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="alerta">Alerta</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </form>
    </SlideOverDrawer>
  );
};
