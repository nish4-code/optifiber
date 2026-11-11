'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TopMapControls } from '@/components/map/TopMapControls';
import { DrawingToolsCard } from '@/components/map/DrawingToolsCard';
import { RightPanelNewTrunk } from '@/components/map/RightPanelNewTrunk';
import { BottomTramosTable } from '@/components/map/BottomTramosTable';
import { apiClient } from '@/lib/api/client';
import type {
  MapTrunk,
  MapNap,
  MapClosure,
  MapCustomer,
  MapZone,
  MapElementsResponse,
  LayerVisibilityState,
  MapTileMode,
  GisToolMode,
} from '@/types/map';

const INITIAL_ZONES: MapZone[] = [
  {
    id: 1,
    code: 'ZON-BOLOG',
    name: 'Chiclayo Centro (Jr. Bolognesi)',
    description: 'Sector urbano Centro - Chiclayo (NAP-01 a NAP-04)',
    center_lat: -6.7725,
    center_lng: -79.8402,
    zoom_level: 16,
    city: 'Chiclayo',
  },
  {
    id: 2,
    code: 'ZON-BALTA',
    name: 'Chiclayo (Av. Balta / Boulevard)',
    description: 'Sector comercial Av. Balta (NAP-05 a NAP-08)',
    center_lat: -6.776,
    center_lng: -79.844,
    zoom_level: 16,
    city: 'Chiclayo',
  },
  {
    id: 3,
    code: 'ZON-SANJOSE',
    name: 'Chiclayo (San José - Sáenz Peña)',
    description: 'Sector residencial San José (NAP-09 a NAP-12)',
    center_lat: -6.769,
    center_lng: -79.837,
    zoom_level: 16,
    city: 'Chiclayo',
  },
  {
    id: 4,
    code: 'ZON-KISH',
    name: 'Red de Kishuara (OLT Apurímac)',
    description: 'Zona troncal principal y nodo central de distribución FTTH',
    center_lat: -13.6441,
    center_lng: -73.0871,
    zoom_level: 15,
    city: 'Apurímac',
  },
];

// Carga dinámica de Leaflet sin SSR
const DynamicMapCanvas = dynamic(
  () => import('@/components/map/MapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#f8fafc] text-[#64748b]">
        <div className="flex flex-col items-center gap-[10px]">
          <div className="w-[32px] h-[32px] border-3 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] font-medium">Cargando visor cartográfico GIS...</span>
        </div>
      </div>
    ),
  }
);

// Datos semilla de Chiclayo para fallback o modo offline
const INITIAL_TRUNKS: MapTrunk[] = [
  {
    id: 1,
    code: 'TR-012',
    name: 'Troncal Jr. Bolognesi - San José',
    fiber_count: 144,
    path: [
      [-6.7714, -79.8409],
      [-6.7725, -79.8425],
      [-6.7738, -79.8442],
      [-6.7752, -79.846],
    ],
    length_km: 0.85,
    map_color: '#0066ff',
    status: 'activo',
  },
  {
    id: 2,
    code: 'TR-013',
    name: 'Troncal Av. José Balta - Santa Victoria',
    fiber_count: 96,
    path: [
      [-6.7714, -79.8409],
      [-6.7702, -79.8392],
      [-6.7688, -79.8375],
      [-6.7672, -79.8358],
    ],
    length_km: 1.12,
    map_color: '#ff7700',
    status: 'activo',
  },
  {
    id: 3,
    code: 'TR-014',
    name: 'Distribución Norte Federico Villarreal',
    fiber_count: 48,
    path: [
      [-6.7688, -79.8375],
      [-6.7682, -79.8352],
      [-6.7675, -79.8331],
    ],
    length_km: 0.58,
    map_color: '#00cc44',
    status: 'activo',
  },
];

const INITIAL_NAPS: MapNap[] = [
  {
    id: 1,
    code: 'NAP-01',
    name: 'Bolognesi esq. San José',
    splitter_ratio: '1:8',
    port_capacity: 8,
    occupied_ports: 7,
    free_ports: 1,
    occupancy_percentage: 88,
    address: 'Jr. Bolognesi 345, Chiclayo',
    latitude: -6.7725,
    longitude: -79.8425,
    feeder_strand: { global_number: 1, buffer_color: 'Azul', strand_color: 'Azul' },
    map_color: '#059669',
    map_icon: 'nap_box',
    status: 'activo',
  },
  {
    id: 2,
    code: 'NAP-02',
    name: 'Bolognesi / Av. Saenz Peña',
    splitter_ratio: '1:16',
    port_capacity: 16,
    occupied_ports: 12,
    free_ports: 4,
    occupancy_percentage: 75,
    address: 'Jr. Bolognesi 580, Chiclayo',
    latitude: -6.7738,
    longitude: -79.8442,
    feeder_strand: { global_number: 2, buffer_color: 'Azul', strand_color: 'Naranja' },
    map_color: '#059669',
    map_icon: 'nap_box',
    status: 'activo',
  },
  {
    id: 3,
    code: 'NAP-03',
    name: 'Av. Balta Frente CC Boulevard',
    splitter_ratio: '1:8',
    port_capacity: 8,
    occupied_ports: 8,
    free_ports: 0,
    occupancy_percentage: 100,
    address: 'Av. Balta 720, Chiclayo',
    latitude: -6.7702,
    longitude: -79.8392,
    feeder_strand: { global_number: 13, buffer_color: 'Naranja', strand_color: 'Azul' },
    map_color: '#ef4444',
    map_icon: 'nap_box',
    status: 'activo',
  },
  {
    id: 4,
    code: 'NAP-04',
    name: 'Santa Victoria - Los Parques',
    splitter_ratio: '1:8',
    port_capacity: 8,
    occupied_ports: 3,
    free_ports: 5,
    occupancy_percentage: 38,
    address: 'Calle Los Tumbos 210, Santa Victoria',
    latitude: -6.7672,
    longitude: -79.8358,
    feeder_strand: { global_number: 14, buffer_color: 'Naranja', strand_color: 'Naranja' },
    map_color: '#059669',
    map_icon: 'nap_box',
    status: 'activo',
  },
];

