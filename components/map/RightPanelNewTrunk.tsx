'use client';

import React, { useState } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface RightPanelNewTrunkProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    origin: string;
    destination: string;
    cable_type: string;
    fiber_count: number;
    color: string;
    length_meters: number;
    status: string;
    description: string;
  }) => void;
  estimatedLength?: number;
}

export function RightPanelNewTrunk({
  isOpen,
  onClose,
  onSave,
  estimatedLength = 254.8,
}: RightPanelNewTrunkProps) {
  const [code, setCode] = useState('TR-014');
  const [origin, setOrigin] = useState('MUFA-03');
  const [destination, setDestination] = useState('NAP-07');
  const [cableType, setCableType] = useState('Troncal (144 hilos)');
  const [fiberCount, setFiberCount] = useState(144);
  const [color, setColor] = useState('Azul');
  const [lengthMeters, setLengthMeters] = useState(estimatedLength);
  const [status, setStatus] = useState('activo');
  const [description, setDescription] = useState('Tramo principal de distribución.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code,
      origin,
      destination,
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

        {/* Origen */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Origen *</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[10px] py-[6px] text-[13px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
          >
            <option value="OLT Chiclayo">OLT Chiclayo Central</option>
            <option value="MUFA-01">MUFA-01 (Av. Balta)</option>
            <option value="MUFA-02">MUFA-02 (Jr. San José)</option>
            <option value="MUFA-03">MUFA-03 (Ruta Bolognesi)</option>
          </select>
        </div>

        {/* Destino */}
        <div className="flex flex-col gap-[4px]">
          <label className="text-[12px] font-semibold text-[#334155]">Destino *</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-[10px] py-[6px] text-[13px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
          >
            <option value="NAP-04">NAP-04 (Jr. Bolognesi 450)</option>
            <option value="NAP-05">NAP-05 (Av. Balta 820)</option>
            <option value="NAP-07">NAP-07 (Jr. Los Olivos)</option>
            <option value="MUFA-03">MUFA-03 (Empalme Intermedio)</option>
          </select>
        </div>

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
            <option value="Azul">1 - Azul (#0066cc)</option>
            <option value="Naranja">2 - Naranja (#ff6600)</option>
            <option value="Verde">3 - Verde (#009933)</option>
            <option value="Marrón">4 - Marrón (#8b4513)</option>
            <option value="Gris">5 - Gris (#808080)</option>
            <option value="Blanco">6 - Blanco (#f8fafc)</option>
            <option value="Rojo">7 - Rojo (#e60000)</option>
            <option value="Amarillo">9 - Amarillo (#ffd700)</option>
            <option value="Turquesa">12 - Turquesa (#00ced1)</option>
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
              onClick={() => alert(`Longitud recalculada según nodos seleccionados: ${estimatedLength} m`)}
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
