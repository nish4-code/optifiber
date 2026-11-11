'use client';

import React, { useState } from 'react';
import { Layers, MapPin, Locate, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { apiClient } from '@/lib/api/client';
import { SpliceClosureItem, ClosureFormData } from '@/types/closures';
import { ZoneOption } from '@/types/api';

interface ClosureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  closureToEdit?: SpliceClosureItem | null;
  zones: ZoneOption[];
  defaultType?: 'empalme' | 'distribucion' | 'reserva';
}

export const ClosureFormModal: React.FC<ClosureFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  closureToEdit,
  zones,
  defaultType = 'empalme',
}) => {
  const [formData, setFormData] = useState<ClosureFormData>({
    zone_id: closureToEdit?.zone?.id || (zones[0]?.id ?? null),
    code: closureToEdit?.code || '',
    name: closureToEdit?.name || '',
    type: closureToEdit?.type || defaultType,
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por el navegador.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        });
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
    setSaving(true);
    setError(null);

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
        setError('Ocurrió un error al guardar la mufa/reserva.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={closureToEdit ? `Editar ${closureToEdit.code}` : 'Nueva Mufa / Reserva de Fibra'}
      subtitle="Configuración técnica de empalme, capacidad de hilos y reserva."
      icon={<Layers size={20} />}
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
              const form = document.getElementById('closure-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            <Check size={14} />
            {saving ? 'Guardando...' : closureToEdit ? 'Actualizar Mufa' : 'Crear Mufa'}
          </Button>
        </>
      }
    >
      <form id="closure-form" onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
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
              placeholder="ej. MUFA-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Zona
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
            placeholder="ej. Mufa Principal Tamburco"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Tipo de Cierre
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
              <option value="empalme">Empalme Troncal</option>
              <option value="distribucion">Distribución</option>
              <option value="reserva">Bucle de Reserva</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Montaje
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
              <option value="poste">Poste</option>
              <option value="camara">Cámara Subterránea</option>
              <option value="pared">Pared</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Capacidad de Hilos
            </label>
            <select
              value={formData.fiber_capacity}
              onChange={(e) =>
                setFormData({ ...formData, fiber_capacity: Number(e.target.value) })
              }
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              <option value={24}>24 Hilos</option>
              <option value={48}>48 Hilos</option>
              <option value={96}>96 Hilos</option>
              <option value={144}>144 Hilos</option>
              <option value={288}>288 Hilos</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Reserva Técnica (m)
            </label>
            <Input
              type="number"
              step="any"
              placeholder="15.0"
              value={formData.reserve_meters}
              onChange={(e) =>
                setFormData({ ...formData, reserve_meters: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
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
            className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
          >
            <option value="activo">Activo</option>
            <option value="alerta">Alerta</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="inactivo">Inactivo</option>
          </select>
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
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                }
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
