'use client';

import React, { useState } from 'react';
import { X, MapPin, Locate, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import type { MapZone } from '@/types/map';

interface ZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  zoneToEdit?: MapZone | null;
}

export const ZoneFormModal: React.FC<ZoneFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  zoneToEdit,
}) => {
  const [code, setCode] = useState(zoneToEdit?.code || '');
  const [name, setName] = useState(zoneToEdit?.name || '');
  const [description, setDescription] = useState(zoneToEdit?.description || '');
  const [centerLat, setCenterLat] = useState<number>(zoneToEdit?.center_lat ?? -6.7725);
  const [centerLng, setCenterLng] = useState<number>(zoneToEdit?.center_lng ?? -79.8402);

  const [saving, setSaving] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenterLat(Number(position.coords.latitude.toFixed(6)));
        setCenterLng(Number(position.coords.longitude.toFixed(6)));
        setGeoLocating(false);
      },
      () => {
        setError('No se pudo obtener la ubicación GPS.');
        setGeoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError('El código y nombre de zona son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      if (zoneToEdit) {
        await apiClient(`/zones/${zoneToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            description,
            center_lat: centerLat,
            center_lng: centerLng,
          }),
        });
      } else {
        await apiClient('/zones', {
          method: 'POST',
          body: JSON.stringify({
            code,
            name,
            description,
            center_lat: centerLat,
            center_lng: centerLng,
          }),
        });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error guardando zona.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-[16px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">
                {zoneToEdit ? `Editar Zona ${zoneToEdit.code}` : 'Nueva Zona / Sector FTTH'}
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Delimitación geográfica y centro de mapa en WGS84.
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

        <form onSubmit={handleSubmit} className="p-[20px] flex flex-col gap-[14px] overflow-y-auto">
          {error && (
            <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Código de Zona *
            </label>
            <Input
              placeholder="ej. ZON-JLO"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!zoneToEdit}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Nombre de Zona o Ciudad *
            </label>
            <Input
              placeholder="ej. José Leonardo Ortiz — Sector Norte"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Descripción / Cobertura
            </label>
            <Input
              placeholder="ej. Sector urbano Chiclayo Norte"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#1e293b]">
                Coordenadas Centro del Mapa
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                disabled={geoLocating}
                className="text-[12px] text-[#0066ff] h-[28px] gap-[4px]"
              >
                <Locate size={12} />
                {geoLocating ? 'Obteniendo...' : 'GPS Actual'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <span className="block text-[11px] text-[#64748b] mb-[4px]">Latitud</span>
                <input
                  type="number"
                  step="any"
                  value={centerLat}
                  onChange={(e) => setCenterLat(parseFloat(e.target.value) || 0)}
                  className="w-full h-[36px] px-[10px] text-[12px] font-mono bg-white border border-[#cbd5e1] rounded-[6px]"
                  required
                />
              </div>
              <div>
                <span className="block text-[11px] text-[#64748b] mb-[4px]">Longitud</span>
                <input
                  type="number"
                  step="any"
                  value={centerLng}
                  onChange={(e) => setCenterLng(parseFloat(e.target.value) || 0)}
                  className="w-full h-[36px] px-[10px] text-[12px] font-mono bg-white border border-[#cbd5e1] rounded-[6px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-[10px] border-t border-[#f1f5f9] flex justify-end gap-[10px]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-[6px]">
              <Check size={14} />
              {saving ? 'Guardando...' : zoneToEdit ? 'Actualizar Zona' : 'Crear Zona'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
