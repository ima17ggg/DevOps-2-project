import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { startTrackingSession } from '../services/locationService'
import { recordCheckIn } from '../services/checkInActivityService'
import {
  getQRSession,
  getSessionEmployees,
  getEmployeeByDevice,
  registerDeviceForEmployee,
  ALL_EMPLOYEES,
} from '../services/qrSessionService'

// ── Empleado mock de respaldo (cuando no hay sesión QR activa) ────────────────
const MOCK_EMPLOYEE = {
  id: 'OP-4921',
  name: 'Marcus Johnson',
  role: 'Operador de Maquinaria Pesada',
  plant: 'Alpha-4',
  shift: 'Mañana · 07:00 – 15:00',
  department: 'Producción',
  status: 'Activo',
}

// ────────────────────────────────────────────────────────────────────────────────
export default function CheckIn() {
  const navigate         = useNavigate()
  const [searchParams]   = useSearchParams()

  // Sesión QR (si viene de un pase generado)
  const sessionToken     = searchParams.get('session')
  const qrSession        = sessionToken ? getQRSession(sessionToken) : null
  const sessionEmployees = qrSession ? getSessionEmployees(sessionToken) : []

  // Pasos: 'qr' → 'pick' (selector de empleado) → 'confirm' → 'done'
  const [step, setStep]                     = useState(() => {
    if (qrSession) {
      // Si el dispositivo ya está vinculado, saltar selección
      const knownId = getEmployeeByDevice(sessionToken)
      if (knownId) return 'confirm'
      return 'pick'     // mostrar selector de empleado
    }
    return 'qr'         // flujo manual sin sesión
  })
  const [employee, setEmployee]             = useState(() => {
    if (qrSession) {
      const knownId = getEmployeeByDevice(sessionToken)
      if (knownId) {
        const found = ALL_EMPLOYEES.find(e => e.id === knownId)
        if (found) return {
          ...found,
          plant:  'Alpha-4',
          shift:  qrSession.shift ?? found.shift,
          status: 'Activo',
        }
      }
    }
    return null
  })
  const [photo, setPhoto]                   = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // ── Cámara ──────────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async (facingMode = 'environment') => {
    setCameraError('')
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch {
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
    }
  }, [stopCamera])

  useEffect(() => {
    if (step === 'qr')      startCamera('environment')  // cámara trasera para escanear QR
    if (step === 'confirm') startCamera('user')         // cámara frontal para foto del empleado
    if (step === 'pick')    stopCamera()                // sin cámara en selector de empleado
    return () => stopCamera()
  }, [step]) // eslint-disable-line

  // ── Acciones ────────────────────────────────────────────────────────────────

  /**
   * Simula la detección exitosa del QR.
   * Reemplazar con jsQR real: parsear el token de la URL embebida en el QR.
   */
  const handleQrDetected = () => {
    stopCamera()
    if (qrSession) {
      // Si hay sesión activa, ir al selector de empleado
      setStep('pick')
    } else {
      // Sin sesión → usar empleado mock
      setEmployee(MOCK_EMPLOYEE)
      setStep('confirm')
    }
  }

  /** El empleado se selecciona a sí mismo en el picker de la sesión QR */
  const handlePickEmployee = (emp) => {
    const fullEmployee = {
      ...emp,
      plant:  'Alpha-4',
      shift:  qrSession?.shift ?? emp.shift,
      status: 'Activo',
    }
    // Vincular este dispositivo con el empleado para futuras entradas
    if (sessionToken) registerDeviceForEmployee(sessionToken, emp.id)
    setEmployee(fullEmployee)
    setStep('confirm')
  }

  /** Captura el frame actual del video como foto */
  const capturePhoto = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.92))
    stopCamera()
  }

  const retakePhoto = () => {
    setPhoto(null)
    startCamera('user')
  }

  const handleRegister = () => {
    if (!photo) return
    setIsRegistering(true)
    setTimeout(() => {
      stopCamera()
      // Activa rastreo GPS en background (persiste mientras use la app)
      startTrackingSession({ id: employee.id, name: employee.name, role: employee.role })
      recordCheckIn(employee, photo)
      setStep('done')
      setIsRegistering(false)
    }, 1400)
  }

  // ── Pantalla final ───────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-[#dcfce7] flex items-center justify-center">
          <span className="material-symbols-outlined notranslate text-[#15803d] text-[44px]"
            translate="no"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-[#041632] text-[26px] font-black">¡Entrada registrada!</h2>
          <p className="text-[#44474d] text-[15px] mt-2">
            {employee?.name} — {employee?.shift}
          </p>
          <p className="text-[#75777e] text-[13px] mt-1">
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {photo && (
          <img
            src={photo}
            alt="Foto de verificación"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
          />
        )}
        <button
          onClick={() => navigate('/chekin')}
          className="mt-2 h-12 px-8 bg-[#041632] hover:bg-[#1b2b48] text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer shadow-md"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  // ── Layout principal ─────────────────────────────────────────────────────────
  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#e0e3e5] px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <button
            onClick={() => { stopCamera(); navigate('/chekin') }}
            className="flex items-center gap-1.5 text-[#041632] text-[13px] font-semibold hover:text-[#964900] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined notranslate text-[18px]" translate="no">arrow_back</span>
            Regresar
          </button>
          <div className="h-5 w-px bg-[#e0e3e5]" />
          <div>
            <p className="text-[#041632] text-[13px] font-bold leading-none">Check-in Registration</p>
            <p className="text-[#75777e] text-[11px] mt-0.5">Plant Alpha-4</p>
          </div>
        </div>

        {/* Paso indicator */}
        {qrSession ? (
          <div className="flex items-center gap-2">
            <StepDot n={1} label="Empleado" active={step === 'pick'} done={step === 'confirm'} />
            <div className="w-8 h-px bg-[#c5c6ce]" />
            <StepDot n={2} label="Verificar" active={step === 'confirm'} done={false} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <StepDot n={1} label="Escanear QR" active={step === 'qr'} done={step === 'confirm'} />
            <div className="w-8 h-px bg-[#c5c6ce]" />
            <StepDot n={2} label="Verificar y Registrar" active={step === 'confirm'} done={false} />
          </div>
        )}
      </header>

      {/* ══════════════════════ PASO 1: Escanear QR ══════════════════════ */}
      {step === 'qr' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6">
          <div className="text-center">
            <h1 className="text-[#041632] text-[26px] font-black tracking-tight">
              Escanea tu código QR
            </h1>
            <p className="text-[#44474d] text-[14px] mt-1.5">
              Apunta la cámara hacia el código QR de tu credencial de empleado.
            </p>
          </div>

          {/* Visor de cámara */}
          <div className="relative w-full max-w-[480px] bg-[#191c1e] rounded-2xl overflow-hidden shadow-xl"
               style={{ aspectRatio: '4/3' }}>

            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="material-symbols-outlined notranslate text-[#fc820c] text-[40px]" translate="no">videocam_off</span>
                <p className="text-white text-[13px]">{cameraError}</p>
                <button
                  onClick={() => startCamera('environment')}
                  className="mt-1 px-4 py-2 bg-[#964900] text-white text-[12px] font-semibold rounded-lg cursor-pointer hover:bg-[#7d3d00] transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Marco de QR con esquinas animadas */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-52 h-52">
                    {/* Esquinas del marco */}
                    {[
                      'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                      'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                      'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                      'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-9 h-9 border-[#fc820c] ${cls}`} />
                    ))}
                    {/* Línea de escaneo animada */}
                    <div className="absolute left-2 right-2 top-0 h-0.5 bg-[#fc820c]/80 animate-[scan_2s_ease-in-out_infinite]"
                         style={{ animation: 'scan 2s ease-in-out infinite' }} />
                  </div>
                </div>
                {/* Oscurecido fuera del marco */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.45)' }} />
              </>
            )}
          </div>

          {/* Botón de confirmar (simula detección exitosa; reemplazar con jsQR real) */}
          <button
            onClick={handleQrDetected}
            disabled={!!cameraError}
            className="h-[50px] px-10 bg-[#041632] hover:bg-[#1b2b48] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined notranslate text-[#fc820c] text-[20px]" translate="no">qr_code_scanner</span>
            QR Detectado — Continuar
          </button>
          <p className="text-[#75777e] text-[12px]">
            El sistema detectará el QR automáticamente al integrarse con el API.
          </p>
        </div>
      )}

      {/* ══════════════════════ PASO PICK: Seleccionar empleado ══════════════ */}
      {step === 'pick' && (
        <div className="flex-1 flex flex-col items-center px-6 py-8 gap-6 max-w-[520px] w-full mx-auto">
          {/* Cabecera */}
          <div className="text-center w-full">
            <div className="w-14 h-14 rounded-full bg-[#fc820c]/10 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined notranslate text-[#fc820c] text-[30px]"
                translate="no"
                style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
            </div>
            <h1 className="text-[#041632] text-[22px] font-black">¿Quién eres?</h1>
            <p className="text-[#44474d] text-[13px] mt-1.5">
              Selecciona tu nombre en la lista de empleados autorizados para hoy.
            </p>
            {qrSession && (
              <div className="mt-3 inline-flex items-center gap-2 bg-[#041632]/[0.06] border border-[#041632]/20 rounded-full px-4 py-1.5">
                <span className="material-symbols-outlined notranslate text-[#041632] text-[14px]" translate="no">schedule</span>
                <span className="text-[#041632] text-[12px] font-semibold">
                  {qrSession.shift} · {qrSession.date}
                </span>
              </div>
            )}
          </div>

          {/* Lista de empleados de la sesión */}
          <div className="w-full bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-[#f7f9fb] border-b border-[#e0e3e5]">
              <p className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide">
                {sessionEmployees.length} empleado{sessionEmployees.length !== 1 ? 's' : ''} autorizados hoy
              </p>
            </div>
            {sessionEmployees.length === 0 ? (
              <div className="py-10 text-center text-[#75777e] text-[13px]">
                <span className="material-symbols-outlined notranslate text-[32px] block mb-2" translate="no">person_off</span>
                No hay empleados registrados en esta sesión
              </div>
            ) : (
              sessionEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handlePickEmployee(emp)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 border-b border-[#f2f4f6] hover:bg-[#041632]/[0.04] active:bg-[#041632]/[0.08] transition-colors cursor-pointer text-left"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-[#041632] text-white flex items-center justify-center text-[13px] font-bold shrink-0">
                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#041632] text-[14px] font-bold truncate">{emp.name}</p>
                    <p className="text-[#75777e] text-[12px] truncate">{emp.role} · {emp.department}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] font-mono text-[#adb0b7]">{emp.id}</span>
                    <span className="material-symbols-outlined notranslate text-[#c5c6ce] text-[18px]" translate="no">chevron_right</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <p className="text-[#75777e] text-[11px] text-center leading-relaxed">
            Tu dispositivo quedará vinculado a tu nombre para próximas entradas.
            <br />El sistema te reconocerá automáticamente la siguiente vez.
          </p>
        </div>
      )}

      {/* ══════════════════════ PASO 2: Info + Foto ══════════════════════ */}
      {step === 'confirm' && employee && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 py-6">

          {/* ── Tarjeta de empleado ── */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
              {/* Cabecera de la tarjeta */}
              <div className="bg-[#041632] px-5 py-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1b2b48] border-2 border-[#fc820c]/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined notranslate text-[#b7c8e1] text-[32px]"
                    translate="no"
                    style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div>
                  <p className="text-white text-[18px] font-bold leading-tight">{employee.name}</p>
                  <p className="text-[#b7c8e1] text-[13px] mt-0.5">{employee.role}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-[#15803d]/20 border border-[#15803d]/30 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                  <span className="text-[#4ade80] text-[11px] font-semibold">{employee.status}</span>
                </div>
              </div>

              {/* Campos de info */}
              <div className="p-5 grid grid-cols-2 gap-4">
                <InfoField label="ID Empleado" value={employee.id} icon="badge" mono />
                <InfoField label="Planta"      value={employee.plant}      icon="factory" />
                <InfoField label="Turno"       value={employee.shift}      icon="schedule" />
                <InfoField label="Área"        value={employee.department} icon="domain" />
              </div>

              {/* Hora de registro */}
              <div className="px-5 pb-5">
                <div className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined notranslate text-[#fc820c] text-[20px]" translate="no">schedule</span>
                  <div>
                    <p className="text-[#75777e] text-[11px] uppercase font-semibold tracking-wide">Hora de entrada</p>
                    <p className="text-[#041632] text-[16px] font-bold font-mono">
                      {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR registrado — confirmación visual */}
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined notranslate text-[#15803d] text-[20px]"
                  translate="no"
                  style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <p className="text-[#041632] text-[13px] font-bold">QR verificado correctamente</p>
                <p className="text-[#75777e] text-[12px]">Credencial · {employee.id} · Acceso autorizado</p>
              </div>
            </div>
          </div>

          {/* ── Foto del empleado ── */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-[#e0e3e5] flex items-center gap-2">
                <span className="material-symbols-outlined notranslate text-[#041632] text-[20px]" translate="no">photo_camera</span>
                <h2 className="text-[#041632] text-[15px] font-bold">Verificación fotográfica</h2>
                {photo && (
                  <span className="ml-auto text-[#15803d] text-[11px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined notranslate text-[14px]"
                      translate="no"
                      style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Foto capturada
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Área de cámara / foto */}
                <div className="relative bg-[#191c1e] rounded-xl overflow-hidden flex items-center justify-center"
                     style={{ minHeight: '260px' }}>

                  {photo ? (
                    // Muestra la foto capturada
                    <img src={photo} alt="Foto verificación" className="w-full h-full object-cover" />
                  ) : cameraError ? (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <span className="material-symbols-outlined notranslate text-[#fc820c] text-[36px]" translate="no">videocam_off</span>
                      <p className="text-white text-[12px]">{cameraError}</p>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Guía de encuadre */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-36 h-44 rounded-full border-2 border-white/40 border-dashed" />
                      </div>
                    </>
                  )}
                </div>

                {/* Botones de cámara */}
                {photo ? (
                  <button
                    onClick={retakePhoto}
                    className="w-full h-[44px] border border-[#c5c6ce] bg-white hover:bg-[#f2f4f6] text-[#041632] text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined notranslate text-[18px]" translate="no">replay</span>
                    Tomar de nuevo
                  </button>
                ) : (
                  <button
                    onClick={capturePhoto}
                    disabled={!!cameraError}
                    className="w-full h-[46px] bg-[#041632] hover:bg-[#1b2b48] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined notranslate text-[18px]" translate="no">camera</span>
                    Capturar foto
                  </button>
                )}

                <p className="text-center text-[#75777e] text-[12px]">
                  Asegúrate de que el rostro sea claramente visible. Se permiten cascos.
                </p>
              </div>
            </div>

            {/* Botón de registro final */}
            <button
              onClick={handleRegister}
              disabled={!photo || isRegistering}
              className="w-full h-[52px] bg-[#15803d] hover:bg-[#166534] disabled:bg-[#c5c6ce] disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-md"
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Registrando entrada...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined notranslate text-[20px]"
                    translate="no"
                    style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                  {photo ? 'Confirmar y registrar entrada' : 'Toma la foto para continuar'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Canvas oculto para capturar frames */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Estilos de animación de línea de escaneo */}
      <style>{`
        @keyframes scan {
          0%   { top: 8px;  opacity: 1; }
          50%  { top: calc(100% - 8px); opacity: 0.8; }
          100% { top: 8px;  opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────────----

function StepDot({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
        done   ? 'bg-[#15803d] text-white' :
        active ? 'bg-[#041632] text-white' :
                 'bg-[#e0e3e5] text-[#75777e]'
      }`}>
        {done ? <span className="material-symbols-outlined notranslate text-[14px]" translate="no">check</span> : n}
      </div>
      <span className={`text-[12px] font-medium hidden sm:inline ${active ? 'text-[#041632]' : 'text-[#75777e]'}`}>
        {label}
      </span>
    </div>
  )
}

function InfoField({ label, value, icon, mono = false }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[#75777e]">
        <span className="material-symbols-outlined notranslate text-[14px]" translate="no">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-[#041632] text-[14px] font-semibold ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}