'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { apiClient } from '@/lib/api/client';
import { CustomerItem, CustomerFormData } from '@/types/customers';
import { ZoneOption, PaginatedResponse } from '@/types/api';
import { NapItem, NapPortItem } from '@/types/naps';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  customerToEdit?: CustomerItem | null;
  zones: ZoneOption[];
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  customerToEdit,
  zones,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    zone_id: customerToEdit?.zone?.id || (zones[0]?.id ?? null),
    code: customerToEdit?.code || '',
    full_name: customerToEdit?.full_name || '',
    document: customerToEdit?.document || '',
    phone: customerToEdit?.phone || '',
    address: customerToEdit?.address || '',
    plan: customerToEdit?.plan || '100 Mbps',
    nap_port_id: customerToEdit?.nap ? null : null,
    status: customerToEdit?.status || 'activo',
  });

  const [naps, setNaps] = useState<NapItem[]>([]);
  const [selectedNapId, setSelectedNapId] = useState<number | null>(
    customerToEdit?.nap?.id || null
  );
  const [availablePorts, setAvailablePorts] = useState<NapPortItem[]>([]);
  const [loadingPorts, setLoadingPorts] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    apiClient<PaginatedResponse<NapItem>>('/naps?per_page=50')
      .then((res) => {
        if (isMounted && res.items) {
          setNaps(res.items);
        }
      })
      .catch((err) => {
        console.error('Error cargando NAPs para cliente:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!selectedNapId) {
      setAvailablePorts([]);
      return;
    }

    let isMounted = true;
    setLoadingPorts(true);

    apiClient<NapPortItem[]>(`/naps/${selectedNapId}/ports`)
      .then((ports) => {
        if (isMounted) {
          setAvailablePorts(ports);
        }
      })
      .catch((err) => {
        console.error('Error cargando puertos NAP:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingPorts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedNapId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (customerToEdit) {
        await apiClient(`/customers/${customerToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiClient('/customers', {
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
        setError('Ocurrió un error al guardar el cliente.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? `Editar Abonado ${customerToEdit.code}` : 'Nuevo Abonado FTTH'}
      subtitle="Registro de datos de cliente, plan de fibra y asignación de puerto NAP."
      icon={<UserPlus size={20} />}
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
              const form = document.getElementById('customer-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            <Check size={14} />
            {saving ? 'Guardando...' : customerToEdit ? 'Actualizar Cliente' : 'Crear Cliente'}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
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
              placeholder="ej. C-015"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!customerToEdit}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              DNI / RUC
            </label>
            <Input
              placeholder="ej. 70145896"
              value={formData.document || ''}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
            Nombre Completo *
          </label>
          <Input
            placeholder="ej. Juan Pérez Quispe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Teléfono
            </label>
            <Input
              placeholder="ej. 974 582 147"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Plan Contratado
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              <option value="50 Mbps">50 Mbps (Simétrico)</option>
              <option value="100 Mbps">100 Mbps (Simétrico)</option>
              <option value="200 Mbps">200 Mbps (Simétrico)</option>
              <option value="500 Mbps">500 Mbps (Simétrico)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
            Dirección del Abonado
          </label>
          <Input
            placeholder="ej. Jr. Bolognesi 450, Chiclayo"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {!customerToEdit && (
          <div className="p-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] flex flex-col gap-[10px]">
            <span className="text-[12px] font-bold text-[#0f172a]">
              Conexión Óptica Inicial (Opcional)
            </span>
            <div className="grid grid-cols-2 gap-[12px]">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] mb-[4px]">
                  Caja NAP
                </label>
                <select
                  value={selectedNapId || ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null;
                    setSelectedNapId(id);
                    setFormData({ ...formData, nap_port_id: null });
                  }}
                  className="w-full h-[36px] px-[10px] text-[12px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[6px] cursor-pointer"
                >
                  <option value="">Sin conectar</option>
                  {naps.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.code} ({n.occupied_ports}/{n.port_capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] mb-[4px]">
                  Puerto Libre
                </label>
                <select
                  value={formData.nap_port_id || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nap_port_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  disabled={!selectedNapId || loadingPorts}
                  className="w-full h-[36px] px-[10px] text-[12px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[6px] cursor-pointer disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]"
                >
                  <option value="">
                    {loadingPorts
                      ? 'Cargando puertos...'
                      : availablePorts.length === 0
                      ? 'Sin puertos'
                      : 'Seleccione puerto...'}
                  </option>
                  {availablePorts.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.status !== 'libre'}>
                      Puerto {p.port_number} ({p.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-[12px]">
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

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Estado de Servicio
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'activo' | 'pendiente' | 'suspendido',
                })
              }
              className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
            >
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>
      </form>
    </SlideOverDrawer>
  );
};
