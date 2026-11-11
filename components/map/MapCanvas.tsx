'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type {
  MapTrunk,
  MapNap,
  MapClosure,
  MapCustomer,
  LayerVisibilityState,
  MapTileMode,
  GisToolMode,
} from '@/types/map';

interface MapCanvasProps {
  trunks: MapTrunk[];
  naps: MapNap[];
  closures: MapClosure[];
  customers: MapCustomer[];
  layers: LayerVisibilityState;
  tileMode: MapTileMode;
  toolMode: GisToolMode;
  onToolModeChange?: (mode: GisToolMode) => void;
  onTrunkDrawn?: (coords: Array<[number, number]>, lengthMeters: number) => void;
  onPointCountChange?: (count: number) => void;
  focusedCoordinates?: [number, number] | null;
  fitBoundsTrigger?: number;
  selectedElement?: { type: 'trunk' | 'nap' | 'closure' | 'customer'; data: unknown } | null;
  onSelectElement?: (element: { type: 'trunk' | 'nap' | 'closure' | 'customer'; data: unknown } | null) => void;
}

const CARTOMAPS_API_KEY = process.env.NEXT_PUBLIC_CARTOMAPS_API_KEY || '';

function getTileConfig(mode: MapTileMode): { url: string; options: L.TileLayerOptions } {
  if (mode === 'satellite') {
    return {
      url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      options: {
        subdomains: '0123',
        maxNativeZoom: 20,
        maxZoom: 20,
        attribution: 'OptiFiber GIS &copy; Google Satellite',
      },
    };
  }

  const base = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  return {
    url: CARTOMAPS_API_KEY ? `${base}?key=${CARTOMAPS_API_KEY}` : base,
    options: {
      subdomains: 'abcd',
      maxNativeZoom: 18,
      maxZoom: 20,
      attribution: 'OptiFiber GIS &copy; CARTO',
    },
  };
}

