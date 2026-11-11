'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { NapItem } from '@/types/naps';
import { PaginatedResponse, ZoneOption } from '@/types/api';
import { NapFilters } from '@/components/naps/NapFilters';
import { NapTable } from '@/components/naps/NapTable';
import { NapPortsModal } from '@/components/naps/NapPortsModal';
import { NapFormModal } from '@/components/naps/NapFormModal';

export default function NapsPage() {
  const [data, setData] = useState<PaginatedResponse<NapItem> | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filtros y paginación
  const [search, setSearch] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);

  // Modales
  const [portsModalNap, setPortsModalNap] = useState<NapItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [napToEdit, setNapToEdit] = useState<NapItem | null>(null);

  // Cargar Zonas para filtro y formularios
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

  // Cargar Cajas NAP paginadas
  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('per_page', perPage.toString());

    if (search.trim()) params.set('search', search.trim());
    if (selectedZone) params.set('zone_id', selectedZone);
    if (selectedStatus) params.set('status', selectedStatus);

    apiClient<PaginatedResponse<NapItem>>(`/naps?${params.toString()}`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Error cargando cajas NAP:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, perPage, search, selectedZone, selectedStatus, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedZone('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const handleOpenCreateModal = () => {
    setNapToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (nap: NapItem) => {
    setNapToEdit(nap);
    setIsFormModalOpen(true);
  };

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68] flex items-center gap-[8px]">
            Cajas de Distribución NAP
            <span className="text-[12px] font-normal text-[#64748b] bg-[#f1f5f9] px-[8px] py-[2px] rounded-full">
              {data?.total || 0} registradas
            </span>
          </h1>
          <p className="text-[13px] text-[#64748b]">
            Monitoreo, capacidad y asignación de splitters ópticos 1:8 y 1:16 en Chiclayo y Apurímac.
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
            Nueva Caja NAP
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <NapFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        selectedZone={selectedZone}
        onZoneChange={(val) => {
          setSelectedZone(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        zones={zones}
        onReset={handleResetFilters}
      />

      {/* Tabla Paginada */}
      <NapTable
        data={data}
        loading={loading}
        onPageChange={(p) => setCurrentPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setCurrentPage(1);
        }}
        onViewPorts={(nap) => setPortsModalNap(nap)}
        onEditNap={handleOpenEditModal}
      />

      {/* Modal de Puertos */}
      {portsModalNap && (
        <NapPortsModal
          napId={portsModalNap.id}
          napCode={portsModalNap.code}
          onClose={() => setPortsModalNap(null)}
        />
      )}

      {/* Modal de Crear / Editar */}
      {isFormModalOpen && (
        <NapFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSaved={handleRefresh}
          napToEdit={napToEdit}
          zones={zones}
        />
      )}
    </div>
  );
}
