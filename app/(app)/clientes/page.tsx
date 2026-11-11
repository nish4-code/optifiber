'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { CustomerItem } from '@/types/customers';
import { PaginatedResponse, ZoneOption } from '@/types/api';
import { NapItem } from '@/types/naps';
import { CustomerKpis } from '@/components/customers/CustomerKpis';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerDrawer } from '@/components/customers/CustomerDrawer';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';

export default function ClientesPage() {
  const [data, setData] = useState<PaginatedResponse<CustomerItem> | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [naps, setNaps] = useState<NapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filtros y paginación
  const [search, setSearch] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedNap, setSelectedNap] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);

  // Drawer y Modales
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerItem | null>(null);

  // Cargar Zonas y NAPs para filtros
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiClient<ZoneOption[]>('/zones'),
      apiClient<PaginatedResponse<NapItem>>('/naps?per_page=50'),
    ])
      .then(([zonesRes, napsRes]) => {
        if (!isMounted) return;
        if (Array.isArray(zonesRes)) setZones(zonesRes);
        if (napsRes?.items) setNaps(napsRes.items);
      })
      .catch((err) => {
        console.error('Error cargando catálogos:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar Clientes paginados
  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('per_page', perPage.toString());

    if (search.trim()) params.set('search', search.trim());
    if (selectedZone) params.set('zone_id', selectedZone);
    if (selectedNap) params.set('nap_box_id', selectedNap);
    if (selectedStatus) params.set('status', selectedStatus);

    apiClient<PaginatedResponse<CustomerItem>>(`/customers?${params.toString()}`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Error cargando abonados:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, perPage, search, selectedZone, selectedNap, selectedStatus, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedZone('');
    setSelectedNap('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const handleOpenCreateModal = () => {
    setCustomerToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (c: CustomerItem) => {
    setCustomerToEdit(c);
    setIsFormModalOpen(true);
  };

  // Cálculos de KPI para la cabecera
  const total = data?.total || 0;
  const activeCount = data?.items.filter((c) => c.status === 'activo').length || 0;
  const pendingCount = data?.items.filter((c) => c.status === 'pendiente').length || 0;
  const suspendedCount = data?.items.filter((c) => c.status === 'suspendido').length || 0;

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[20px] font-bold text-[#153b68] flex items-center gap-[8px]">
            Cartera de Clientes y Abonados FTTH
            <span className="text-[12px] font-normal text-[#64748b] bg-[#f1f5f9] px-[8px] py-[2px] rounded-full">
              {total} registrados
            </span>
          </h1>
          <p className="text-[13px] text-[#64748b]">
            Gestión técnica de abonados, diagnóstico óptico de ONTs de SmartOLT y asignación de puertos.
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
            <UserPlus size={16} />
            Nuevo Abonado
          </Button>
        </div>
      </div>

      {/* 4 KPIs de Abonados */}
      <CustomerKpis
        total={total}
        activeCount={activeCount}
        pendingCount={pendingCount}
        suspendedCount={suspendedCount}
      />

      {/* Filtros */}
      <CustomerFilters
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
        selectedNap={selectedNap}
        onNapChange={(val) => {
          setSelectedNap(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        zones={zones}
        naps={naps}
        onReset={handleResetFilters}
      />

      {/* Tabla Paginada */}
      <CustomerTable
        data={data}
        loading={loading}
        onPageChange={(p) => setCurrentPage(p)}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setCurrentPage(1);
        }}
        onViewCustomer={(c) => setSelectedCustomerId(c.id)}
        onEditCustomer={handleOpenEditModal}
      />

      {/* Ficha Lateral Técnica (Drawer de 4 Pestañas) */}
      {selectedCustomerId && (
        <CustomerDrawer
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onRefreshList={handleRefresh}
        />
      )}

      {/* Modal Crear / Editar */}
      {isFormModalOpen && (
        <CustomerFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSaved={handleRefresh}
          customerToEdit={customerToEdit}
          zones={zones}
        />
      )}
    </div>
  );
}
