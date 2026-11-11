'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MapPin, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { SpliceClosureItem } from '@/types/closures';
import { PaginatedResponse, ZoneOption } from '@/types/api';
import { ClosureTable } from '@/components/closures/ClosureTable';
import { ClosureFormModal } from '@/components/closures/ClosureFormModal';

export default function MufasPage() {
  const [data, setData] = useState<PaginatedResponse<SpliceClosureItem> | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filtros y paginación
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [closureToEdit, setClosureToEdit] = useState<SpliceClosureItem | null>(null);

  // Cargar Zonas
  useEffect(() => {
    let isMounted = true;
    apiClient<ZoneOption[]>('/zones')
      .then((res) => {
        if (isMounted && Array.isArray(res)) {
          setZones(res);
        }
      })
      .catch((err) => {
        console.error('Error cargando zonas:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar Mufas paginadas
  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('per_page', perPage.toString());

    if (selectedZone) params.set('zone_id', selectedZone);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedType) params.set('type', selectedType);

    apiClient<PaginatedResponse<SpliceClosureItem>>(`/closures?${params.toString()}`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Error cargando mufas:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, perPage, selectedZone, selectedStatus, selectedType, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setSelectedZone('');
    setSelectedStatus('');
    setSelectedType('');
    setCurrentPage(1);
  };

  const handleOpenCreateModal = () => {
    setClosureToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (closure: SpliceClosureItem) => {
    setClosureToEdit(closure);
    setIsFormModalOpen(true);
  };

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68] flex items-center gap-[8px]">
            Mufas y Puntos de Empalme
            <span className="text-[12px] font-normal text-[#64748b] bg-[#f1f5f9] px-[8px] py-[2px] rounded-full">
              {data?.total || 0} registradas
            </span>
          </h1>
          <p className="text-[13px] text-[#64748b]">
            Gestión de mufas aéreas, subterráneas y reservas ópticas de hasta 144 hilos.
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
              <MapPin size={14} />
              Ver en Mapa GIS
            </Button>
          </Link>

          <Button size="sm" onClick={handleOpenCreateModal} className="gap-[6px]">
            <Plus size={16} />
            Nueva Mufa
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-[16px] shadow-xs flex flex-col md:flex-row gap-[12px] items-stretch md:items-center justify-between">
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

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[38px] px-[12px] text-[13px] text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            <option value="empalme">Empalme</option>
            <option value="distribucion">Distribución</option>
            <option value="reserva">Reserva Óptica</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[38px] px-[12px] text-[13px] text-[#334155] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="alerta">Alerta</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="inactivo">Inactivo</option>
          </select>

          {(selectedZone || selectedType || selectedStatus) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-[#64748b] hover:text-[#0f172a] gap-[6px]"
            >
              <RotateCcw size={14} />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla Paginada */}
      <ClosureTable
        data={data}
        loading={loading}
        onPageChange={(p) => setCurrentPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setCurrentPage(1);
        }}
        onEditClosure={handleOpenEditModal}
      />

      {/* Modal Crear / Editar */}
      {isFormModalOpen && (
        <ClosureFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSaved={handleRefresh}
          closureToEdit={closureToEdit}
          zones={zones}
        />
      )}
    </div>
  );
}
