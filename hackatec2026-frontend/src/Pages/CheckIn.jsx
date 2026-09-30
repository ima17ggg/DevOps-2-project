import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { startTrackingSession } from '../services/locationService'
import { recordCheckIn } from '../services/checkInActivityService'

// ────────────────────────────────────────────────────────────────────────────────
// Flujo: 'qr' (escanear con jsQR) → 'confirm' (datos + foto) → 'done'
// ────────────────────────────────────────────────────────────────────────────────

/** Reduce la foto a un thumbnail chico para no reventar el límite de localStorage */
function makeThumbnail(dataUrl, maxSize = 160) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width  = Math.max(1, Math.round(img.width  * ratio))
      c.height = Math.max(1, Math.round(img.height * ratio))
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

export default function CheckIn() {
  const navigate = useNavigate()

  const [step, setStep]                   = useState('qr')
  const [employee, setEmployee]           = useState(null)
  const [qrCode, setQrCode]               = useState(null)     // código crudo leído del QR
  const [photo, setPhoto]                 = useState(null)
  const [cameraError, setCameraError]     = useState('')       // permisos / hardware
  const [scanError, setScanError]         = useState('')       // QR inválido / expirado / red
  const [registerError, setRegisterError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [result, setResult]               = useState(null)     // { tipo, asistencia, horas_trabajadas? }
  const [now, setNow]                     = useState(() => new Date())

  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const scanCanvasRef = useRef(null)
  const streamRef     = useRef(null)
  const camReqRef     = useRef(0)                              // descarta getUserMedia obsoletos
  const busyRef       = useRef(false)                          // hay una validación en curso
  const lastCodeRef   = useRef({ code: null, at: 0 })          // cooldown del mismo QR

  // ── Cámara ──────────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async (facingMode = 'environment') => {
    const reqId = ++camReqRef.current
    setCameraError('')
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      // Si mientras esperábamos cambió el paso / se desmontó, soltamos este stream
      if (reqId !== camReqRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch {
      if (reqId === camReqRef.current) {
        setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
      }
    }
  }, [stopCamera])

  // Cámara trasera para escanear, frontal para la foto
  useEffect(() => {
    if (step === 'qr')      startCamera('environment')
    if (step === 'confirm') startCamera('user')
    return () => {
      camReqRef.current++
      stopCamera()
    }
  }, [step, startCamera, stopCamera])

  // Reloj en vivo en el paso de confirmación
  useEffect(() => {
    if (step !== 'confirm') return
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [step])

  // ── Validación del QR contra el API ─────────────────────────────────────────
  const handleQrDetected = useCallback(async (qrData) => {
    try {
      const res  = await fetch(`/api/checkin/scan/${encodeURIComponent(qrData)}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        // 404 → no reconocido, 410 → expirado; el backend manda el mensaje
        setScanError(json.error ?? 'QR no reconocido. Intenta de nuevo.')
        return
      }
      setScanError('')
      setQrCode(qrData)
      setPhoto(null)
      setEmployee({ ...json.data, status: 'Activo' })
      setStep('confirm')
    } catch {
      setScanError('No se pudo validar el QR. Revisa tu conexión.')
    } finally {
      busyRef.current = false
    }
  }, [])

  // ── Loop de escaneo con jsQR ────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'qr') return

    const canvas = scanCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    let raf = 0
    let last = 0
    let stopped = false

    const tick = (t) => {
      if (stopped) return
      raf = requestAnimationFrame(tick)

      const video = videoRef.current
      if (busyRef.current) return
      if (!video || !video.videoWidth || !video.videoHeight) return
      if (t - last < 150) return                      // ~6 fps es suficiente
      last = t

      // Procesamos a ≤640px de ancho: más rápido y menos calor en el celular
      const scale = Math.min(1, 640 / video.videoWidth)
      canvas.width  = Math.round(video.videoWidth  * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const img  = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
      if (!code?.data) return

      // Evita bombardear el API si la cámara sigue apuntando al mismo QR fallido
      const prev = lastCodeRef.current
      if (code.data === prev.code && t - prev.at < 3000) return
      lastCodeRef.current = { code: code.data, at: t }

      busyRef.current = true
      handleQrDetected(code.data)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [step, handleQrDetected])

  // ── Foto ────────────────────────────────────────────────────────────────────
  const capturePhoto = () => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.85))
    stopCamera()
  }

  const retakePhoto = () => {
    setPhoto(null)
    startCamera('user')
  }

  // ── Registro real contra el API ─────────────────────────────────────────────
  const handleRegister = async () => {
    if (!photo || isRegistering || !employee) return
    setIsRegistering(true)
    setRegisterError('')
    try {
      const res = await fetch('/api/checkin/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empleado: employee.id_empleado,
          qr_code: qrCode, // el backend debería revalidarlo (ver notas)
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        setRegisterError(json.error ?? 'No se pudo registrar. Intenta de nuevo.')
        return
      }

      const data = json.data // { tipo: 'entrada' | 'salida', asistencia, horas_trabajadas? }

      // Rastreo GPS solo al entrar
      if (data.tipo === 'entrada') {
        startTrackingSession({ id: employee.id_empleado, name: employee.name, role: employee.role })
      }

      // Guardar en actividad reciente sin que un error de storage rompa el flujo
      try {
        const thumb = await makeThumbnail(photo)
        recordCheckIn(employee, thumb)
      } catch (e) {
        console.warn('No se pudo guardar la actividad reciente:', e)
      }

      setResult(data)
      setStep('done')
    } catch {
      setRegisterError('Sin conexión con el servidor. Intenta de nuevo.')
    } finally {
      setIsRegistering(false)
    }
  }

  // ── Pantalla final ───────────────────────────────────────────────────────────
  if (step === 'done') {
    const isExit = result?.tipo === 'salida'
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
          <h2 className="text-[#041632] text-[26px] font-black">
            {isExit ? '¡Salida registrada!' : '¡Entrada registrada!'}
          </h2>
          <p className="text-[#44474d] text-[15px] mt-2">
            {employee?.name}{employee?.shift ? ` — ${employee.shift}` : ''}
          </p>
          <p className="text-[#75777e] text-[13px] mt-1">
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {isExit && typeof result?.horas_trabajadas === 'number' && (
            <p className="text-[#041632] text-[14px] font-semibold mt-3">
              Horas trabajadas hoy: {result.horas_trabajadas} h
            </p>
          )}
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

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2">
          <StepDot n={1} label="Escanear QR" active={step === 'qr'} done={step === 'confirm'} />
          <div className="w-8 h-px bg-[#c5c6ce]" />
          <StepDot n={2} label="Verificar y Registrar" active={step === 'confirm'} done={false} />
        </div>
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

          {/* Visor de cámara: el <video> SIEMPRE montado; los errores van como overlay */}
          <div className="relative w-full max-w-[480px] bg-[#191c1e] rounded-2xl overflow-hidden shadow-xl"
               style={{ aspectRatio: '4/3' }}>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {!cameraError && (
              <>
                {/* Marco de QR con esquinas */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-52 h-52">
                    {[
                      'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                      'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                      'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                      'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-9 h-9 border-[#fc820c] ${cls}`} />
                    ))}
                    {/* Línea de escaneo animada */}
                    <div className="absolute left-2 right-2 top-0 h-0.5 bg-[#fc820c]/80"
                         style={{ animation: 'scan 2s ease-in-out infinite' }} />
                  </div>
                </div>
                {/* Oscurecido fuera del marco */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.45)' }} />
              </>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-[#191c1e] flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="material-symbols-outlined notranslate text-[#fc820c] text-[40px]" translate="no">videocam_off</span>
                <p className="text-white text-[13px]">{cameraError}</p>
                <button
                  onClick={() => startCamera('environment')}
                  className="mt-1 px-4 py-2 bg-[#964900] text-white text-[12px] font-semibold rounded-lg cursor-pointer hover:bg-[#7d3d00] transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>

          {/* Error de validación del QR (expirado / no reconocido / red) */}
          {scanError && (
            <div className="w-full max-w-[480px] flex items-start gap-2.5 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded-xl px-4 py-3">
              <span className="material-symbols-outlined notranslate text-[18px] mt-px" translate="no">error</span>
              <p className="text-[13px] font-medium">{scanError}</p>
            </div>
          )}

          <p className="text-[#75777e] text-[12px] text-center">
            El código se detecta automáticamente; no necesitas presionar nada.
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

              {/* Campos de info (el API hoy no manda turno ni área → se muestra "—") */}
              <div className="p-5 grid grid-cols-2 gap-4">
                <InfoField label="ID Empleado" value={employee.id}                 icon="badge" mono />
                <InfoField label="Planta"      value={employee.plant  || '—'}      icon="factory" />
                <InfoField label="Turno"       value={employee.shift  || '—'}      icon="schedule" />
                <InfoField label="Área"        value={employee.department || '—'}  icon="domain" />
              </div>

              {/* Hora de registro */}
              <div className="px-5 pb-5">
                <div className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined notranslate text-[#fc820c] text-[20px]" translate="no">schedule</span>
                  <div>
                    <p className="text-[#75777e] text-[11px] uppercase font-semibold tracking-wide">Hora de registro</p>
                    <p className="text-[#041632] text-[16px] font-bold font-mono">
                      {now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
                {/* Área de cámara / foto: el <video> siempre montado (oculto si ya hay foto) */}
                <div className="relative bg-[#191c1e] rounded-xl overflow-hidden flex items-center justify-center"
                     style={{ minHeight: '260px' }}>

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${photo ? 'hidden' : ''}`}
                  />

                  {photo && (
                    <img src={photo} alt="Foto verificación" className="w-full h-full object-cover" />
                  )}

                  {!photo && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-36 h-44 rounded-full border-2 border-white/40 border-dashed" />
                    </div>
                  )}

                  {!photo && cameraError && (
                    <div className="absolute inset-0 bg-[#191c1e] flex flex-col items-center justify-center gap-2 p-6 text-center">
                      <span className="material-symbols-outlined notranslate text-[#fc820c] text-[36px]" translate="no">videocam_off</span>
                      <p className="text-white text-[12px]">{cameraError}</p>
                      <button
                        onClick={() => startCamera('user')}
                        className="mt-1 px-4 py-2 bg-[#964900] text-white text-[12px] font-semibold rounded-lg cursor-pointer hover:bg-[#7d3d00] transition-colors"
                      >
                        Reintentar
                      </button>
                    </div>
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

            {/* Error de registro */}
            {registerError && (
              <div className="flex items-start gap-2.5 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] rounded-xl px-4 py-3">
                <span className="material-symbols-outlined notranslate text-[18px] mt-px" translate="no">error</span>
                <p className="text-[13px] font-medium">{registerError}</p>
              </div>
            )}

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
                  Registrando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined notranslate text-[20px]"
                    translate="no"
                    style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                  {photo ? 'Confirmar y registrar' : 'Toma la foto para continuar'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Canvas ocultos para capturar frames */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <canvas ref={scanCanvasRef} className="hidden" aria-hidden="true" />

      {/* Animación de la línea de escaneo */}
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

// ── Componentes auxiliares ─────────────────────────────────────────────────────

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