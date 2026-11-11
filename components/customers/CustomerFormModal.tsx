'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

  // Cargar lista de NAPs
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

  // Cargar puertos de la NAP seleccionada
  useEffect(() => {
    if (!selectedNapId) return;

    let isMounted = true;

    apiClient<{ ports: NapPortItem[] }>(`/naps/${selectedNapId}/ports`)
      .then((res) => {
        if (isMounted) {
          const ports = res.ports || [];
          setAvailablePorts(ports);
          const firstFree = ports.find((p) => p.status === 'libre');
          if (firstFree && !formData.nap_port_id) {
            setFormData((prev) => ({ ...prev, nap_port_id: firstFree.id }));
          }
        }
      })
      .catch((err) => {
        console.error('Error cargando puertos:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingPorts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedNapId, formData.nap_port_id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError('El nombre del abonado es obligatorio.');
      return;
    }

    if (!customerToEdit && !formData.code.trim()) {
      setError('El código de cliente es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      if (customerToEdit) {
        await apiClient(`/customers/${customerToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            plan: formData.plan,
            status: formData.status,
          }),
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
        setError('Ocurrió un error al guardar el abonado.');
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
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a]">
                {customerToEdit ? `Editar Abonado ${customerToEdit.code}` : 'Nuevo Abonado FTTH'}
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Registro de datos de cliente, plan de fibra y asignación de puerto NAP.
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
              placeholder="ej. Carlos Eduardo Sánchez"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Teléfono / WhatsApp
              </label>
              <Input
                placeholder="ej. 987 654 321"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
                Plan de Internet
              </label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full h-[40px] px-[12px] text-[13px] text-[#334155] bg-white border border-[#cbd5e1] rounded-[8px] cursor-pointer"
              >
                <option value="50 Mbps">50 Mbps (Básico)</option>
                <option value="100 Mbps">100 Mbps (Estándar)</option>
                <option value="200 Mbps">200 Mbps (Avanzado)</option>
                <option value="500 Mbps">500 Mbps (Empresarial)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-[6px]">
              Dirección de Instalación
            </label>
            <Input
              placeholder="ej. Jr. San José 420, Chiclayo"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {!customerToEdit && (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col gap-[12px]">
              <span className="text-[12px] font-bold text-[#1e293b]">
                Asignación de Acometida Óptica
              </span>

              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[11px] text-[#64748b] mb-[4px]">Caja NAP</label>
                  <select
                    value={selectedNapId || ''}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      setSelectedNapId(id);
                      if (!id) setAvailablePorts([]);
                    }}
                    className="w-full h-[36px] px-[10px] text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] cursor-pointer"
                  >
                    <option value="">Seleccione NAP...</option>
                    {naps.map((nap) => (
                      <option key={nap.id} value={nap.id}>
                        {nap.code} ({nap.free_ports} libres)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748b] mb-[4px]">
                    Puerto Disponible
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
                    className="w-full h-[36px] px-[10px] text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] cursor-pointer"
                  >
                    <option value="">
                      {loadingPorts
                        ? 'Cargando puertos...'
                        : availablePorts.length === 0
                        ? 'Sin puertos'
                        : 'Seleccione puerto...'}
                    </option>
                    {availablePorts.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.status !== 'libre'}
                      >
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

          {/* Footer */}
          <div className="pt-[14px] border-t border-[#f1f5f9] flex items-center justify-end gap-[10px] mt-[10px]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-[6px]">
              <Check size={14} />
              {saving ? 'Guardando...' : customerToEdit ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