export default function MapCanvas({
  trunks,
  naps,
  closures,
  customers,
  layers,
  tileMode,
  toolMode,
  onTrunkDrawn,
  onPointCountChange,
  focusedCoordinates,
  fitBoundsTrigger,
  onSelectElement,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Capas Leaflet administradas
  const trunksLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const napsLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const closuresLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const customersLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const dropsLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawingLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  // Estado del dibujo o medición interactiva
  const [drawingPoints, setDrawingPoints] = useState<L.LatLng[]>([]);
  const drawingPointsRef = useRef<L.LatLng[]>([]);

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
    onPointCountChange?.(drawingPoints.length);
  }, [drawingPoints, onPointCountChange]);

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centro inicial: Chiclayo Centro (Parque Principal / Jr. Bolognesi)
    const map = L.map(mapContainerRef.current, {
      center: [-6.7714, -79.8409],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Control de zoom en esquina superior izquierda discreta
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Control de escala en esquina inferior derecha
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

    // Agregar grupos de capas al mapa
    trunksLayerRef.current.addTo(map);
    dropsLayerRef.current.addTo(map);
    closuresLayerRef.current.addTo(map);
    napsLayerRef.current.addTo(map);
    customersLayerRef.current.addTo(map);
    drawingLayerRef.current.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // 2. Cambio dinámico de Mapa / Satélite con límites nativos por proveedor
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const { url, options } = getTileConfig(tileMode);
    const nextLayer = L.tileLayer(url, options).addTo(map);
    nextLayer.bringToBack();
    tileLayerRef.current = nextLayer;
  }, [tileMode]);

  // 3. Centrar en coordenadas seleccionadas
  useEffect(() => {
    if (focusedCoordinates && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(focusedCoordinates, 16, { duration: 1.4 });
    }
  }, [focusedCoordinates]);

  // 3.1. Auto-encuadre inteligente (fitBounds)
  useEffect(() => {
    if (!fitBoundsTrigger || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const bounds = new L.LatLngBounds([]);

    trunks.forEach((t) => {
      t.path?.forEach((p) => bounds.extend(p));
    });
    naps.forEach((n) => bounds.extend([n.latitude, n.longitude]));
    closures.forEach((c) => bounds.extend([c.latitude, c.longitude]));
    customers.forEach((c) => bounds.extend([c.latitude, c.longitude]));

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [fitBoundsTrigger, trunks, naps, closures, customers]);

  // 4. Renderizado de Troncales
  useEffect(() => {
    const layer = trunksLayerRef.current;
    layer.clearLayers();

    if (!layers.troncales) return;

    const isSat = tileMode === 'satellite';

    trunks.forEach((trunk) => {
      if (!trunk.path || trunk.path.length < 2) return;

      const km = Number(trunk.length_km || 0);
      const trunkColor = trunk.map_color || '#2563eb';

      // En modo satélite, dibujamos una polilínea base (casing / halo) de alto contraste
      if (isSat) {
        L.polyline(trunk.path, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layer);
      }

      const polyline = L.polyline(trunk.path, {
        color: trunkColor,
        weight: isSat ? 4.5 : 4,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Tooltip con información del tramo
      polyline.bindTooltip(
        `<div class="font-sans text-[11px] p-[2px]">
          <strong>${trunk.code}</strong> • ${(km * 1000).toFixed(0)}m<br/>
          <span class="text-[#64748b]">${trunk.name} (${trunk.fiber_count} hilos)</span>
        </div>`,
        { sticky: true, direction: 'top', className: 'optifiber-map-tooltip' }
      );

      polyline.on('click', () => {
        onSelectElement?.({ type: 'trunk', data: trunk });
      });

      polyline.addTo(layer);
    });
  }, [trunks, layers.troncales, tileMode, onSelectElement]);

  // 5. Renderizado de NAPs
  useEffect(() => {
    const layer = napsLayerRef.current;
    layer.clearLayers();

    if (!layers.naps) return;

    const isSat = tileMode === 'satellite';

    naps.forEach((nap) => {
      const isFull = nap.free_ports === 0;
      const isHigh = nap.occupancy_percentage >= 80;
      const badgeBg = isFull ? '#ef4444' : isHigh ? '#d97706' : '#059669';

      const customIcon = L.divIcon({
        className: 'custom-nap-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            background: #ffffff;
            border: 2px solid ${badgeBg};
            border-radius: 6px;
            box-shadow: ${
              isSat
                ? '0 0 0 2px #ffffff, 0 4px 10px rgba(0,0,0,0.6)'
                : '0 4px 6px -1px rgba(0,0,0,0.15)'
            };
            padding: 2px 6px;
            font-family: system-ui, sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #153b68;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${badgeBg};
              margin-right: 5px;
              display: inline-block;
            "></span>
            <span>${nap.code}</span>
            <span style="
              margin-left: 6px;
              background: #f1f5f9;
              color: #475569;
              font-size: 10px;
              padding: 1px 4px;
              border-radius: 3px;
              font-weight: 600;
            ">${nap.occupied_ports}/${nap.port_capacity}</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([nap.latitude, nap.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: #153b68; margin-bottom: 4px;">
            ${nap.code} — ${nap.name}
          </div>
          <div style="margin-bottom: 2px;"><strong>Dirección:</strong> ${nap.address || 'Chiclayo'}</div>
          <div style="margin-bottom: 2px;"><strong>Splitter:</strong> ${nap.splitter_ratio || '1:8'}</div>
          <div style="margin-bottom: 2px;">
            <strong>Ocupación:</strong> ${nap.occupied_ports} de ${nap.port_capacity} puertos (${nap.occupancy_percentage}%)
          </div>
          ${
            nap.feeder_strand
              ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Alimentador: Hilo ${nap.feeder_strand.global_number} (${nap.feeder_strand.buffer_color}/${nap.feeder_strand.strand_color})</div>`
              : ''
          }
        </div>
      `);

      marker.on('click', () => {
        onSelectElement?.({ type: 'nap', data: nap });
      });

      marker.addTo(layer);
    });
  }, [naps, layers.naps, tileMode, onSelectElement]);

  // 6. Renderizado de Mufas (Splice Closures) y Reservas
  useEffect(() => {
    const layer = closuresLayerRef.current;
    layer.clearLayers();

    if (!layers.mufas) return;

    const isSat = tileMode === 'satellite';

    closures.forEach((closure) => {
      const customIcon = L.divIcon({
        className: 'custom-mufa-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            background: #153b68;
            color: #ffffff;
            border: 2px solid ${isSat ? '#67e8f9' : '#38bdf8'};
            border-radius: 20px;
            box-shadow: ${
              isSat
                ? '0 0 0 2px #ffffff, 0 4px 10px rgba(0,0,0,0.6)'
                : '0 4px 6px -1px rgba(0,0,0,0.2)'
            };
            padding: 2px 8px;
            font-family: system-ui, sans-serif;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span>● ${closure.code}</span>
            ${
              layers.reservas && closure.reserve_meters > 0
                ? `<span style="margin-left: 5px; font-size: 9px; background: #8b5cf6; padding: 1px 4px; border-radius: 10px;">${closure.reserve_meters}m</span>`
                : ''
            }
          </div>
        `,
        iconSize: [70, 22],
        iconAnchor: [35, 11],
      });

      const marker = L.marker([closure.latitude, closure.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; min-width: 170px;">
          <div style="font-weight: 700; font-size: 13px; color: #153b68; margin-bottom: 4px;">
            ${closure.code} — Mufa de Empalme
          </div>
          <div><strong>Tipo:</strong> ${closure.type} (${closure.mount_type})</div>
          <div><strong>Capacidad:</strong> ${closure.fiber_capacity} hilos</div>
          <div><strong>Reserva técnica:</strong> ${closure.reserve_meters} metros</div>
        </div>
      `);

      marker.on('click', () => {
        onSelectElement?.({ type: 'closure', data: closure });
      });

      marker.addTo(layer);

      // Si tiene reserva y la capa de reservas está activa, trazar un halo concéntrico morado
      if (layers.reservas && closure.reserve_meters > 0) {
        L.circle([closure.latitude, closure.longitude], {
          radius: 12,
          color: isSat ? '#c084fc' : '#8b5cf6',
          weight: isSat ? 2.5 : 1.5,
          dashArray: '4, 4',
          fillColor: '#8b5cf6',
          fillOpacity: isSat ? 0.25 : 0.1,
        }).addTo(layer);
      }
    });
  }, [closures, layers.mufas, layers.reservas, tileMode, onSelectElement]);

  // 7. Renderizado de Clientes y cables drop de acometida
  useEffect(() => {
    const custLayer = customersLayerRef.current;
    const dropLayer = dropsLayerRef.current;
    custLayer.clearLayers();
    dropLayer.clearLayers();

    if (!layers.clientes) return;

    const isSat = tileMode === 'satellite';

    customers.forEach((customer) => {
      const customIcon = L.divIcon({
        className: 'custom-customer-marker',
        html: `
          <div style="
            width: ${isSat ? '15px' : '14px'};
            height: ${isSat ? '15px' : '14px'};
            background: #2563eb;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: ${
              isSat
                ? '0 0 0 1.5px #000000, 0 3px 6px rgba(0,0,0,0.7)'
                : '0 2px 4px rgba(0,0,0,0.25)'
            };
            transform: translate(-50%, -50%);
            cursor: pointer;
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([customer.latitude, customer.longitude], { icon: customIcon });

      marker.bindTooltip(
        `<strong>${customer.name}</strong><br/>${customer.plan} • NAP: ${customer.nap_code || 'N/A'}`,
        { direction: 'top', className: 'optifiber-map-tooltip' }
      );

      marker.on('click', () => {
        onSelectElement?.({ type: 'customer', data: customer });
      });

      marker.addTo(custLayer);

      // Si el cliente está asociado a una NAP existente, trazar la línea drop
      if (customer.nap_code) {
        const nap = naps.find((n) => n.code === customer.nap_code);
        if (nap) {
          const latLngs: [number, number][] = [
            [customer.latitude, customer.longitude],
            [nap.latitude, nap.longitude],
          ];

          // En satélite, halo oscuro de fondo para la línea drop punteada
          if (isSat) {
            L.polyline(latLngs, {
              color: '#000000',
              weight: 3.5,
              opacity: 0.7,
              dashArray: '4, 4',
            }).addTo(dropLayer);
          }

          L.polyline(latLngs, {
            color: isSat ? '#38bdf8' : '#94a3b8',
            weight: isSat ? 2 : 1.5,
            dashArray: isSat ? '4, 4' : '3, 4',
            opacity: isSat ? 1 : 0.7,
          }).addTo(dropLayer);
        }
      }
    });
  }, [customers, naps, layers.clientes, tileMode, onSelectElement]);

  // 8. Manejo de Herramientas de Dibujo y Medición (Click en el mapa)
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (toolMode === 'select') return;

      const newPoint = e.latlng;
      const updatedPoints = [...drawingPointsRef.current, newPoint];
      setDrawingPoints(updatedPoints);

      const drawingLayer = drawingLayerRef.current;
      drawingLayer.clearLayers();

      // Marcadores temporales en cada vértice
      updatedPoints.forEach((pt) => {
        const vertexIcon = L.divIcon({
          className: 'vertex-marker',
          html: `<div style="
            width: 10px;
            height: 10px;
            background: ${toolMode === 'measure' ? '#10b981' : '#0066ff'};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
          "></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker(pt, { icon: vertexIcon }).addTo(drawingLayer);
      });

      // Polilínea conectando los puntos
      if (updatedPoints.length > 1) {
        let totalDistanceMeters = 0;
        for (let i = 0; i < updatedPoints.length - 1; i++) {
          totalDistanceMeters += updatedPoints[i].distanceTo(updatedPoints[i + 1]);
        }

        const poly = L.polyline(updatedPoints, {
          color: toolMode === 'measure' ? '#10b981' : '#0066ff',
          weight: 4,
          dashArray: toolMode === 'measure' ? '6, 6' : undefined,
        }).addTo(drawingLayer);

        // Tooltip en el último punto con la distancia acumulada
        poly.bindTooltip(
          `<strong>${toolMode === 'measure' ? 'Distancia' : 'Longitud'}:</strong> ${totalDistanceMeters.toFixed(1)} m`,
          { permanent: true, direction: 'top', className: 'optifiber-map-tooltip' }
        ).openTooltip(newPoint);
      }
    },
    [toolMode]
  );

  // Manejo de doble clic para finalizar trazado
  const handleMapDoubleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      if (toolMode === 'draw_trunk' && drawingPointsRef.current.length >= 2) {
        let totalDistanceMeters = 0;
        const pts = drawingPointsRef.current;
        for (let i = 0; i < pts.length - 1; i++) {
          totalDistanceMeters += pts[i].distanceTo(pts[i + 1]);
        }
        const coords: Array<[number, number]> = pts.map((p) => [p.lat, p.lng]);
        onTrunkDrawn?.(coords, Math.round(totalDistanceMeters * 10) / 10);
      }
    },
    [toolMode, onTrunkDrawn]
  );

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (toolMode !== 'select') {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', handleMapClick);
      map.on('dblclick', handleMapDoubleClick);
    } else {
      map.getContainer().style.cursor = '';
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
      // Limpiar capa de dibujo si volvemos a selección normal y no hay puntos pendientes
      if (drawingPointsRef.current.length === 0) {
        drawingLayerRef.current.clearLayers();
      }
    }

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
    };
  }, [toolMode, handleMapClick, handleMapDoubleClick]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e2e8f0]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Leyenda flotante en esquina inferior izquierda */}
      <div className="absolute bottom-[24px] left-[24px] z-10 bg-white/95 backdrop-blur-md border border-[#e2e8f0] rounded-[8px] p-[10px] shadow-md pointer-events-auto">
        <h5 className="text-[11px] font-bold text-[#153b68] mb-[6px] uppercase tracking-wider">
          Leyenda de Red
        </h5>
        <div className="flex flex-col gap-[4px] text-[11px] text-[#334155]">
          <div className="flex items-center gap-[6px]">
            <span className="w-[10px] h-[10px] rounded-[3px] bg-[#059669] inline-block" />
            <span>Caja NAP (Distribución FTTH)</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[10px] h-[10px] rounded-full bg-[#153b68] border border-[#38bdf8] inline-block" />
            <span>Mufa de Empalme Primaria</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[12px] h-[3px] bg-[#0066ff] inline-block" />
            <span>Tendido Troncal (TIA-598)</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[8px] h-[8px] rounded-full bg-[#0066ff] inline-block" />
            <span>Abonado / Cliente Activo</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="w-[10px] h-[10px] rounded-full border border-dashed border-[#8b5cf6] inline-block" />
            <span>Reserva Técnica de Fibra</span>
          </div>
        </div>
      </div>
    </div>
  );
}
