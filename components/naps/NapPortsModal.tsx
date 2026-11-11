'use client';

import React, { useEffect, useState } from 'react';
import { X, Network, User, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

  if (!napId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-[16px] animate-in fade-in duration-200">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-[20px] py-[16px] border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0f172a] flex items-center gap-[8px]">
                {napCode} — Distribución de Puertos
                <Badge variant="neutral">{capacity} Puertos</Badge>
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Asignación de splitters ópticos e identificación de abonados por puerto.
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

        {/* Content */}
        <div className="p-[20px] overflow-y-auto flex-1">
          {loading ? (
            <div className="py-[40px] flex flex-col items-center justify-center gap-[12px] text-[#64748b]">
              <div className="w-[32px] h-[32px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px]">Cargando matriz de puertos...</p>
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
                    className={`p-[14px] rounded-[10px] border transition-all ${
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
        </div>

        {/* Footer */}
        <div className="px-[20px] py-[14px] bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
