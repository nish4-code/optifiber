'use client';

import React, { useState } from 'react';
import { X, Network, MapPin, Locate, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { NapItem, NapFormData } from '@/types/naps';
import { ZoneOption } from '@/types/api';

interface NapFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  napToEdit?: NapItem | null;
  zones: ZoneOption[];
}

export const NapFormModal: React.FC<NapFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  napToEdit,
  zones,
}) => {
  const [formData, setFormData] = useState<NapFormData>({
    zone_id: napToEdit?.zone?.id || (zones[0]?.id ?? null),
    code: napToEdit?.code || '',
    name: napToEdit?.name || '',
    splitter_ratio: napToEdit?.splitter_ratio || '1:8',
    address: napToEdit?.address || '',
    latitude: napToEdit?.latitude || -6.7725,
    longitude: napToEdit?.longitude || -79.8415,
    status: napToEdit?.status || 'activo',
    notes: napToEdit?.notes || '',
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
      setError('El código de la caja NAP es obligatorio.');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre o ruta es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      if (napToEdit) {
        await apiClient(`/naps/${napToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiClient('/naps', {
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
        setError('Ocurrió un error al guardar la caja NAP.');
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
              <Network size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">
                {napToEdit ? `Editar Caja ${napToEdit.code}` : 'Nueva Caja de Distribución NAP'}
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Especificaciones del splitter, zona de cobertura y geolocalización.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[16px]">
          {error && (
            <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Código NAP *
              </label>
              <Input
                placeholder="ej. NAP-05"
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
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all cursor-pointer"
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
              Nombre / Referencia de Ruta *
            </label>
            <Input
              placeholder="ej. Bolognesi / Av. Saenz Peña"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Modelo de Splitter Óptico
              </label>
              <select
                value={formData.splitter_ratio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    splitter_ratio: e.target.value as '1:8' | '1:16',
                  })
                }
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all cursor-pointer"
              >
                <option value="1:8">Splitter 1:8 (8 Puertos)</option>
                <option value="1:16">Splitter 1:16 (16 Puertos)</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Estado Operativo
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'activo' | 'alerta' | 'mantenimiento' | 'inactivo',
                  })
                }
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all cursor-pointer"
              >
                <option value="activo">Activo (Operativo)</option>
                <option value="alerta">Alerta</option>
                <option value="mantenimiento">En Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Dirección Física / Ubicación de Poste
            </label>
            <Input
              placeholder="ej. Jr. Bolognesi 580, Chiclayo"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#1e293b] flex items-center gap-[6px]">
                <MapPin size={14} className="text-[#0066ff]" />
                Coordenadas Geográficas (WGS84)
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
                {geoLocating ? 'Obteniendo GPS...' : 'Obtener mi ubicación'}
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

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Observaciones / Notas de Campo
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ej. Instalada en poste de concreto C-12 con reserva de 10m..."
              className="w-full p-[10px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-[10px] border-t border-[#f1f5f9] flex items-center justify-end gap-[10px]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-[6px]">
              <Check size={14} />
              {saving ? 'Guardando...' : napToEdit ? 'Actualizar Caja' : 'Crear Caja NAP'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
