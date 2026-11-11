'use client';

import React, { useState } from 'react';
import { X, Layers, MapPin, Locate, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { SpliceClosureItem, ClosureFormData } from '@/types/closures';
import { ZoneOption } from '@/types/api';

interface ClosureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  closureToEdit?: SpliceClosureItem | null;
  zones: ZoneOption[];
}

export const ClosureFormModal: React.FC<ClosureFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  closureToEdit,
  zones,
}) => {
  const [formData, setFormData] = useState<ClosureFormData>({
    zone_id: closureToEdit?.zone?.id || (zones[0]?.id ?? null),
    code: closureToEdit?.code || '',
    name: closureToEdit?.name || '',
    type: closureToEdit?.type || 'empalme',
    mount_type: closureToEdit?.mount_type || 'poste',
    fiber_capacity: closureToEdit?.fiber_capacity || 144,
    latitude: closureToEdit?.latitude || -6.7725,
    longitude: closureToEdit?.longitude || -79.8415,
    reserve_meters: closureToEdit?.reserve_meters || 15.0,
    status: closureToEdit?.status || 'activo',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por el navegador.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        }));
        setGeoLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('No se pudo obtener la ubicación GPS.');
        setGeoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.code.trim()) {
      setError('El código de la mufa es obligatorio.');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre descriptivo es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      if (closureToEdit) {
        await apiClient(`/closures/${closureToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiClient('/closures', {
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
        setError('Ocurrió un error al guardar la mufa.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-[16px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">
                {closureToEdit ? `Editar Mufa ${closureToEdit.code}` : 'Nueva Mufa / Reserva de Empalme'}
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Parámetros de capacidad física, tipo de montaje y ubicación.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Código Mufa *
              </label>
              <Input
                placeholder="ej. MUFA-03"
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
              Nombre Descriptivo *
            </label>
            <Input
              placeholder="ej. Mufa Troncal Bolognesi 144"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Tipo de Mufa
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'empalme' | 'distribucion' | 'reserva',
                  })
                }
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value="empalme">Empalme</option>
                <option value="distribucion">Distribución</option>
                <option value="reserva">Reserva Óptica</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Tipo de Soporte
              </label>
              <select
                value={formData.mount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mount_type: e.target.value as 'poste' | 'camara' | 'pared',
                  })
                }
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value="poste">En Poste Aéreo</option>
                <option value="camara">En Cámara Subterránea</option>
                <option value="pared">En Pared / Fachada</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Capacidad (Hilos)
              </label>
              <select
                value={formData.fiber_capacity}
                onChange={(e) => setFormData({ ...formData, fiber_capacity: Number(e.target.value) })}
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value={24}>24 Hilos</option>
                <option value={48}>48 Hilos</option>
                <option value={96}>96 Hilos</option>
                <option value={144}>144 Hilos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Reserva de Fibra (metros)
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.reserve_meters}
                onChange={(e) => setFormData({ ...formData, reserve_meters: parseFloat(e.target.value) || 0 })}
              />
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
                <option value="alerta">Alerta</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#1e293b] flex items-center gap-[6px]">
                <MapPin size={14} className="text-[#0066ff]" />
                Ubicación Geográfica
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                disabled={geoLocating}
                className="text-[12px] text-[#0066ff] hover:bg-[#0066ff]/10 h-[28px] gap-[4px]"
              >
                <Locate size={12} />
                {geoLocating ? 'Obteniendo GPS...' : 'Obtener GPS'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <span className="block text-[11px] text-[#64748b] mb-[4px]">Latitud</span>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full h-[36px] px-[10px] text-[12px] font-mono bg-white border border-[#cbd5e1] rounded-[6px]"
                  required
                />
              </div>
              <div>
                <span className="block text-[11px] text-[#64748b] mb-[4px]">Longitud</span>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full h-[36px] px-[10px] text-[12px] font-mono bg-white border border-[#cbd5e1] rounded-[6px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-[10px] border-t border-[#f1f5f9] flex items-center justify-end gap-[10px]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-[6px]">
              <Check size={14} />
              {saving ? 'Guardando...' : closureToEdit ? 'Actualizar Mufa' : 'Crear Mufa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
