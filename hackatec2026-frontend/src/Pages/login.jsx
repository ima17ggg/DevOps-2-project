import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState('')
  const navigate  = useNavigate()
  const { login, isAuthenticated } = useAuth()

<<<<<<< HEAD
=======
  // Si ya tiene sesión activa, redirigir directo al dashboard
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Credenciales inválidas')
        return
      }

      const authenticatedUser = data?.data?.user
      if (!authenticatedUser) {
        setError('No se recibió información de sesión')
        return
      }

      login(authenticatedUser)
      navigate('/dashboard')
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-body-md">

      {/* ── Panel izquierdo: Branding ────────────────────────────────── */}
      <div className="hidden lg:flex w-[42%] bg-[#041632] flex-col justify-between p-12 relative overflow-hidden select-none">

        {/* Decoración geométrica de fondo */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="80%"  cy="15%"  r="260" fill="#ffffff" />
          <circle cx="20%"  cy="80%"  r="180" fill="#ffffff" />
          <circle cx="60%"  cy="60%"  r="120" fill="#fc820c" />
          <rect x="60%" y="0"   width="3" height="100%" fill="#ffffff" />
          <rect x="0"   y="45%" width="100%" height="3" fill="#ffffff" />
        </svg>

        {/* Logo + nombre */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-[#fc820c] rounded-xl flex items-center justify-center shadow-lg">
<<<<<<< HEAD
              <span translate="no" className="material-symbols-outlined notranslate text-white text-[26px]">
                factory
              </span>
=======
              <span className="material-symbols-outlined text-white text-[26px]">factory</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            </div>
            <div>
              <p className="text-[#b7c8e1] text-[11px] font-semibold uppercase tracking-[0.18em]">
                Industrial Ops
              </p>
              <h1 className="text-white text-[22px] font-bold leading-tight">
                Workforce Manager
              </h1>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-white text-[34px] font-black leading-[1.15] tracking-tight max-w-[320px]">
              Control total de tu planta industrial.
            </h2>
            <p className="text-[#b7c8e1] text-[15px] leading-relaxed mt-4 max-w-[300px]">
              Monitorea asistencia, incidentes y activos en tiempo real desde un solo panel.
            </p>
          </div>
        </div>

        {/* Stats decorativas */}
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <StatBadge icon="badge" value="1,284" label="Empleados activos" />
            <StatBadge icon="directions_car" value="100%" label="Flota en línea" />
          </div>
          <p className="text-[#5a6e8a] text-[12px] mt-2">
            Plant Alpha-4 · Sistema de Control v2.0
          </p>
        </div>
      </div>

      {/* ── Panel derecho: Formulario ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#f7f9fb] px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile: logo pequeño */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#041632] rounded-lg flex items-center justify-center">
<<<<<<< HEAD
              <span translate="no" className="material-symbols-outlined notranslate text-white text-[18px]">
                factory
              </span>
=======
              <span className="material-symbols-outlined text-white text-[18px]">factory</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            </div>
            <span className="text-[#041632] text-[17px] font-bold">Workforce Manager</span>
          </div>

          <h2 className="text-[#041632] text-[28px] font-black tracking-tight mb-1">
            Iniciar sesión
          </h2>
          <p className="text-[#44474d] text-[14px] mb-8">
            Ingresa tus credenciales de administrador para continuar.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* ── Usuario ── */}
            <div className="flex flex-col gap-1.5">
<<<<<<< HEAD
              <label htmlFor="email" className="text-[#041632] text-[13px] font-semibold">
=======
              <label htmlFor="username" className="text-[#041632] text-[13px] font-semibold">
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                Correo o usuario <span className="text-[#ba1a1a]" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <span
<<<<<<< HEAD
                  translate="no"
                  className="material-symbols-outlined notranslate absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[20px] pointer-events-none"
=======
                  className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[20px] pointer-events-none"
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  aria-hidden="true"
                >
                  person
                </span>
                <input
                  id="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="correo@planta.com o usuario"
                  className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#c5c6ce] rounded-xl text-[14px] text-[#191c1e] placeholder-[#adb0b7] outline-none transition-all focus:border-[#041632] focus:ring-2 focus:ring-[#041632]/20 hover:border-[#75777e]"
                  aria-required="true"
                />
              </div>
            </div>

            {/* ── Contraseña ── */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[#041632] text-[13px] font-semibold">
                  Contraseña <span className="text-[#ba1a1a]" aria-hidden="true">*</span>
                </label>
                <button
                  type="button"
                  className="text-[#964900] text-[12px] font-semibold hover:text-[#fc820c] transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span
<<<<<<< HEAD
                  translate="no"
                  className="material-symbols-outlined notranslate absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[20px] pointer-events-none"
=======
                  className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[20px] pointer-events-none"
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  className="w-full h-[48px] pl-11 pr-12 bg-white border border-[#c5c6ce] rounded-xl text-[14px] text-[#191c1e] placeholder-[#adb0b7] outline-none transition-all focus:border-[#041632] focus:ring-2 focus:ring-[#041632]/20 hover:border-[#75777e]"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75777e] hover:text-[#041632] transition-colors cursor-pointer p-0.5 rounded"
                >
<<<<<<< HEAD
                  <span translate="no" className="material-symbols-outlined notranslate text-[20px]">
=======
                  <span className="material-symbols-outlined text-[20px]">
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* ── Error inline ── */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2 px-3 py-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg text-[#ba1a1a] text-[13px] font-medium"
              >
<<<<<<< HEAD
                <span translate="no" className="material-symbols-outlined notranslate text-[16px] flex-shrink-0">
                  error
                </span>
=======
                <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                {error}
              </div>
            )}

            {/* ── Botón submit ── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] mt-1 bg-[#041632] hover:bg-[#1b2b48] active:bg-[#041632] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
<<<<<<< HEAD
                  <span translate="no" className="material-symbols-outlined notranslate text-[18px]">
                    login
                  </span>
=======
                  <span className="material-symbols-outlined text-[18px]">login</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  Ingresar al sistema
                </>
              )}
            </button>
          </form>

          {/* Divider + QR hint */}
          <div className="flex items-center gap-3 mt-8 mb-5">
            <div className="flex-1 h-px bg-[#e0e3e5]" />
            <span className="text-[#75777e] text-[12px] font-medium">o accede con</span>
            <div className="flex-1 h-px bg-[#e0e3e5]" />
          </div>

          <button
            type="button"
            className="w-full h-[46px] border border-[#c5c6ce] bg-white hover:bg-[#f2f4f6] text-[#041632] text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
<<<<<<< HEAD
            <span translate="no" className="material-symbols-outlined notranslate text-[18px] text-[#964900]">
              qr_code_scanner
            </span>
=======
            <span className="material-symbols-outlined text-[18px] text-[#964900]">qr_code_scanner</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            Escanear QR de acceso rápido
          </button>

          <p className="text-center text-[#75777e] text-[12px] mt-8">
            Sistema restringido · Solo personal autorizado
            <br />
            <span className="text-[#adb0b7]">Industrial Ops © 2026</span>
          </p>
        </div>
      </div>
    </div>
  )
}

<<<<<<< HEAD
/* Componente auxiliar para stats del panel izquierdo con blindaje anti-traducción */
function StatBadge({ icon, value, label }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-3">
      <span translate="no" className="material-symbols-outlined notranslate text-[#fc820c] text-[20px]">
        {icon}
      </span>
=======
/* Componente auxiliar para stats del panel izquierdo */
function StatBadge({ icon, value, label }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-3">
      <span className="material-symbols-outlined text-[#fc820c] text-[20px]">{icon}</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
      <div>
        <p className="text-white text-[16px] font-bold leading-none">{value}</p>
        <p className="text-[#b7c8e1] text-[11px] mt-0.5">{label}</p>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
