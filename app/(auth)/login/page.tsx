'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, LogIn, HelpCircle } from 'lucide-react';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@fiberplus.pe');
  const [password, setPassword] = useState('password');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password, remember });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Credenciales inválidas. Verifica tu correo y contraseña.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f7fb]">
      {/* Columna Izquierda con Branding y Beneficios */}
      <AuthLeftColumn />

      {/* Columna Derecha con Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center p-[24px] sm:p-[40px]">
        <div className="w-full max-w-[440px] bg-white border border-[#f1f5f9] rounded-[16px] p-[36px] sm:p-[42px] shadow-[0px_4px_15px_rgba(0,0,0,0.06)] flex flex-col gap-[24px]">
          {/* Logo Central de Tarjeta */}
          <div className="flex flex-col items-center text-center">
            <BrandLogo size="lg" showSubtitle={false} href="" />
            <span className="text-[12px] text-[#153b68] font-medium tracking-wide mt-[4px]">
              Sistema de Gestión de Red de Fibra Óptica
            </span>
          </div>

          {/* Título y Subtítulo */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-[#153b68] tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-[13px] text-[#64748b] mt-[4px]">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#9f1239] text-[13px] p-[12px] rounded-[8px]">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario o correo electrónico"
              icon={<Mail className="w-[18px] h-[18px]" />}
            />

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              icon={<Lock className="w-[18px] h-[18px]" />}
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              }
            />

            {/* Recordarme y Olvidó contraseña */}
            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-[8px] text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-[16px] h-[16px] rounded border-[#cbd5e1] text-[#0066ff] focus:ring-[#0066ff]"
                />
                <span>Recordarme</span>
              </label>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Comuníquese con el administrador del sistema para restablecer su contraseña.');
                }}
                className="text-[#0066ff] hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de Enviar */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white py-[12px] font-semibold"
            >
              <LogIn className="w-[18px] h-[18px] mr-[6px]" />
              Iniciar sesión
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center justify-center my-[4px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <span className="relative bg-white px-[12px] text-[12px] text-[#94a3b8] tracking-wide font-medium">
              Otras opciones
            </span>
          </div>

          {/* Acciones Secundarias */}
          <div className="flex flex-col sm:flex-row gap-[10px]">
            <Link
              href="/register"
              className="flex-1 border border-[#e2e8f0] rounded-[8px] py-[10px] px-[14px] text-[13px] text-[#334155] font-medium text-center hover:bg-[#f8fafc] transition-colors"
            >
              Crear cuenta
            </Link>
            <button
              type="button"
              onClick={() => alert('Soporte técnico Fiberplus: soporte@fiberplus.pe')}
              className="flex items-center justify-center gap-[6px] border border-[#e2e8f0] rounded-[8px] py-[10px] px-[14px] text-[13px] text-[#334155] font-medium hover:bg-[#f8fafc] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-[16px] h-[16px] text-[#64748b]" />
              <span>Soporte</span>
            </button>
          </div>

          {/* Pie de Página */}
          <div className="text-center pt-[4px]">
            <p className="text-[11px] text-[#94a3b8]">
              ©2026 Fiberplus. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
