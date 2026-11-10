'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al registrar la cuenta. Intente con otro correo.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const score = [hasLength, hasLetter, hasNumber].filter(Boolean).length;

  return (
    <div className="min-h-screen flex bg-[#f4f7fb]">
      <AuthLeftColumn />

      <div className="flex-1 flex flex-col items-center justify-center p-[24px] sm:p-[40px]">
        <div className="w-full max-w-[460px] bg-white border border-[#f1f5f9] rounded-[16px] p-[36px] sm:p-[42px] shadow-[0px_4px_15px_rgba(0,0,0,0.06)] flex flex-col gap-[20px]">
          {/* Logo Central */}
          <div className="flex flex-col items-center text-center">
            <BrandLogo size="lg" showSubtitle={false} href="" />
            <span className="text-[12px] text-[#153b68] font-medium tracking-wide mt-[4px]">
              Sistema de Gestión de Red de Fibra Óptica
            </span>
          </div>

          {/* Título */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-[#153b68] tracking-tight">
              Crear cuenta
            </h2>
            <p className="text-[13px] text-[#64748b] mt-[4px]">
              Completa el formulario para registrarte en la plataforma
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#9f1239] text-[13px] p-[12px] rounded-[8px]">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              icon={<User className="w-[18px] h-[18px]" />}
            />

            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico corporativo"
              icon={<Mail className="w-[18px] h-[18px]" />}
            />

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mín. 8 caracteres)"
              icon={<Lock className="w-[18px] h-[18px]" />}
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#94a3b8] hover:text-[#475569] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              }
            />

            <Input
              id="password_confirmation"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirmar contraseña"
              icon={<Lock className="w-[18px] h-[18px]" />}
            />

            {/* Indicador de Fortaleza de Contraseña */}
            <div className="flex items-center gap-[8px] px-[2px]">
              <div className="flex-1 flex gap-[4px]">
                <div
                  className={`flex-1 h-[4px] rounded-full transition-colors ${
                    score >= 1 ? 'bg-[#0066ff]' : 'bg-[#e2e8f0]'
                  }`}
                />
                <div
                  className={`flex-1 h-[4px] rounded-full transition-colors ${
                    score >= 2 ? 'bg-[#0066ff]' : 'bg-[#e2e8f0]'
                  }`}
                />
                <div
                  className={`flex-1 h-[4px] rounded-full transition-colors ${
                    score >= 3 ? 'bg-[#0066ff]' : 'bg-[#e2e8f0]'
                  }`}
                />
                <div
                  className={`flex-1 h-[4px] rounded-full transition-colors ${
                    password.length >= 12 ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'
                  }`}
                />
              </div>
              <span className="text-[11px] font-medium text-[#64748b]">
                {score === 3 ? 'Seguridad alta' : score === 2 ? 'Seguridad media' : 'Seguridad baja'}
              </span>
            </div>

            {/* Checkbox de Términos */}
            <label className="flex items-start gap-[10px] text-[12px] text-[#475569] cursor-pointer py-[4px]">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-[2px] w-[16px] h-[16px] rounded border-[#cbd5e1] text-[#0066ff] focus:ring-[#0066ff]"
              />
              <span>
                Acepto los{' '}
                <a href="#" className="text-[#0066ff] hover:underline font-medium">
                  Términos de Servicio
                </a>{' '}
                y la{' '}
                <a href="#" className="text-[#0066ff] hover:underline font-medium">
                  Política de Privacidad
                </a>
              </span>
            </label>

            {/* Botón de Enviar */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white py-[12px] font-semibold mt-[4px]"
            >
              <UserPlus className="w-[18px] h-[18px] mr-[6px]" />
              Crear cuenta
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center justify-center my-[4px]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <span className="relative bg-white px-[12px] text-[12px] text-[#94a3b8] tracking-wide font-medium">
              ¿Ya tienes una cuenta?
            </span>
          </div>

          {/* Botón Iniciar sesión */}
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-[8px] border border-[#e2e8f0] rounded-[8px] py-[10px] px-[14px] text-[13px] text-[#334155] font-medium hover:bg-[#f8fafc] transition-colors"
          >
            <LogIn className="w-[16px] h-[16px] text-[#64748b]" />
            <span>Iniciar sesión</span>
          </Link>

          {/* Pie */}
          <div className="text-center pt-[2px]">
            <p className="text-[11px] text-[#94a3b8]">
              ©2026 Fiberplus. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
