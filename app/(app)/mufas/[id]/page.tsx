'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import { ClosureDetailDto } from '@/types/closures';
import { SpliceKpis } from '@/components/closures/SpliceKpis';
import { FiberCrossSection } from '@/components/closures/FiberCrossSection';
import { SpliceTraySchematic } from '@/components/closures/SpliceTraySchematic';
import { SpliceMatrix } from '@/components/closures/SpliceMatrix';
import { FiberColorLegend } from '@/components/closures/FiberColorLegend';
import { SpliceFormModal } from '@/components/closures/SpliceFormModal';

interface MufaDetailPageProps {
  params: Promise<{ id: string }>;
}

function MufaDetailContent({ params }: MufaDetailPageProps) {
  const resolvedParams = use(params);
  const closureId = Number(resolvedParams.id);

  const [data, setData] = useState<ClosureDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modal para agregar fusión
  const [isSpliceModalOpen, setIsSpliceModalOpen] = useState<boolean>(false);
  const [selectedTray, setSelectedTray] = useState<number>(1);
  const [selectedStrandInId, setSelectedStrandInId] = useState<number | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    apiClient<ClosureDetailDto>(`/closures/${closureId}/splices`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error('Error cargando matriz de fusión de mufa:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [closureId, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenAddSplice = (tray = 1, strandInId?: number) => {
    setSelectedTray(tray);
    setSelectedStrandInId(strandInId);
    setIsSpliceModalOpen(true);
  };

  const handleDeleteSplice = async (spliceId: number) => {
    if (!confirm('¿Estás seguro de eliminar este empalme de fibra óptica?')) return;

    try {
      await apiClient(`/closures/${closureId}/splices/${spliceId}`, {
        method: 'DELETE',
      });
      handleRefresh();
    } catch (err) {
      console.error('Error al eliminar fusión:', err);
      alert('Error al eliminar el empalme.');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-[24px] max-w-[1400px] mx-auto w-full min-h-[400px] flex flex-col items-center justify-center gap-[12px] text-[#64748b]">
        <div className="w-[36px] h-[36px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px]">Cargando matriz de fusión óptica de 144 hilos...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-[24px] max-w-[1400px] mx-auto w-full flex flex-col items-center justify-center gap-[16px] text-center">
        <p className="text-[#64748b] text-[14px]">No se encontró la mufa seleccionada.</p>
        <Link href="/mufas">
          <Button variant="outline" size="sm" className="gap-[6px]">
            <ArrowLeft size={14} />
            Volver al listado de mufas
          </Button>
        </Link>
      </div>
    );
  }

  const { closure, telemetry, splices } = data;

  return (
    <div className="p-[24px] flex flex-col gap-[20px] max-w-[1400px] mx-auto w-full animate-in fade-in duration-150">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px]">
        <div>
          <div className="flex items-center gap-[8px] text-[12px] text-[#64748b] mb-[4px]">
            <Link href="/mufas" className="hover:text-[#0066ff] flex items-center gap-[4px]">
              <ArrowLeft size={13} />
              Mufas y Puntos de Empalme
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#0f172a]">{closure.code}</span>
          </div>

          <h1 className="text-[20px] font-bold text-[#153b68] flex items-center gap-[10px]">
            {closure.name} ({closure.code})
            <Badge variant={closure.status === 'activo' ? 'success' : 'warning'}>
              {closure.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-[13px] text-[#64748b]">
            Montaje en {closure.mount_type} · Reserva de {closure.reserve_meters || 0} m · {telemetry.total_fibers} Fibras
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

          <Button size="sm" onClick={() => handleOpenAddSplice(1)} className="gap-[6px]">
            <Plus size={16} />
            Nueva Fusión
          </Button>
        </div>
      </div>

      {/* 4 KPIs de Telemetría */}
      <SpliceKpis telemetry={telemetry} />

      {/* Corte Transversal Dual (12 buffers concéntricos y 12 hilos TIA-598) */}
      <FiberCrossSection
        totalCapacity={telemetry.total_fibers}
        onSelectStrand={(globalNum) => handleOpenAddSplice(1, globalNum)}
      />

      {/* Esquemático Interactivo de Bandejas */}
      <SpliceTraySchematic
        splices={splices}
        onAddSplice={(tray) => handleOpenAddSplice(tray)}
        onDeleteSplice={handleDeleteSplice}
      />

      {/* Matriz Completa de Fusión */}
      <SpliceMatrix
        splices={splices}
        onAddSplice={(globalNum) => handleOpenAddSplice(1, globalNum)}
        onDeleteSplice={handleDeleteSplice}
      />

      {/* Leyenda TIA-598 */}
      <FiberColorLegend />

      {/* Modal Nueva Fusión */}
      {isSpliceModalOpen && (
        <SpliceFormModal
          isOpen={isSpliceModalOpen}
          closureId={closureId}
          initialTray={selectedTray}
          initialStrandInId={selectedStrandInId}
          onClose={() => setIsSpliceModalOpen(false)}
          onSaved={handleRefresh}
        />
      )}
    </div>
  );
}

export default function MufaDetailPage({ params }: MufaDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-[24px] max-w-[1400px] mx-auto w-full min-h-[400px] flex items-center justify-center text-[#64748b]">
          <div className="w-[32px] h-[32px] border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MufaDetailContent params={params} />
    </Suspense>
  );
}
