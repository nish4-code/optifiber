'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  normalizeTrunkSegments,
  type MapTrunk,
  type MapNap,
  type MapClosure,
  type MapCustomer,
  type MapZone,
  type LayerVisibilityState,
  type MapTileMode,
  type GisToolMode,
} from '@/types/map';

interface MapCanvasProps {
  trunks: MapTrunk[];
  naps: MapNap[];
  closures: MapClosure[];
  customers: MapCustomer[];
  zones?: MapZone[];
  layers: LayerVisibilityState;
  tileMode: MapTileMode;
  toolMode: GisToolMode;
  onToolModeChange?: (mode: GisToolMode) => void;
  drawingSegments?: Array<Array<[number, number]>>;
  onDrawingSegmentsChange?: (segments: Array<Array<[number, number]>>) => void;
  editingTrunkId?: number | null;
  onTrunkDrawn?: (segments: Array<Array<[number, number]>>, lengthMeters: number) => void;
  onMapClickForNap?: (lat: number, lng: number) => void;
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
  zones = [],
  layers,
  tileMode,
  toolMode,
  onToolModeChange,
  drawingSegments = [],
  onDrawingSegmentsChange,
  editingTrunkId = null,
  onTrunkDrawn,
  onMapClickForNap,
  focusedCoordinates,
  fitBoundsTrigger,
  onSelectElement,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Capas Leaflet administradas
  const zonesLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const trunksLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const napsLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const closuresLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const customersLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const dropsLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawingLayerRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  const drawingSegmentsRef = useRef<Array<Array<[number, number]>>>(drawingSegments);
  const toolModeRef = useRef<GisToolMode>(toolMode);

  useEffect(() => {
    drawingSegmentsRef.current = drawingSegments;
  }, [drawingSegments]);