const INITIAL_CLOSURES: MapClosure[] = [
  {
    id: 1,
    code: 'MUFA-01',
    name: 'Mufa Primaria Parque Principal',
    type: 'Domo',
    mount_type: 'Poste Concreto',
    fiber_capacity: 144,
    latitude: -6.7714,
    longitude: -79.8409,
    reserve_meters: 30,
    status: 'activo',
  },
  {
    id: 2,
    code: 'MUFA-02',
    name: 'Mufa Empalme Bolognesi Oeste',
    type: 'Horizontal',
    mount_type: 'Cámara Subterránea',
    fiber_capacity: 96,
    latitude: -6.7752,
    longitude: -79.846,
    reserve_meters: 20,
    status: 'activo',
  },
  {
    id: 3,
    code: 'MUFA-03',
    name: 'Mufa Derivación Santa Victoria',
    type: 'Domo',
    mount_type: 'Poste Concreto',
    fiber_capacity: 48,
    latitude: -6.7688,
    longitude: -79.8375,
    reserve_meters: 15,
    status: 'activo',
  },
];

const INITIAL_CUSTOMERS: MapCustomer[] = [
  {
    id: 1,
    code: 'CLI-001',
    name: 'Restaurante El Cántaro SAC',
    phone: '974829102',
    latitude: -6.7728,
    longitude: -79.8427,
    plan: 'Fibra Pro 300 Mbps',
    nap_code: 'NAP-01',
    port_number: 1,
    status: 'activo',
  },
  {
    id: 2,
    code: 'CLI-002',
    name: 'Carlos Mendoza Ramos',
    phone: '979112233',
    latitude: -6.7723,
    longitude: -79.8422,
    plan: 'Fibra Hogar 200 Mbps',
    nap_code: 'NAP-01',
    port_number: 2,
    status: 'activo',
  },
  {
    id: 3,
    code: 'CLI-003',
    name: 'Clínica Dental San José',
    phone: '974003344',
    latitude: -6.7735,
    longitude: -79.8445,
    plan: 'Fibra Empresa 500 Mbps',
    nap_code: 'NAP-02',
    port_number: 3,
    status: 'activo',
  },
  {
    id: 4,
    code: 'CLI-004',
    name: 'Hotel Costa del Sol Chiclayo',
    phone: '974556677',
    latitude: -6.7705,
    longitude: -79.8395,
    plan: 'Fibra Dedicada 1 Gbps',
    nap_code: 'NAP-03',
    port_number: 4,
    status: 'activo',
  },
  {
    id: 5,
    code: 'CLI-005',
    name: 'María Elena Silva',
    phone: '974998811',
    latitude: -6.7674,
    longitude: -79.836,
    plan: 'Fibra Hogar 150 Mbps',
    nap_code: 'NAP-04',
    port_number: 1,
    status: 'activo',
  },
];

