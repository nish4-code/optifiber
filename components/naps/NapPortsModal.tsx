'use client';

import React, { useEffect, useState } from 'react';
import { Network, User, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SlideOverDrawer } from '@/components/ui/SlideOverDrawer';
import { apiClient } from '@/lib/api/client';
import { NapPortItem } from '@/types/naps';

interface NapPortsModalProps {
  napId: number | null;
  napCode: string;
  onClose: () => void;
}

export const NapPortsModal: React.FC<NapPortsModalProps> = ({
  napId,
  napCode,
  onClose,
}) => {
  const [ports, setPorts] = useState<NapPortItem[]>([]);
  const [capacity, setCapacity] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!napId) return;

    let isMounted = true;

    apiClient<{ nap_code: string; port_capacity: number; ports: NapPortItem[] }>(
      `/naps/${napId}/ports`
    )
      .then((res) => {
        if (!isMounted) return;
        setPorts(res.ports || []);
        setCapacity(res.port_capacity || 8);
      })
      .catch((err) => {
        console.error('Error cargando puertos de NAP:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [napId]);

  return (
    <SlideOverDrawer
      isOpen={!!napId}
      onClose={onClose}
      title={`Puertos de Distribución — ${napCode}`}
      subtitle={`Gestión de abonados conectados por splitter óptico (Capacidad: ${capacity} puertos).`}
      icon={<Network size={20} />}
      maxWidth="xl"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {loading ? (
        <div className="py-[60px] text-center text-[#64748b] text-[13px]">
          Cargando asignación de puertos...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
          {ports.map((port) => {
            const isOccupied = port.status === 'ocupado';
            const isFree = port.status === 'libre';
            const isDamaged = port.status === 'dañado';

            return (
              <div
                key={port.id}
                className={`p-[14px] rounded-[8px] border transition-all ${
                  isOccupied
                    ? 'border-[#bfdbfe] bg-[#eff6ff]/40'
                    : isFree
                    ? 'border-[#bbf7d0] bg-[#f0fdf4]/40'
                    : isDamaged
                    ? 'border-[#fecaca] bg-[#fef2f2]/40'
                    : 'border-[#fef08a] bg-[#fefce8]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="w-[26px] h-[26px] rounded-full bg-white border border-[#cbd5e1] flex items-center justify-center text-[12px] font-bold text-[#1e293b] shadow-2xs">
                      {port.port_number}
                    </span>
                    <span className="text-[13px] font-semibold text-[#0f172a]">
                      Puerto {port.port_number}
                    </span>
                  </div>
                  <Badge
                    variant={
                      isOccupied
                        ? 'info'
                        : isFree
                        ? 'success'
                        : isDamaged
                        ? 'critical'
                        : 'warning'
                    }
                  >
                    {port.status.toUpperCase()}
                  </Badge>
                </div>

                {isOccupied && port.customer ? (
                  <div className="mt-[8px] pt-[8px] border-t border-[#e2e8f0]/60 flex flex-col gap-[3px] text-[12px]">
                    <div className="flex items-center gap-[6px] font-medium text-[#1e40af]">
                      <User size={13} />
                      <span>{port.customer.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#64748b]">
                      <span>Cod: {port.customer.code}</span>
                      <span className="font-semibold text-[#0f172a]">
                        {port.customer.plan || 'Sin plan'}
                      </span>
                    </div>
                    {port.customer.phone && (
                      <div className="text-[11px] text-[#64748b]">
                        Tel: {port.customer.phone}
                      </div>
                    )}
                  </div>
                ) : isFree ? (
                  <div className="mt-[8px] pt-[8px] border-t border-[#e2e8f0]/60 flex items-center gap-[6px] text-[12px] text-[#166534]">
                    <CheckCircle2 size={13} />
                    <span>Disponible para nueva acometida</span>
                  </div>
                ) : (
                  <div className="mt-[8px] pt-[8px] border-t border-[#e2e8f0]/60 flex items-center gap-[6px] text-[12px] text-[#991b1b]">
                    {isDamaged ? <Ban size={13} /> : <AlertCircle size={13} />}
                    <span>Puerto no utilizable temporalmente</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SlideOverDrawer>
  );
};
