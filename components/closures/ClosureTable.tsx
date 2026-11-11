'use client';

import React from 'react';
import Link from 'next/link';
import { Edit2, MapPin, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SpliceClosureItem } from '@/types/closures';
import { PaginatedResponse } from '@/types/api';

interface ClosureTableProps {
  data: PaginatedResponse<SpliceClosureItem> | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEditClosure: (closure: SpliceClosureItem) => void;
}

export const ClosureTable: React.FC<ClosureTableProps> = ({
  data,
  loading,
  onPageChange,
  onPerPageChange,
  onEditClosure,
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

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              <th className="py-[12px] px-[16px]">Código</th>
              <th className="py-[12px] px-[16px]">Nombre</th>
              <th className="py-[12px] px-[16px]">Tipo / Montaje</th>
              <th className="py-[12px] px-[16px]">Capacidad</th>
              <th className="py-[12px] px-[16px]">Fusiones</th>
              <th className="py-[12px] px-[16px]">Reserva</th>
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
                    <span className="text-[12px]">Cargando mufas y reservas...</span>
                  </div>
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-[40px] text-center text-[#64748b]">
                  No se encontraron mufas de empalme registradas.
                </td>
              </tr>
            ) : (
              data.items.map((closure) => (
                <tr key={closure.id} className="hover:bg-[#f8fafc] transition-colors">
                  {/* Código */}
                  <td className="py-[14px] px-[16px] font-semibold text-[#0f172a] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#0066ff] shrink-0" />
                      <span>{closure.code}</span>
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="py-[14px] px-[16px] font-medium text-[#0f172a]">
                    <div>
                      <span>{closure.name}</span>
                      {closure.zone && (
                        <span className="block text-[11px] text-[#64748b]">
                          {closure.zone.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tipo / Montaje */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    <span className="capitalize font-medium text-[#334155]">{closure.type}</span>
                    <span className="text-[#64748b] text-[12px] block capitalize">
                      En {closure.mount_type}
                    </span>
                  </td>

                  {/* Capacidad */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    <span className="px-[8px] py-[3px] bg-[#f1f5f9] text-[#1e293b] rounded-[6px] font-mono text-[12px] font-semibold">
                      {closure.fiber_capacity} Hilos
                    </span>
                  </td>

                  {/* Fusiones Activas */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    <span className="font-semibold text-[#0f172a]">
                      {closure.splices_count ?? 0}
                    </span>
                    <span className="text-[11px] text-[#64748b]"> empalmes</span>
                  </td>

                  {/* Reserva */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap text-[#64748b]">
                    {closure.reserve_meters ? `${closure.reserve_meters} m` : 'Sin reserva'}
                  </td>

                  {/* Estado */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap">
                    {getStatusBadge(closure.status)}
                  </td>

                  {/* Acciones */}
                  <td className="py-[14px] px-[16px] whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-[6px]">
                      <Link href={`/mufas/${closure.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-[30px] px-[8px] text-[12px] text-[#0066ff] hover:bg-[#0066ff]/10"
                        >
                          <Layers size={14} className="mr-[4px]" />
                          Matriz de Fusión
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClosure(closure)}
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
              <strong className="text-[#0f172a]">{data.total}</strong> mufas
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
