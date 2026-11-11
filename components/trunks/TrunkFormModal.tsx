'use client';

import React, { useState } from 'react';
import { X, GitBranch, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

  if (!isOpen) return null;

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
          body: JSON.stringify({
            name: formData.name,
            zone_id: formData.zone_id,
            length_km: formData.length_km,
            map_color: formData.map_color,
            status: formData.status,
            is_visible: formData.is_visible,
          }),
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
      setError(err instanceof Error ? err.message : 'Error al guardar el cable troncal.');
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
              <GitBranch size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">
                {trunkToEdit ? `Editar ${trunkToEdit.code}` : 'Nuevo Cable Troncal FTTH'}
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Autogeneración de tubos buffer e hilos según norma TIA-598.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-[20px] flex flex-col gap-[14px] overflow-y-auto">
          {error && (
            <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Código *
              </label>
              <Input
                placeholder="ej. TRK-48"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!trunkToEdit}
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
              Nombre / Ruta del Tendido *
            </label>
            <Input
              placeholder="ej. Troncal Av. Salaverry - JLO"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Capacidad (Hilos)
              </label>
              <select
                value={formData.fiber_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiber_count: Number(e.target.value) as 12 | 24 | 48 | 96 | 144,
                  })
                }
                disabled={!!trunkToEdit}
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value={12}>12 Hilos (1 Buffer)</option>
                <option value={24}>24 Hilos (2 Buffers)</option>
                <option value={48}>48 Hilos (4 Buffers)</option>
                <option value={96}>96 Hilos (8 Buffers)</option>
                <option value={144}>144 Hilos (12 Buffers)</option>
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

          <div className="pt-[10px] border-t border-[#f1f5f9] flex justify-end gap-[10px]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-[6px]">
              <Check size={14} />
              {saving ? 'Guardando...' : trunkToEdit ? 'Actualizar Troncal' : 'Crear Troncal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
