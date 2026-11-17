'use client';

import React, { useMemo, useState } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MapZone } from '@/types/map';

interface RightPanelNewTrunkProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    zone_id: number | null;
    cable_type: string;
    fiber_count: number;
    color: string;
    length_meters: number;
    status: string;
    description: string;
  }) => void;
  estimatedLength?: number;
  existingTrunksCount?: number;
  zones?: MapZone[];
  selectedZoneId?: number | null;
}

export function RightPanelNewTrunk({
  isOpen,
  onClose,
  onSave,
  estimatedLength = 0,
  existingTrunksCount = 0,
  zones = [],
  selectedZoneId = null,
}: RightPanelNewTrunkProps) {
  const suggestedCode = useMemo(
    () => `TR-${String(existingTrunksCount + 1).padStart(3, '0')}`,
    [existingTrunksCount]
  );

  const [code, setCode] = useState(suggestedCode);
  const [name, setName] = useState('');
  const [zoneId, setZoneId] = useState<string>(selectedZoneId ? String(selectedZoneId) : '');
  const [cableType, setCableType] = useState('Troncal (144 hilos)');
  const [fiberCount, setFiberCount] = useState(144);
  const [color, setColor] = useState('#0066cc');
  const [lengthMeters, setLengthMeters] = useState(estimatedLength);
  const [status, setStatus] = useState('activo');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code,
      name,
      zone_id: zoneId ? Number(zoneId) : null,
      cable_type: cableType,
      fiber_count: fiberCount,
      color,
      length_meters: lengthMeters,
      status,
      description,
    });
  };

  return (
    <div className="w-[320px] bg-white border-l border-[#e2e8f0] h-full flex flex-col justify-between shadow-xl z-20 shrink-0">
      {/* Cabecera del Panel */}
      <div className="px-[16px] py-[12px] border-b border-[#f1f5f9] flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-[#153b68]">Nuevo tramo de fibra</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-[#94a3b8] hover:text-[#475569] p-[4px] rounded-[4px] transition-colors cursor-pointer"
        >
          <X className="w-[16px] h-[16px]" />
        </button>
      </div>

      {/* Cuerpo del Formulario con Scroll */}
      <form onSubmit={handleSubmit} className="p-[16px] overflow-y-auto flex-1 flex flex-col gap-[14px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
          INFORMACIÓN DEL TRAMO
        </span>

        {/* Código */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Código *</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="text-[13px] py-[6px]"
          />
        </div>

        {/* Nombre / Trayectoria */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Nombre / Trayectoria *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Troncal Tamburco o Av. Prado"
            required
            className="text-[13px] py-[6px]"
          />
        </div>

        {/* Zona asignada */}
        {zones.length > 0 && (
          <div className="flex flex-col gap-[4px]">
            <label className="text-[12px] font-semibold text-[#334155]">Zona / Subzona</label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[10px] py-[6px] text-[13px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
            >
              <option value="">Sin zona específica</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tipo de Cable y Fibras */}
        <div className="grid grid-cols-2 gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#334155]">Tipo de cable</label>
            <select
              value={cableType}
              onChange={(e) => {
                setCableType(e.target.value);
                if (e.target.value.includes('144')) setFiberCount(144);
                else if (e.target.value.includes('48')) setFiberCount(48);
                else if (e.target.value.includes('24')) setFiberCount(24);
              }}
              className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[8px] py-[6px] text-[12px] text-[#0f172a]"
            >
              <option value="Troncal (144 hilos)">Troncal (144 hilos)</option>
              <option value="Distribución (48 hilos)">Distribución (48 hilos)</option>
              <option value="Ramal (24 hilos)">Ramal (24 hilos)</option>
            </select>
          </div>

          <div className="flex flex-col gap-[4px]">
            <label className="text-[11px] font-semibold text-[#334155]">Fibras</label>
            <input
              type="number"
              value={fiberCount}
              onChange={(e) => setFiberCount(Number(e.target.value))}
              className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[8px] py-[6px] text-[12px] text-[#0f172a]"
            />
          </div>
        </div>

        {/* Color TIA-598 */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Color del tramo</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[10px] py-[6px] text-[13px] text-[#0f172a]"
          >
            <option value="#0066cc">1 - Azul (#0066cc)</option>
            <option value="#ff6600">2 - Naranja (#ff6600)</option>
            <option value="#009933">3 - Verde (#009933)</option>
            <option value="#8b4513">4 - Marrón (#8b4513)</option>
            <option value="#808080">5 - Gris (#808080)</option>
            <option value="#e60000">7 - Rojo (#e60000)</option>
            <option value="#ffd700">9 - Amarillo (#ffd700)</option>
            <option value="#00ced1">12 - Turquesa (#00ced1)</option>
          </select>
        </div>

        {/* Longitud Estimada */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Longitud estimada</label>
          <div className="flex items-center gap-[6px]">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(Number(e.target.value))}
                className="w-full bg-white border border-[#e2e8f0] rounded-[8px] pl-[10px] pr-[28px] py-[6px] text-[13px] text-[#0f172a]"
              />
              <span className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[11px] text-[#94a3b8]">m</span>
            </div>
            <button
              type="button"
              onClick={() => setLengthMeters(estimatedLength)}
              className="flex items-center gap-[4px] px-[8px] py-[7px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#153b68] rounded-[8px] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Calculator className="w-[12px] h-[12px]" />
              <span>Calcular</span>
            </button>
          </div>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Estado *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[10px] py-[6px] text-[13px] text-[#0f172a]"
          >
            <option value="activo">Activo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notas o referencia del trazo..."
            rows={2}
            className="w-full bg-white border border-[#e2e8f0] rounded-[8px] p-[8px] text-[12px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
          />
        </div>

        {/* Botones al pie del panel */}
        <div className="pt-[10px] border-t border-[#f1f5f9] flex items-center gap-[8px] mt-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white"
          >
            <Check className="w-[14px] h-[14px] mr-[4px]" />
            Guardar tramo
          </Button>
        </div>
      </form>
    </div>
  );
}
