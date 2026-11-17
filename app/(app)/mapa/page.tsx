'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TopMapControls } from '@/components/map/TopMapControls';
import { DrawingToolsCard } from '@/components/map/DrawingToolsCard';
import { RightPanelNewTrunk } from '@/components/map/RightPanelNewTrunk';
import { BottomTramosTable } from '@/components/map/BottomTramosTable';
import { NapFormModal } from '@/components/naps/NapFormModal';
import { ZoneFormModal } from '@/components/zones/ZoneFormModal';
import { apiClient } from '@/lib/api/client';
import {
  normalizeTrunkSegments,
  type MapTrunk,
  type MapNap,
  type MapClosure,
  type MapCustomer,
  type MapZone,
  type MapElementsResponse,
  type LayerVisibilityState,
  type MapTileMode,
  type GisToolMode,
} from '@/types/map';

const DynamicMapCanvas = dynamic(
  () => import('@/components/map/MapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#f8fafc] text-[#64748b]">
        <div className="flex flex-col items-center gap-[10px]">
          <div className="w-[32px] h-[32px] border-3 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] font-medium">Cargando visor cartográfico GIS...</span>
        </div>
      </div>
    ),
  }
);

export default function MapaPage() {
  const [tileMode, setTileMode] = useState<MapTileMode>('map');
  const [toolMode, setToolMode] = useState<GisToolMode>('select');
  const [lastDrawTool, setLastDrawTool] = useState<'draw_trunk' | 'measure'>('draw_trunk');
  const [drawingSegments, setDrawingSegments] = useState<Array<Array<[number, number]>>>([]);
  const [editingTrunk, setEditingTrunk] = useState<MapTrunk | null>(null);
  const totalPointCount = drawingSegments.reduce((acc, seg) => acc + seg.length, 0);

  // Visibilidad de capas
  const [layers, setLayers] = useState<LayerVisibilityState>({
    zonas: true,
    naps: true,
    mufas: true,
    clientes: true,
    troncales: true,
    reservas: true,
    alertas: true,
  });

  // Zonas / Ciudades / OLTs
  const [zones, setZones] = useState<MapZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

  // Datos cartográficos
  const [trunks, setTrunks] = useState<MapTrunk[]>([]);
  const [naps, setNaps] = useState<MapNap[]>([]);
  const [closures, setClosures] = useState<MapClosure[]>([]);
  const [customers, setCustomers] = useState<MapCustomer[]>([]);

  // Elementos seleccionados y panel lateral
  const [selectedTrunkId, setSelectedTrunkId] = useState<number | null>(null);
  const [focusedCoords, setFocusedCoords] = useState<[number, number] | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [drawnLength, setDrawnLength] = useState(0);
  const [newNapCoords, setNewNapCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newZoneData, setNewZoneData] = useState<{
    center: { lat: number; lng: number };
    polygon: Array<[number, number]>;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const calculatePathMeters = (pts: Array<[number, number]>): number => {
    if (pts.length < 2) return 0;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [lat1, lng1] = pts[i];
      const [lat2, lng2] = pts[i + 1];
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return Math.round(total * 10) / 10;
  };

  useEffect(() => {
    let spacePanPreviousTool: GisToolMode | null = null;

    const isTypingTarget = (target: HTMLElement | null) =>
      !!(
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target as HTMLElement | null)) return;

      if (e.code === 'Space' && !e.repeat && (toolMode === 'draw_trunk' || toolMode === 'draw_zone' || toolMode === 'measure')) {
        e.preventDefault();
        spacePanPreviousTool = toolMode;
        setToolMode('select');
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && (toolMode === 'draw_trunk' || toolMode === 'draw_zone' || toolMode === 'measure' || totalPointCount > 0)) {
          e.preventDefault();
          setDrawingSegments((prev) => {
            if (prev.length === 0) return prev;
            const lastIdx = prev.length - 1;
            return prev
              .map((seg, i) => (i === lastIdx ? seg.slice(0, -1) : seg))
              .filter((seg) => seg.length > 0);
          });
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'h') {
        e.preventDefault();
        setToolMode((prev) => {
          if (prev === 'select') return lastDrawTool;
          if (prev === 'draw_trunk' || prev === 'measure') setLastDrawTool(prev);
          return 'select';
        });
      } else if (key === 'p') {
        e.preventDefault();
        setLastDrawTool('draw_trunk');
        setToolMode('draw_trunk');
      } else if (key === 'm') {
        e.preventDefault();
        setLastDrawTool('measure');
        setToolMode('measure');
      } else if (key === 'n') {
        e.preventDefault();
        setToolMode('add_nap');
      } else if (key === 'z') {
        e.preventDefault();
        setToolMode('draw_zone');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spacePanPreviousTool) {
        e.preventDefault();
        const restore = spacePanPreviousTool;
        spacePanPreviousTool = null;
        setToolMode(restore);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toolMode, lastDrawTool, totalPointCount]);

  // Cargar datos reales desde la API de Laravel si está disponible
  useEffect(() => {
    async function loadElements() {
      try {
        const res = await apiClient<{
          data?: MapElementsResponse;
          trunks?: MapTrunk[];
          naps?: MapNap[];
          closures?: MapClosure[];
          customers?: MapCustomer[];
        }>('/map/elements');
        const payload = res.data || res;
        setTrunks(
          (payload.trunks || []).map((t) => ({
            ...t,
            length_km: Number(t.length_km || 0),
          }))
        );
        setNaps(payload.naps || []);
        setClosures(payload.closures || []);
        setCustomers(payload.customers || []);
      } catch {
        // Sin datos si la API no está disponible
      }

      // Cargar Zonas desde la API
      try {
        const zonesRes = await apiClient<MapZone[] | { data: MapZone[] }>('/zones');
        const list = Array.isArray(zonesRes) ? zonesRes : zonesRes.data;
        const parsed = (list || []).map((z) => ({
          ...z,
          center_lat: Number(z.center_lat),
          center_lng: Number(z.center_lng),
        }));
        setZones(parsed);

        if (parsed.length > 0) {
          const savedZoneId = localStorage.getItem('optifiber_active_zone');
          const match = savedZoneId ? parsed.find((z) => z.id === Number(savedZoneId)) : null;
          if (match) {
            setSelectedZoneId(match.id);
            setFocusedCoords([match.center_lat, match.center_lng]);
          }
        } else {
          setSelectedZoneId(null);
        }
      } catch {
        // Mantiene lista vacía si no hay respuesta
      }
    }

    loadElements();
  }, [refreshTrigger]);

  const handleSelectZone = (zone: MapZone) => {
    setSelectedZoneId(zone.id);
    setFocusedCoords([zone.center_lat, zone.center_lng]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('optifiber_active_zone', zone.id.toString());
    }
  };

  const handleFitAllBounds = () => {
    setFitBoundsTrigger((prev) => prev + 1);
  };

  const handleToggleLayer = (key: keyof LayerVisibilityState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectTrunk = (trunk: MapTrunk) => {
    setSelectedTrunkId(trunk.id);
    const segs = normalizeTrunkSegments(trunk.path);
    if (segs[0]?.[0]) {
      setFocusedCoords(segs[0][0]);
    }
  };

  const handleUndoPoint = () => {
    setDrawingSegments((prev) => {
      if (prev.length === 0) return prev;
      const lastIdx = prev.length - 1;
      return prev
        .map((seg, i) => (i === lastIdx ? seg.slice(0, -1) : seg))
        .filter((seg) => seg.length > 0);
    });
  };

  const handleReversePoints = () => {
    setDrawingSegments((prev) => {
      if (prev.length === 0) return prev;
      const lastIdx = prev.length - 1;
      return prev.map((seg, i) => (i === lastIdx ? [...seg].reverse() : seg));
    });
  };

  const handleClearPoints = () => {
    setDrawingSegments([]);
  };

  const calculateSegmentsMeters = (segments: Array<Array<[number, number]>>): number => {
    return Math.round(
      segments.reduce((acc, seg) => acc + calculatePathMeters(seg), 0) * 10
    ) / 10;
  };

  const handleSaveTramo = async () => {
    const validSegments = drawingSegments.filter((seg) => seg.length >= 2);
    if (validSegments.length === 0) return;

    const lengthMeters = calculateSegmentsMeters(validSegments);
    if (editingTrunk) {
      const packedPath = validSegments.length === 1 ? validSegments[0] : validSegments;
      const updatedLengthKm = Number((lengthMeters / 1000).toFixed(3));
      setTrunks((prev) =>
        prev.map((t) =>
          t.id === editingTrunk.id ? { ...t, path: packedPath, length_km: updatedLengthKm } : t
        )
      );
      apiClient(`/trunks/${editingTrunk.id}`, {
        method: 'PUT',
        body: JSON.stringify({ path: packedPath, length_km: updatedLengthKm }),
      }).catch(() => {});
      setEditingTrunk(null);
      setToolMode('select');
      setDrawingSegments([]);
      return;
    }

    setDrawnLength(lengthMeters);
    setIsPanelOpen(true);
  };

  const handleSaveZone = () => {
    const zonePoints = drawingSegments[0] || [];
    if (zonePoints.length < 3) return;
    const sumLat = zonePoints.reduce((acc, [lat]) => acc + lat, 0);
    const sumLng = zonePoints.reduce((acc, [, lng]) => acc + lng, 0);
    setNewZoneData({
      center: {
        lat: Number((sumLat / zonePoints.length).toFixed(6)),
        lng: Number((sumLng / zonePoints.length).toFixed(6)),
      },
      polygon: zonePoints,
    });
  };

  const handleCancelDrawing = () => {
    setToolMode('select');
    setDrawingSegments([]);
    setEditingTrunk(null);
  };

  const handleResumeTrunk = (trunk: MapTrunk) => {
    const segs = normalizeTrunkSegments(trunk.path);
    setEditingTrunk(trunk);
    setDrawingSegments(segs);
    setToolMode('draw_trunk');
    setSelectedTrunkId(trunk.id);
    const lastSeg = segs[segs.length - 1];
    if (lastSeg && lastSeg.length > 0) {
      setFocusedCoords(lastSeg[lastSeg.length - 1]);
    }
  };

  const handleDeleteTrunk = (trunk: MapTrunk) => {
    setTrunks((prev) => prev.filter((t) => t.id !== trunk.id));
    if (editingTrunk?.id === trunk.id) {
      handleCancelDrawing();
    }
    apiClient(`/trunks/${trunk.id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleTrunkDrawn = (segments: Array<Array<[number, number]>>, lengthMeters: number) => {
    setDrawingSegments(segments);
    setDrawnLength(lengthMeters);
    if (editingTrunk && segments.some((s) => s.length >= 2)) {
      const validSegs = segments.filter((s) => s.length >= 2);
      const packedPath = validSegs.length === 1 ? validSegs[0] : validSegs;
      const updatedLengthKm = Number((lengthMeters / 1000).toFixed(3));
      setTrunks((prev) =>
        prev.map((t) =>
          t.id === editingTrunk.id ? { ...t, path: packedPath, length_km: updatedLengthKm } : t
        )
      );
      apiClient(`/trunks/${editingTrunk.id}`, {
        method: 'PUT',
        body: JSON.stringify({ path: packedPath, length_km: updatedLengthKm }),
      }).catch(() => {});
      setEditingTrunk(null);
      setToolMode('select');
      setDrawingSegments([]);
      return;
    }
    setIsPanelOpen(true);
  };

  const handlePanelSave = async (data: {
    code: string;
    name: string;
    zone_id: number | null;
    cable_type: string;
    fiber_count: number;
    color: string;
    length_meters: number;
    status: string;
    description: string;
  }) => {
    const validSegments = drawingSegments.filter((seg) => seg.length >= 2);
    const segmentsToSave =
      validSegments.length > 0
        ? validSegments
        : [
            [
              [-13.6339, -72.8814] as [number, number],
              [-13.6349, -72.8824] as [number, number],
            ],
          ];
    const trunkName = data.name.trim() || data.code;
    const packedPath = segmentsToSave.length === 1 ? segmentsToSave[0] : segmentsToSave;
    const totalKm = Number((data.length_meters / 1000).toFixed(3));

    let createdId = Date.now();
    try {
      const saved = await apiClient<{ id: number }>('/trunks', {
        method: 'POST',
        body: JSON.stringify({
          zone_id: data.zone_id ?? selectedZoneId ?? null,
          code: data.code,
          name: trunkName,
          fiber_count: data.fiber_count,
          path: packedPath,
          length_km: totalKm,
          map_color: data.color || '#0066ff',
          status: data.status || 'activo',
          is_visible: true,
        }),
      });
      if (saved?.id) createdId = saved.id;
    } catch {
      // Mantiene persistencia local en visor si la API falla
    }

    const createdTrunk: MapTrunk = {
      id: createdId,
      code: data.code,
      name: trunkName,
      fiber_count: data.fiber_count,
      path: packedPath,
      length_km: totalKm,
      map_color: data.color || '#0066ff',
      status: data.status,
    };

    setTrunks((prev) => [createdTrunk, ...prev]);
    setIsPanelOpen(false);
    setToolMode('select');
    setDrawingSegments([]);
    setEditingTrunk(null);
    setSelectedTrunkId(createdTrunk.id);
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Contenedor Cartográfico Central */}
      <div className="relative flex-1 h-full flex flex-col overflow-hidden">
        {/* Controles superiores flotantes (Filtros de capa y Switch Mapa/Satélite) */}
        <div className="absolute top-[16px] left-[68px] z-10 pointer-events-auto">
          <TopMapControls
            tileMode={tileMode}
            onTileModeChange={setTileMode}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={handleSelectZone}
            onFitAllBounds={handleFitAllBounds}
            counts={{
              zonas: zones.length,
              naps: naps.length,
              mufas: closures.length,
              clientes: customers.length,
              troncales: trunks.length,
              reservas: closures.filter((c) => c.reserve_meters > 0).length,
              alertas: 0,
            }}
          />
        </div>

        {/* Herramientas de Dibujo flotantes en la esquina superior derecha */}
        <div className="absolute top-[16px] right-[16px] z-10 pointer-events-auto">
          <DrawingToolsCard
            toolMode={toolMode}
            onToolModeChange={(mode) => {
              if (mode === 'draw_trunk' || mode === 'measure') {
                setLastDrawTool(mode);
              }
              setToolMode(mode);
            }}
            onUndoPoint={handleUndoPoint}
            onReversePoints={handleReversePoints}
            onClearPoints={handleClearPoints}
            onSaveTramo={handleSaveTramo}
            onSaveZone={handleSaveZone}
            onCancel={handleCancelDrawing}
            pointCount={totalPointCount}
          />
        </div>

        {/* Banner flotante de edición de tramo existente */}
        {editingTrunk && (
          <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-10 pointer-events-auto bg-[#0f172a]/95 text-white px-[14px] py-[8px] rounded-[10px] shadow-xl border border-[#334155] flex items-center gap-[12px] text-[12px] backdrop-blur-md">
            <span className="font-bold text-[#38bdf8]">Editando {editingTrunk.code}</span>
            <span className="text-[#cbd5e1] hidden sm:inline">
              Clic en mapa para añadir nodos · Arrastra puntos/medios · Clic derecho borra nodo
            </span>
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                onClick={handleSaveTramo}
                disabled={totalPointCount < 2}
                className="px-[10px] py-[4px] rounded-[6px] bg-[#10b981] hover:bg-[#059669] text-white font-semibold disabled:opacity-40 cursor-pointer"
              >
                Guardar cambios
              </button>
              <button
                type="button"
                onClick={handleCancelDrawing}
                className="px-[8px] py-[4px] rounded-[6px] bg-[#334155] hover:bg-[#475569] text-[#f8fafc] cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lienzo del Mapa Leaflet */}
        <div className="flex-1 w-full h-full">
          <DynamicMapCanvas
            trunks={trunks}
            naps={naps}
            closures={closures}
            customers={customers}
            zones={zones}
            layers={layers}
            tileMode={tileMode}
            toolMode={toolMode}
            onToolModeChange={setToolMode}
            drawingSegments={drawingSegments}
            onDrawingSegmentsChange={setDrawingSegments}
            editingTrunkId={editingTrunk?.id ?? null}
            onTrunkDrawn={handleTrunkDrawn}
            onMapClickForNap={(lat, lng) =>
              setNewNapCoords({
                latitude: Number(lat.toFixed(6)),
                longitude: Number(lng.toFixed(6)),
              })
            }
            focusedCoordinates={focusedCoords}
            fitBoundsTrigger={fitBoundsTrigger}
            selectedElement={null}
            onSelectElement={(el) => {
              if (el?.type === 'trunk') {
                handleResumeTrunk(el.data as MapTrunk);
              }
            }}
          />
        </div>

        {/* Tabla inferior colapsable de tramos de fibra (Matching Figma 1:6291) */}
        <div className="absolute bottom-[16px] left-[16px] right-[16px] max-w-[850px] z-10 pointer-events-auto">
          <BottomTramosTable
            trunks={trunks}
            onSelectTrunk={handleSelectTrunk}
            onEditTrunk={handleResumeTrunk}
            onDeleteTrunk={handleDeleteTrunk}
            selectedTrunkId={selectedTrunkId}
          />
        </div>
      </div>

      {/* Panel lateral derecho: Formulario "Nuevo tramo de fibra" */}
      {isPanelOpen && (
        <RightPanelNewTrunk
          key={`${trunks.length}-${drawnLength}-${selectedZoneId ?? 'none'}`}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onSave={handlePanelSave}
          estimatedLength={drawnLength}
          existingTrunksCount={trunks.length}
          zones={zones}
          selectedZoneId={selectedZoneId}
        />
      )}

      {/* Drawer lateral para crear NAP directamente desde el mapa */}
      {newNapCoords && (
        <NapFormModal
          key={`${newNapCoords.latitude}-${newNapCoords.longitude}`}
          isOpen={!!newNapCoords}
          onClose={() => {
            setNewNapCoords(null);
            setToolMode('select');
          }}
          onSaved={() => {
            setNewNapCoords(null);
            setToolMode('select');
            setRefreshTrigger((prev) => prev + 1);
          }}
          zones={zones}
          initialCoordinates={newNapCoords}
        />
      )}

      {/* Drawer lateral para crear Zona delimitada desde el mapa */}
      {newZoneData && (
        <ZoneFormModal
          key={`${newZoneData.center.lat}-${newZoneData.center.lng}`}
          isOpen={!!newZoneData}
          onClose={() => {
            setNewZoneData(null);
            setToolMode('select');
          }}
          onSaved={() => {
            setNewZoneData(null);
            setToolMode('select');
            setDrawingSegments([]);
            setRefreshTrigger((prev) => prev + 1);
          }}
          initialCenter={newZoneData.center}
          initialPolygon={newZoneData.polygon}
        />
      )}
    </div>
  );
}
