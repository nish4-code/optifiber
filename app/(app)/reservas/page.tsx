'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MapPin,
  RefreshCw,
  Edit2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { SpliceClosureItem } from '@/types/closures';
import { PaginatedResponse, ZoneOption } from '@/types/api';
import { ClosureFormModal } from '@/components/closures/ClosureFormModal';

export default function ReservasPage() {
  const [data, setData] = useState<PaginatedResponse<SpliceClosureItem> | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [closureToEdit, setClosureToEdit] = useState<SpliceClosureItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient<ZoneOption[]>('/zones')
      .then((res) => {
        if (isMounted && Array.isArray(res)) setZones(res);
      })
      .catch((err) => console.error('Error cargando zonas:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    params.set('type', 'reserva');
    params.set('page', currentPage.toString());
    params.set('per_page', perPage.toString());
    if (selectedZone) params.set('zone_id', selectedZone);

    apiClient<PaginatedResponse<SpliceClosureItem>>(`/closures?${params.toString()}`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error('Error cargando reservas:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, perPage, selectedZone, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const filteredItems =
    data?.items.filter(
      (r) =>
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return <Badge variant="success">DISPONIBLE</Badge>;
      case 'mantenimiento':
        return <Badge variant="info">MANTENIMIENTO</Badge>;
      case 'alerta':
        return <Badge variant="warning">ALERTA</Badge>;
      default:
        return <Badge variant="neutral">INACTIVO</Badge>;
    }
  };

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68] flex items-center gap-[8px]">
            Reservas Técnicas de Fibra
            <span className="text-[12px] font-normal text-[#64748b] bg-[#f1f5f9] px-[8px] py-[2px] rounded-full">
              {data?.total || 0} registradas
            </span>
          </h1>
          <p className="text-[13px] text-[#64748b]">
            Seguimiento de bucles de mantenimiento, reservas en cámaras y excedentes de cable para cortes o empalmes.
          </p>
        </div>

        <div className="flex items-center gap-[8px]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-[6px] text-[#64748b]"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refrescar
          </Button>
          <Link href="/mapa">
            <Button variant="outline" size="sm" className="gap-[6px]">
              <MapPin className="w-[14px] h-[14px]" />
              <span>Ver en mapa</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setClosureToEdit({
                id: 0,
                code: '',
                name: '',
                type: 'reserva',
                mount_type: 'poste',
                fiber_capacity: 144,
                latitude: -6.7725,
                longitude: -79.8415,
                reserve_meters: 25,
                status: 'activo',
              });
              setIsFormModalOpen(true);
            }}
            className="gap-[6px]"
          >
            <Plus className="w-[14px] h-[14px]" />
            <span>Nueva reserva</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-[16px] shadow-xs flex flex-col md:flex-row gap-[12px] items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por código o nombre de reserva..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-[10px]">
          <select
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[38px] px-[12px] text-[13px] text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] cursor-pointer"
          >
            <option value="">Todas las zonas</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id.toString()}>
                {z.name}
              </option>
            ))}
          </select>

          {(search || selectedZone) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedZone('');
                setCurrentPage(1);
              }}
              className="text-[#64748b] hover:text-[#0f172a] gap-[6px]"
            >
              <RotateCcw size={14} />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla Paginada */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-[#64748b] border-b border-[#f1f5f9]">
                <th className="py-[12px] px-[16px] font-bold">Código</th>
                <th className="py-[12px] px-[16px] font-bold">Nombre / Ubicación</th>
                <th className="py-[12px] px-[16px] font-bold">Zona</th>
                <th className="py-[12px] px-[16px] font-bold">Soporte / Cable</th>
                <th className="py-[12px] px-[16px] font-bold">Metros</th>
                <th className="py-[12px] px-[16px] font-bold">Estado</th>
                <th className="py-[12px] px-[16px] font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#334155]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-[40px] text-center text-[#64748b]">
                    Cargando reservas técnicas...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-[40px] text-center text-[#64748b]">
                    No se encontraron reservas de fibra registradas.
                  </td>
                </tr>
              ) : (
                filteredItems.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-[14px] px-[16px] font-semibold text-[#153b68]">
                      <div className="flex items-center gap-[8px]">
                        <span className="w-[8px] h-[8px] rounded-full bg-[#8b5cf6]" />
                        <span>{r.code}</span>
                      </div>
                    </td>
                    <td className="py-[14px] px-[16px] font-medium text-[#0f172a]">
                      {r.name}
                    </td>
                    <td className="py-[14px] px-[16px] text-[#64748b]">
                      {r.zone?.name || 'Sin zona'}
                    </td>
                    <td className="py-[14px] px-[16px]">
                      <span className="capitalize font-medium text-[#334155] block">
                        En {r.mount_type}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748b]">
                        Cable de {r.fiber_capacity} hilos
                      </span>
                    </td>
                    <td className="py-[14px] px-[16px] font-mono font-semibold text-[#8b5cf6]">
                      {r.reserve_meters || 0} m
                    </td>
                    <td className="py-[14px] px-[16px]">{getStatusBadge(r.status)}</td>
                    <td className="py-[14px] px-[16px] text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-[6px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setClosureToEdit(r);
                            setIsFormModalOpen(true);
                          }}
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

        {data && data.total > 0 && (
          <div className="px-[16px] py-[12px] bg-[#f8fafc] border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-[10px] text-[12px] text-[#64748b]">
            <div className="flex items-center gap-[8px]">
              <span>
                Mostrando <strong className="text-[#0f172a]">{data.from || 0}</strong> a{' '}
                <strong className="text-[#0f172a]">{data.to || 0}</strong> de{' '}
                <strong className="text-[#0f172a]">{data.total}</strong> reservas
              </span>
              <span className="hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-[4px]">
                <span>Por pág:</span>
                <select
                  value={data.perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
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
                onClick={() => setCurrentPage(data.currentPage - 1)}
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
                onClick={() => setCurrentPage(data.currentPage + 1)}
                className="h-[30px] px-[8px] text-[12px] gap-[4px]"
              >
                Siguiente
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <ClosureFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSaved={handleRefresh}
          closureToEdit={closureToEdit && closureToEdit.id > 0 ? closureToEdit : null}
          zones={zones}
          defaultType="reserva"
        />
      )}
    </div>
  );
}