export default function MapaPage() {
  const [tileMode, setTileMode] = useState<MapTileMode>('map');
  const [toolMode, setToolMode] = useState<GisToolMode>('select');
  const [pointCount, setPointCount] = useState(0);

  // Visibilidad de capas
  const [layers, setLayers] = useState<LayerVisibilityState>({
    naps: true,
    mufas: true,
    clientes: true,
    troncales: true,
    reservas: true,
    alertas: true,
  });

  // Zonas / Ciudades / OLTs
  const [zones, setZones] = useState<MapZone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

  // Datos cartográficos
  const [trunks, setTrunks] = useState<MapTrunk[]>(INITIAL_TRUNKS);
  const [naps, setNaps] = useState<MapNap[]>(INITIAL_NAPS);
  const [closures, setClosures] = useState<MapClosure[]>(INITIAL_CLOSURES);
  const [customers, setCustomers] = useState<MapCustomer[]>(INITIAL_CUSTOMERS);

  // Elementos seleccionados y panel lateral
  const [selectedTrunkId, setSelectedTrunkId] = useState<number | null>(null);
  const [focusedCoords, setFocusedCoords] = useState<[number, number] | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [drawnLength, setDrawnLength] = useState(254.8);
  const [drawnCoordinates, setDrawnCoordinates] = useState<Array<[number, number]>>([]);

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
        if (payload.trunks?.length) {
          setTrunks(
            payload.trunks.map((t) => ({
              ...t,
              length_km: Number(t.length_km || 0),
            }))
          );
        }
        if (payload.naps?.length) setNaps(payload.naps);
        if (payload.closures?.length) setClosures(payload.closures);
        if (payload.customers?.length) setCustomers(payload.customers);
      } catch {
        // En caso de que la API esté offline en el entorno de desarrollo, se mantienen los datos iniciales
      }

      // Cargar Zonas desde la API
      try {
        const zonesRes = await apiClient<MapZone[] | { data: MapZone[] }>('/zones');
        const list = Array.isArray(zonesRes) ? zonesRes : zonesRes.data;
        if (list?.length) {
          const parsed = list.map((z) => ({
            ...z,
            center_lat: Number(z.center_lat),
            center_lng: Number(z.center_lng),
          }));
          setZones(parsed);

          // Recuperar zona guardada en localStorage
          const savedZoneId = localStorage.getItem('optifiber_active_zone');
          if (savedZoneId) {
            const match = parsed.find((z) => z.id === Number(savedZoneId));
            if (match) {
              setSelectedZoneId(match.id);
              setFocusedCoords([match.center_lat, match.center_lng]);
            }
          }
        }
      } catch {
        // Modo offline: mantiene INITIAL_ZONES
      }
    }
    loadElements();
  }, []);

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
    if (trunk.path && trunk.path.length > 0) {
      setFocusedCoords(trunk.path[0]);
    }
  };

  const handleSaveTramo = () => {
    setIsPanelOpen(true);
  };

  const handleCancelDrawing = () => {
    setToolMode('select');
    setPointCount(0);
    setDrawnCoordinates([]);
  };

  const handleTrunkDrawn = (coords: Array<[number, number]>, lengthMeters: number) => {
    setDrawnCoordinates(coords);
    setDrawnLength(lengthMeters);
    setIsPanelOpen(true);
  };

  const handlePanelSave = (data: {
    code: string;
    origin: string;
    destination: string;
    cable_type: string;
    fiber_count: number;
    color: string;
    length_meters: number;
    status: string;
    description: string;
  }) => {
    const newTrunk: MapTrunk = {
      id: Date.now(),
      code: data.code,
      name: `${data.origin} ➔ ${data.destination}`,
      fiber_count: data.fiber_count,
      path:
        drawnCoordinates.length >= 2
          ? drawnCoordinates
          : [
              [-6.7714, -79.8409],
              [-6.7725, -79.8425],
            ],
      length_km: Number((data.length_meters / 1000).toFixed(3)),
      map_color: '#0066ff',
      status: data.status,
    };

    setTrunks((prev) => [newTrunk, ...prev]);
    setIsPanelOpen(false);
    setToolMode('select');
    setPointCount(0);
    setDrawnCoordinates([]);
    setSelectedTrunkId(newTrunk.id);
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
              naps: naps.length,
              mufas: closures.length,
              clientes: customers.length,
              troncales: trunks.length,
              reservas: closures.filter((c) => c.reserve_meters > 0).length,
              alertas: 2,
            }}
          />
        </div>

        {/* Herramientas de Dibujo flotantes en la esquina superior derecha */}
        <div className="absolute top-[16px] right-[16px] z-10 pointer-events-auto">
          <DrawingToolsCard
            toolMode={toolMode}
            onToolModeChange={setToolMode}
            onSaveTramo={handleSaveTramo}
            onCancel={handleCancelDrawing}
            pointCount={pointCount}
          />
        </div>

        {/* Lienzo del Mapa Leaflet */}
        <div className="flex-1 w-full h-full">
          <DynamicMapCanvas
            trunks={trunks}
            naps={naps}
            closures={closures}
            customers={customers}
            layers={layers}
            tileMode={tileMode}
            toolMode={toolMode}
            onToolModeChange={setToolMode}
            onTrunkDrawn={handleTrunkDrawn}
            onPointCountChange={setPointCount}
            focusedCoordinates={focusedCoords}
            fitBoundsTrigger={fitBoundsTrigger}
            selectedElement={null}
          />
        </div>

        {/* Tabla inferior colapsable de tramos de fibra (Matching Figma 1:6291) */}
        <div className="absolute bottom-[16px] left-[16px] right-[16px] max-w-[850px] z-10 pointer-events-auto">
          <BottomTramosTable
            trunks={trunks}
            onSelectTrunk={handleSelectTrunk}
            selectedTrunkId={selectedTrunkId}
          />
        </div>
      </div>

      {/* Panel lateral derecho: Formulario "Nuevo tramo de fibra" */}
      <RightPanelNewTrunk
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSave={handlePanelSave}
        estimatedLength={drawnLength}
      />
    </div>
  );
}