  useEffect(() => {
    toolModeRef.current = toolMode;
  }, [toolMode]);

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centro inicial: Abancay, Apurímac
    const map = L.map(mapContainerRef.current, {
      center: [-13.6339, -72.8814],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Control de zoom en esquina superior izquierda discreta
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Control de escala en esquina inferior derecha
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

    // Agregar grupos de capas al mapa
    zonesLayerRef.current.addTo(map);
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

  // 3.2. Renderizado de polígonos de Zonas
  useEffect(() => {
    const layer = zonesLayerRef.current;
    layer.clearLayers();

    if (!layers.zonas) return;

    zones.forEach((zone) => {
      if (!zone.polygon || zone.polygon.length < 3) return;

      const poly = L.polygon(zone.polygon, {
        color: '#6366f1',
        weight: 2,
        dashArray: '6, 4',
        fillColor: '#6366f1',
        fillOpacity: 0.08,
        interactive: false,
      });

      poly.bindTooltip(`Zona: ${zone.name} (${zone.code})`, {
        direction: 'center',
        className: 'optifiber-map-tooltip',
      });

      poly.addTo(layer);
    });
  }, [zones, layers.zonas]);

  // 4. Renderizado de Troncales
  useEffect(() => {
    const layer = trunksLayerRef.current;
    layer.clearLayers();

    if (!layers.troncales) return;

    const isSat = tileMode === 'satellite';

    trunks.forEach((trunk) => {
      const segments = normalizeTrunkSegments(trunk.path).filter((seg) => seg.length >= 2);
      if (segments.length === 0) return;
      if (editingTrunkId !== null && trunk.id === editingTrunkId) return;

      const km = Number(trunk.length_km || 0);
      const trunkColor = trunk.map_color || '#2563eb';

      // En modo satélite, dibujamos una polilínea base (casing / halo) de alto contraste
      if (isSat) {
        L.polyline(segments, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layer);
      }

      const polyline = L.polyline(segments, {
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

      polyline.on('click', (e) => {
        if (toolModeRef.current === 'draw_trunk' || toolModeRef.current === 'measure') {
          L.DomEvent.stopPropagation(e);
          const current = drawingSegmentsRef.current;
          const clickedPt: [number, number] = [e.latlng.lat, e.latlng.lng];
          if (current.length === 0) {
            onDrawingSegmentsChange?.([[clickedPt]]);
          } else {
            const lastIdx = current.length - 1;
            const next = current.map((seg, i) => (i === lastIdx ? [...seg, clickedPt] : seg));
            onDrawingSegmentsChange?.(next);
          }
          return;
        }
        onSelectElement?.({ type: 'trunk', data: trunk });
      });

      polyline.addTo(layer);
    });
  }, [trunks, layers.troncales, tileMode, editingTrunkId, onSelectElement, onDrawingSegmentsChange]);

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
          <div style="margin-bottom: 2px;"><strong>Dirección:</strong> ${nap.address || 'Sin dirección'}</div>
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

  // 8. Renderizado reactivo de segmentos, vértices y polilíneas en modo dibujo/medición
  useEffect(() => {
    const drawingLayer = drawingLayerRef.current;
    drawingLayer.clearLayers();

    if (drawingSegments.length === 0) {
      return;
    }

    const totalPoints = drawingSegments.reduce((acc, seg) => acc + seg.length, 0);
    let totalDistanceMeters = 0;

    drawingSegments.forEach((seg) => {
      for (let i = 0; i < seg.length - 1; i++) {
        totalDistanceMeters += L.latLng(seg[i][0], seg[i][1]).distanceTo(
          L.latLng(seg[i + 1][0], seg[i + 1][1])
        );
      }
    });

    const lastSegIdx = drawingSegments.length - 1;

    drawingSegments.forEach((segment, segIdx) => {
      const latLngs = segment.map(([lat, lng]) => L.latLng(lat, lng));
      if (latLngs.length === 0) return;

      const isActiveSegment = segIdx === lastSegIdx;

      // Polilínea o Polígono conectando los puntos del segmento
      if (toolMode === 'draw_zone' && segIdx === 0 && latLngs.length >= 3) {
        const poly = L.polygon(latLngs, {
          color: '#8b5cf6',
          weight: 3,
          dashArray: '5, 5',
          fillColor: '#8b5cf6',
          fillOpacity: 0.18,
        }).addTo(drawingLayer);

        poly.bindTooltip(
          `<strong>Área de Zona:</strong> ${latLngs.length} vértices`,
          { permanent: true, direction: 'top', className: 'optifiber-map-tooltip' }
        ).openTooltip(latLngs[latLngs.length - 1]);
      } else if (latLngs.length > 1) {
        const poly = L.polyline(latLngs, {
          color: toolMode === 'measure' ? '#10b981' : toolMode === 'draw_zone' ? '#8b5cf6' : '#0066ff',
          weight: 4,
          dashArray: toolMode === 'measure' || toolMode === 'draw_zone' ? '6, 6' : undefined,
        }).addTo(drawingLayer);

        if (isActiveSegment) {
          poly.bindTooltip(
            `<strong>${toolMode === 'measure' ? 'Distancia' : toolMode === 'draw_zone' ? 'Zona' : 'Longitud'}:</strong> ${totalDistanceMeters.toFixed(1)} m (${totalPoints} pts)`,
            { permanent: true, direction: 'top', className: 'optifiber-map-tooltip' }
          ).openTooltip(latLngs[latLngs.length - 1]);
        }
      }

      // Marcadores arrastrables, ramificables y eliminables en cada vértice
      latLngs.forEach((pt, idx) => {
        const isActiveTip = isActiveSegment && idx === latLngs.length - 1;
        const size = isActiveTip ? 15 : 12;
        const vertexIcon = L.divIcon({
          className: 'vertex-marker',
          html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background: ${isActiveTip ? '#f59e0b' : toolMode === 'measure' ? '#10b981' : toolMode === 'draw_zone' ? '#8b5cf6' : '#0066ff'};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.5);
            cursor: pointer;
          "></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker(pt, {
          icon: vertexIcon,
          draggable: true,
        });

        marker.bindTooltip(
          isActiveTip
            ? `Punto activo · Arrastra para mover · Clic derecho borra`
            : toolMode === 'select'
            ? `Punto #${idx + 1} · Clic para iniciar rama aquí · Arrastra para mover · Clic derecho borra`
            : `Punto #${idx + 1} · Clic para conectar/cerrar · Shift+Clic para nueva rama · Clic derecho borra`,
          { direction: 'top', className: 'optifiber-map-tooltip' }
        );

        marker.on('click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          if (isActiveTip) return;

          const current = drawingSegmentsRef.current;
          const wantsBranch =
            toolModeRef.current === 'select' ||
            ev.originalEvent.shiftKey ||
            ev.originalEvent.altKey;

          if (wantsBranch) {
            if (toolModeRef.current === 'select') {
              onToolModeChange?.('draw_trunk');
            }
            const cleaned = current.filter(
              (seg, sIdx) => !(sIdx === current.length - 1 && seg.length <= 1)
            );
            onDrawingSegmentsChange?.([...cleaned, [[pt.lat, pt.lng]]]);
            return;
          }

          // En modo dibujo, clic normal conecta/cierra desde el punto activo hacia este vértice
          if (current.length === 0) {
            onDrawingSegmentsChange?.([[[pt.lat, pt.lng]]]);
            return;
          }
          const lastIdx = current.length - 1;
          const next = current.map((seg, i) =>
            i === lastIdx ? [...seg, [pt.lat, pt.lng] as [number, number]] : seg
          );
          onDrawingSegmentsChange?.(next);
        });

        marker.on('dragend', (ev) => {
          const updatedPos = (ev.target as L.Marker).getLatLng();
          const next = drawingSegmentsRef.current.map((seg, sIdx) =>
            sIdx === segIdx
              ? seg.map((p, i) => (i === idx ? ([updatedPos.lat, updatedPos.lng] as [number, number]) : p))
              : seg
          );
          onDrawingSegmentsChange?.(next);
        });

        marker.on('contextmenu', (ev) => {
          L.DomEvent.stopPropagation(ev);
          const next = drawingSegmentsRef.current
            .map((seg, sIdx) => (sIdx === segIdx ? seg.filter((_, i) => i !== idx) : seg))
            .filter((seg) => seg.length > 0);
          onDrawingSegmentsChange?.(next);
        });

        marker.addTo(drawingLayer);

        // Punto medio arrastrable (tipo Figma) para jalar/doblar cualquier segmento del tramo
        if (idx < latLngs.length - 1) {
          const nextPt = latLngs[idx + 1];
          const midLat = (pt.lat + nextPt.lat) / 2;
          const midLng = (pt.lng + nextPt.lng) / 2;

          const midIcon = L.divIcon({
            className: 'midpoint-marker',
            html: `<div style="
              width: 10px;
              height: 10px;
              background: rgba(255, 255, 255, 0.9);
              border: 2px solid #0066ff;
              border-radius: 50%;
              opacity: 0.8;
              cursor: copy;
            "></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });

          const midMarker = L.marker([midLat, midLng], {
            icon: midIcon,
            draggable: true,
          });

          midMarker.bindTooltip('Arrastra para jalar un nuevo vértice', {
            direction: 'top',
            className: 'optifiber-map-tooltip',
          });

          midMarker.on('dragend', (ev) => {
            const pos = (ev.target as L.Marker).getLatLng();
            const next = drawingSegmentsRef.current.map((seg, sIdx) => {
              if (sIdx !== segIdx) return seg;
              const updated = [...seg];
              updated.splice(idx + 1, 0, [pos.lat, pos.lng]);
              return updated;
            });
            onDrawingSegmentsChange?.(next);
          });

          midMarker.addTo(drawingLayer);
        }
      });
    });
  }, [drawingSegments, toolMode, onDrawingSegmentsChange, onToolModeChange]);

  // 9. Manejo de Herramientas de Dibujo y Medición (Click, Clic derecho, Doble click)
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (toolMode === 'select') return;

      if (toolMode === 'add_nap') {
        onMapClickForNap?.(e.latlng.lat, e.latlng.lng);
        return;
      }

      const current = drawingSegmentsRef.current;
      const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      if (current.length === 0) {
        onDrawingSegmentsChange?.([[newPt]]);
      } else {
        const lastIdx = current.length - 1;
        const next = current.map((seg, i) => (i === lastIdx ? [...seg, newPt] : seg));
        onDrawingSegmentsChange?.(next);
      }
    },
    [toolMode, onDrawingSegmentsChange, onMapClickForNap]
  );

  const handleMapContextMenu = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (toolMode === 'select' || drawingSegmentsRef.current.length === 0) return;
      L.DomEvent.preventDefault(e.originalEvent);
      const current = drawingSegmentsRef.current;
      const lastIdx = current.length - 1;
      const next = current
        .map((seg, i) => (i === lastIdx ? seg.slice(0, -1) : seg))
        .filter((seg) => seg.length > 0);
      onDrawingSegmentsChange?.(next);
    },
    [toolMode, onDrawingSegmentsChange]
  );

  // Manejo de doble clic para finalizar trazado
  const handleMapDoubleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
      const validSegments = drawingSegmentsRef.current.filter((seg) => seg.length >= 2);
      if (toolMode === 'draw_trunk' && validSegments.length > 0) {
        let totalDistanceMeters = 0;
        validSegments.forEach((seg) => {
          for (let i = 0; i < seg.length - 1; i++) {
            totalDistanceMeters += L.latLng(seg[i][0], seg[i][1]).distanceTo(
              L.latLng(seg[i + 1][0], seg[i + 1][1])
            );
          }
        });
        onTrunkDrawn?.(validSegments, Math.round(totalDistanceMeters * 10) / 10);
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
      map.on('contextmenu', handleMapContextMenu);
      map.on('dblclick', handleMapDoubleClick);
    } else {
      map.getContainer().style.cursor = '';
      map.off('click', handleMapClick);
      map.off('contextmenu', handleMapContextMenu);
      map.off('dblclick', handleMapDoubleClick);
    }

    return () => {
      map.off('click', handleMapClick);
      map.off('contextmenu', handleMapContextMenu);
      map.off('dblclick', handleMapDoubleClick);
    };
  }, [toolMode, handleMapClick, handleMapContextMenu, handleMapDoubleClick]);

  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e2e8f0]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Leyenda flotante colapsable en esquina inferior derecha */}
      <div className="absolute bottom-[24px] right-[24px] z-10 bg-white/95 backdrop-blur-md border border-[#e2e8f0] rounded-[8px] shadow-lg pointer-events-auto transition-all overflow-hidden max-w-[260px]">
        <button
          type="button"
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
          className="w-full px-[12px] py-[8px] flex items-center justify-between gap-[8px] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-[6px]">
            <span className="w-[8px] h-[8px] rounded-full bg-[#0066ff]" />
            <h5 className="text-[11px] font-bold text-[#153b68] uppercase tracking-wider">
              Leyenda de Red
            </h5>
          </div>
          <span className="text-[10px] text-[#64748b] font-medium">
            {isLegendExpanded ? 'Ocultar' : 'Ver'}
          </span>
        </button>

        {isLegendExpanded && (
          <div className="p-[10px] pt-[6px] border-t border-[#f1f5f9] flex flex-col gap-[5px] text-[11px] text-[#334155]">
            <div className="flex items-center gap-[6px]">
              <span className="w-[10px] h-[10px] rounded-[3px] bg-[#059669] inline-block shrink-0" />
              <span>Caja NAP (Distribución FTTH)</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#153b68] border border-[#38bdf8] inline-block shrink-0" />
              <span>Mufa de Empalme Primaria</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[12px] h-[3px] bg-[#0066ff] inline-block shrink-0" />
              <span>Tendido Troncal (TIA-598)</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-[#0066ff] inline-block shrink-0" />
              <span>Abonado / Cliente Activo</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="w-[10px] h-[10px] rounded-full border border-dashed border-[#8b5cf6] inline-block shrink-0" />
              <span>Reserva Técnica de Fibra</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
