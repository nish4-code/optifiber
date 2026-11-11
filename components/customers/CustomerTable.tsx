'use client';

import React from 'react';
import Link from 'next/link';
import { User, Phone, MapPin, Edit2, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CustomerItem } from '@/types/customers';
import { PaginatedResponse } from '@/types/api';

interface CustomerTableProps {
  data: PaginatedResponse<CustomerItem> | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewCustomer: (customer: CustomerItem) => void;
  onEditCustomer: (customer: CustomerItem) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  data,
  loading,
  onPageChange,
  onPerPageChange,
  onViewCustomer,
  onEditCustomer,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return <Badge variant="success">ACTIVO</Badge>;
      case 'pendiente':
        return <Badge variant="warning">PENDIENTE</Badge>;
      case 'suspendido':
        return <Badge variant="critical">SUSPENDIDO</Badge>;
      default:
        return <Badge variant="neutral">INACTIVO</Badge>;
    }
  };

  const getSignalBadge = (signalRx: number | string | null | undefined, onuStatus?: string) => {
    const num = signalRx !== null && signalRx !== undefined ? Number(signalRx) : NaN;
    if (isNaN(num)) {
      return (
        <span className="text-[11px] text-[#94a3b8] italic">
          {onuStatus || 'Sin ONT'}
        </span>
      );
    }

    // Umbrales de señal óptica según 06-FIGMA-SPECS (-8 a -24 Óptimo, -24 a -27 Degradado, < -27 Crítico)
    let badgeVariant: 'success' | 'warning' | 'critical' = 'success';
    let label = 'Óptimo';

    if (num < -27) {
      badgeVariant = 'critical';
      label = 'Crítico';
    } else if (num < -24) {
      badgeVariant = 'warning';
      label = 'Degradado';
    }

    return (
      <div className="flex items-center gap-[6px]">
        <Badge variant={badgeVariant}>
          <Activity size={10} className="mr-[3px]" />
          {num.toFixed(1)} dBm
        </Badge>
        <span className="text-[10px] text-[#64748b] hidden xl:inline">({label})</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              <th className="py-[12px] px-[16px]">Código</th>
              <th className="py-[12px] px-[16px]">Abonado / Contacto</th>
              <th className="py-[12px] px-[16px]">Plan</th>
              <th className="py-[12px] px-[16px]">Caja NAP / Puerto</th>
              <th className="py-[12px] px-[16px]">Potencia Rx (SmartOLT)</th>
              <th className="py-[12px] px-[16px]">Estado</th>
              <th className="py-[12px] px-[16px] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#334155]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-[40px] text-center text-[#64748b]">
                  <div className="flex flex-col items-center justify-center gap-[8px]">
                    <div className="w-[28px] h-[28px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[12px]">Cargando cartera de abonados...</span>
                  </div>
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-[40px] text-center text-[#64748b]">
                  No se encontraron abonados con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              data.items.map((c) => (
                <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                  {/* Código */}
                  <td className="py-[14px] px-[16px] font-semibold text-[#0f172a] whitespace-nowrap">
                    <span className="font-mono text-[12px] bg-[#f1f5f9] px-[6px] py-[2px] rounded-[4px] border border-[#e2e8f0]">
                      {c.code}
                    </span>
                  </td>

                  {/* Abonado */}
                  <td className="py-[14px] px-[16px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center font-bold text-[12px] shrink-0">
                        {c.full_name?.substring(0, 2).toUpperCase() || 'AB'}
                      </div>
                      <div>
                        <span className="font-semibold text-[#0f172a] block text-[13px]">
                          {c.full_name}
                        </span>
                        <div className="flex items-center gap-[8px] text-[11px] text-[#64748b]">
                          {c.document && <span>DNI: {c.document}</span>}
                          {c.phone && (
                            <span className="flex items-center gap-[2px]">
                              <Phone size={10} />
                              {c.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    <span className="px-[8px] py-[3px] bg-[#eff6ff] text-[#1e40af] rounded-[6px] font-semibold text-[12px]">
                      {c.plan}
                    </span>
                  </td>

                  {/* NAP / Puerto */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    {c.nap ? (
                      <div>
                        <span className="font-semibold text-[#0f172a] block text-[12px]">
                          {c.nap.code}
                        </span>
                        <span className="text-[11px] text-[#64748b]">
                          Puerto {c.nap.port_number}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#94a3b8] italic text-[12px]">Sin asignar</span>
                    )}
                  </td>

                  {/* Señal SmartOLT */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    {getSignalBadge(c.smartolt?.signal_rx, c.smartolt?.status)}
                  </td>

                  {/* Estado */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    {getStatusBadge(c.status)}
                  </td>

                  {/* Acciones */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-[6px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCustomer(c)}
                        className="h-[30px] px-[8px] text-[12px] text-[#0066ff] hover:bg-[#0066ff]/10"
                      >
                        <User size={14} className="mr-[4px]" />
                        Ficha Técnica
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCustomer(c)}
                        className="h-[30px] px-[8px] text-[12px] text-[#64748b] hover:text-[#0f172a]"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Link href="/mapa">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-[30px] px-[8px] text-[12px] text-[#64748b] hover:text-[#0066ff]"
                        >
                          <MapPin size={14} />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data && data.total > 0 && (
        <div className="px-[16px] py-[12px] bg-[#f8fafc] border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-[10px] text-[12px] text-[#64748b]">
          <div className="flex items-center gap-[8px]">
            <span>
              Mostrando <strong className="text-[#0f172a]">{data.from || 0}</strong> a{' '}
              <strong className="text-[#0f172a]">{data.to || 0}</strong> de{' '}
              <strong className="text-[#0f172a]">{data.total}</strong> abonados
            </span>
            <span className="hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-[4px]">
              <span>Por pág:</span>
              <select
                value={data.perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="h-[26px] px-[6px] text-[12px] bg-white border border-[#cbd5e1] rounded-[4px] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-[6px]">
            <Button
              variant="outline"
              size="sm"
              disabled={data.currentPage <= 1 || loading}
              onClick={() => onPageChange(data.currentPage - 1)}
              className="h-[30px] px-[8px] text-[12px] gap-[4px]"
            >
              <ChevronLeft size={14} />
              Anterior
            </Button>
            <span className="px-[8px] py-[4px] text-[12px] font-semibold text-[#0f172a]">
              Página {data.currentPage} de {data.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.currentPage >= data.lastPage || loading}
              onClick={() => onPageChange(data.currentPage + 1)}
              className="h-[30px] px-[8px] text-[12px] gap-[4px]"
            >
              Siguiente
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
