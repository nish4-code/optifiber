'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Edit2, MapPin, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NapItem } from '@/types/naps';
import { PaginatedResponse } from '@/types/api';

interface NapTableProps {
  data: PaginatedResponse<NapItem> | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewPorts: (nap: NapItem) => void;
  onEditNap: (nap: NapItem) => void;
}

export const NapTable: React.FC<NapTableProps> = ({
  data,
  loading,
  onPageChange,
  onPerPageChange,
  onViewPorts,
  onEditNap,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return <Badge variant="success">ACTIVO</Badge>;
      case 'alerta':
        return <Badge variant="warning">ALERTA</Badge>;
      case 'mantenimiento':
        return <Badge variant="info">MANTENIMIENTO</Badge>;
      default:
        return <Badge variant="neutral">INACTIVO</Badge>;
    }
  };

  const getOccupancyColor = (pct: number) => {
    if (pct >= 85) return 'bg-[#ef4444]'; // Alerta / Saturación
    if (pct >= 70) return 'bg-[#f59e0b]'; // Precaución
    return 'bg-[#10b981]'; // Óptimo
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              <th className="py-[12px] px-[16px]">Código</th>
              <th className="py-[12px] px-[16px]">Nombre / Ruta</th>
              <th className="py-[12px] px-[16px]">Zona / Dirección</th>
              <th className="py-[12px] px-[16px]">Splitter</th>
              <th className="py-[12px] px-[16px]">Ocupación</th>
              <th className="py-[12px] px-[16px]">Puertos Libres</th>
              <th className="py-[12px] px-[16px]">Estado</th>
              <th className="py-[12px] px-[16px] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#334155]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-[40px] text-center text-[#64748b]">
                  <div className="flex flex-col items-center justify-center gap-[8px]">
                    <div className="w-[28px] h-[28px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[12px]">Cargando cajas NAP...</span>
                  </div>
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-[40px] text-center text-[#64748b]">
                  No se encontraron cajas NAP con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              data.items.map((nap) => {
                const pct = nap.occupancy_percentage || 0;
                const isHighOccupancy = pct >= 85;

                return (
                  <tr key={nap.id} className="hover:bg-[#f8fafc] transition-colors">
                    {/* Código */}
                    <td className="py-[14px] px-[16px] font-semibold text-[#0f172a] whitespace-nowrap">
                      <div className="flex items-center gap-[6px]">
                        <span
                          className="w-[8px] h-[8px] rounded-full shrink-0"
                          style={{ backgroundColor: nap.map_color || '#10b981' }}
                        />
                        <span>{nap.code}</span>
                      </div>
                    </td>

                    {/* Nombre */}
                    <td className="py-[14px] px-[16px] font-medium text-[#0f172a]">
                      {nap.name}
                    </td>

                    {/* Dirección */}
                    <td className="py-[14px] px-[16px] text-[#64748b] max-w-[220px] truncate">
                      <span className="block text-[#0f172a] font-medium text-[12px]">
                        {nap.zone?.name || 'Sin zona'}
                      </span>
                      <span className="text-[11px] text-[#64748b]">{nap.address}</span>
                    </td>

                    {/* Splitter */}
                    <td className="py-[14px] px-[16px] whitespace-nowrap">
                      <span className="px-[8px] py-[3px] bg-[#f1f5f9] text-[#334155] rounded-[6px] font-mono text-[12px] font-semibold">
                        {nap.splitter_ratio}
                      </span>
                    </td>

                    {/* Ocupación */}
                    <td className="py-[14px] px-[16px] whitespace-nowrap">
                      <div className="w-[120px]">
                        <div className="flex items-center justify-between text-[11px] mb-[4px]">
                          <span className="font-semibold text-[#0f172a]">{pct}%</span>
                          <span className="text-[#64748b]">
                            {nap.occupied_ports}/{nap.port_capacity}
                          </span>
                        </div>
                        <div className="w-full h-[6px] rounded-full bg-[#e2e8f0] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getOccupancyColor(pct)}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Puertos Libres */}
                    <td className="py-[14px] px-[16px] whitespace-nowrap">
                      <span
                        className={`text-[12px] font-semibold ${
                          nap.free_ports === 0
                            ? 'text-[#ef4444]'
                            : nap.free_ports <= 2
                            ? 'text-[#f59e0b]'
                            : 'text-[#10b981]'
                        }`}
                      >
                        {nap.free_ports} {nap.free_ports === 1 ? 'puerto' : 'puertos'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-[14px] px-[16px] whitespace-nowrap">
                      <div className="flex items-center gap-[6px]">
                        {getStatusBadge(nap.status)}
                        {isHighOccupancy && (
                          <span title="Capacidad mayor al 85%">
                            <AlertTriangle size={14} className="text-[#f59e0b]" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-[14px] px-[16px] whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-[6px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewPorts(nap)}
                          className="h-[30px] px-[8px] text-[12px] text-[#0066ff] hover:bg-[#0066ff]/10"
                        >
                          <Eye size={14} className="mr-[4px]" />
                          Puertos
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditNap(nap)}
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
                );
              })
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
              <strong className="text-[#0f172a]">{data.total}</strong> cajas
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
