'use client';

import React, { useState } from 'react';
import { MapPin, Locate, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
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
      setError('El código y nombre son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        name,
        description,
        center_lat: centerLat,
        center_lng: centerLng,
      };

      if (zoneToEdit) {
        await apiClient(`/zones/${zoneToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient('/zones', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al guardar la zona.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={zoneToEdit ? `Editar Zona ${zoneToEdit.code}` : 'Nueva Zona de Cobertura'}
      subtitle="Definición de distrito, cuadrante y coordenadas de centrado GIS."
      icon={<MapPin size={20} />}
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
              const form = document.getElementById('zone-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            <Check size={14} />
            {saving ? 'Guardando...' : zoneToEdit ? 'Actualizar Zona' : 'Crear Zona'}
          </Button>
        </>
      }
    >
      <form id="zone-form" onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
        {error && (
          <div className="p-[12px] rounded-[8px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[13px] flex items-center gap-[8px]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Código *
            </label>
            <Input
              placeholder="ej. ZON-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Nombre de la Zona *
            </label>
            <Input
              placeholder="ej. Distrito de Chiclayo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
            Descripción o Alcance
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ej. Cuadrante norte que comprende Parque Principal..."
            className="w-full p-[10px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all resize-none"
          />
        </div>

        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#1e293b] flex items-center gap-[6px]">
              <MapPin size={14} className="text-[#0066ff]" />
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
      </form>
    </SlideOverDrawer>
  );
};
