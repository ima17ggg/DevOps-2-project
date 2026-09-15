import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { stopTrackingSession } from '../services/locationService'

// Datos del empleado simulados — reemplazar con respuesta real del API al decodificar QR
const MOCK_EMPLOYEE = {
  id: 'OP-4921',
  name: 'Marcus Johnson',
  role: 'Operador de Maquinaria Pesada',
  plant: 'Alpha-4',
  shift: 'Mañana · 07:00 – 15:00',
  department: 'Producción',
  checkInTime: '07:03',
}

const ACTIVITY_TAGS = [
  { id: 'mant_prev',  label: 'Mantenimiento preventivo',  icon: 'build' },
  { id: 'mant_corr',  label: 'Mantenimiento correctivo',  icon: 'construction' },
  { id: 'operacion',  label: 'Operación de maquinaria',   icon: 'precision_manufacturing' },
  { id: 'inspeccion', label: 'Inspección de seguridad',   icon: 'fact_check' },
  { id: 'carga',      label: 'Carga y descarga',           icon: 'local_shipping' },
  { id: 'limpieza',   label: 'Limpieza y orden',           icon: 'cleaning_services' },
]

// ────────────────────────────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()

  // Pasos: 'qr' → 'report' → 'done'
  const [step, setStep]               = useState('qr')
  const [employee, setEmployee]       = useState(null)
  const [photo, setPhoto]             = useState(null)
  const [selectedTags, setSelectedTags]   = useState([])
  const [description, setDescription]    = useState('')
  const [cameraError, setCameraError]    = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [checkoutTime, setCheckoutTime]   = useState('')

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
    if (step === 'qr')     startCamera('environment')
    if (step === 'report') startCamera('user')
    return () => stopCamera()
  }, [step]) // eslint-disable-line

  // ── Acciones ─────────────────────────────────────────────────────────────────

  const handleQrDetected = () => {
    stopCamera()
    setEmployee(MOCK_EMPLOYEE)
    setStep('report')
  }

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

  const toggleTag = (id) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )

  const canSubmit = photo && (description.trim().length >= 10 || selectedTags.length > 0)

  const handleFinish = () => {
    if (!canSubmit) return
    setIsRegistering(true)
    const time = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    // ── Reemplazar con llamada real al API ────────────────────────────────────
    // await fetch('/api/checkout', { method:'POST', body: JSON.stringify({
    //   employeeId: employee.id, photo, activities: selectedTags, description
    // })})
    // ─────────────────────────────────────────────────────────────────────────
    setTimeout(() => {
      setCheckoutTime(time)
      stopCamera()
      stopTrackingSession()  // ── Detiene el GPS y elimina al empleado del mapa
      setIsRegistering(false)
      setStep('done')
    }, 1400)
  }

  // ── Pantalla de éxito ────────────────────────────────────────────────────────
  if (step === 'done') {
    const tagLabels = ACTIVITY_TAGS
      .filter((t) => selectedTags.includes(t.id))
      .map((t) => t.label)

    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center gap-5 px-6 py-10">
        <div className="w-20 h-20 rounded-full bg-[#fff7ed] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#964900] text-[44px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            exit_to_app
          </span>
        </div>

        <div className="text-center">
          <h2 className="text-[#041632] text-[26px] font-black">¡Turno finalizado!</h2>
          <p className="text-[#44474d] text-[15px] mt-1">{employee?.name}</p>
        </div>

        {/* Tarjeta resumen */}
        <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm w-full max-w-md overflow-hidden">
          <div className="bg-[#041632] px-5 py-4 flex items-center justify-between">
            <span className="text-white text-[13px] font-semibold">Resumen de salida</span>
            <span className="text-[#b7c8e1] text-[12px]">{employee?.plant}</span>
          </div>
          <div className="p-5 flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-3">
              <SummaryField label="Entrada" value={employee?.checkInTime} icon="login" />
              <SummaryField label="Salida"  value={checkoutTime}         icon="logout" accent />
            </div>

            <div className="h-px bg-[#f0f0f0]" />

            {tagLabels.length > 0 && (
              <div>
                <p className="text-[#75777e] text-[11px] uppercase font-semibold tracking-wide mb-2">
                  Actividades registradas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tagLabels.map((label) => (
                    <span key={label}
                      className="bg-[#f2f4f6] text-[#041632] text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#e0e3e5]">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {description.trim() && (
              <div>
                <p className="text-[#75777e] text-[11px] uppercase font-semibold tracking-wide mb-1">
                  Notas adicionales
                </p>
                <p className="text-[#191c1e] text-[13px] leading-relaxed">{description}</p>
              </div>
            )}

            {photo && (
              <div className="flex items-center gap-3">
                <img src={photo} alt="Foto de salida"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#e0e3e5]" />
                <div>
                  <p className="text-[#041632] text-[13px] font-semibold">Foto de salida capturada</p>
                  <p className="text-[#75777e] text-[11px]">Verificación biométrica completada</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/chekin')}
          className="h-12 px-8 bg-[#041632] hover:bg-[#1b2b48] text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer shadow-md"
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
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Regresar
          </button>
          <div className="h-5 w-px bg-[#e0e3e5]" />
          <div>
            <p className="text-[#041632] text-[13px] font-bold leading-none">Finalizar Turno</p>
            <p className="text-[#75777e] text-[11px] mt-0.5">Plant Alpha-4</p>
          </div>
        </div>

        {/* Paso indicator */}
        <div className="flex items-center gap-2">
          <StepDot n={1} label="Escanear QR"     active={step === 'qr'}     done={step === 'report'} />
          <div className="w-8 h-px bg-[#c5c6ce]" />
          <StepDot n={2} label="Reporte y foto"  active={step === 'report'} done={false} />
        </div>
      </header>

      {/* ══════════════════ PASO 1: Escanear QR ══════════════════════ */}
      {step === 'qr' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6">
          <div className="text-center">
            <h1 className="text-[#041632] text-[26px] font-black tracking-tight">
              Escanea tu código QR
            </h1>
            <p className="text-[#44474d] text-[14px] mt-1.5">
              Apunta la cámara hacia el código QR de tu credencial para iniciar el checkout.
            </p>
          </div>

          {/* Visor de cámara */}
          <div className="relative w-full max-w-[480px] bg-[#191c1e] rounded-2xl overflow-hidden shadow-xl"
               style={{ aspectRatio: '4/3' }}>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="material-symbols-outlined text-[#fc820c] text-[40px]">videocam_off</span>
                <p className="text-white text-[13px]">{cameraError}</p>
                <button onClick={() => startCamera('environment')}
                  className="px-4 py-2 bg-[#964900] text-white text-[12px] font-semibold rounded-lg cursor-pointer hover:bg-[#7d3d00] transition-colors">
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {/* Marco de QR */}
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
                    <div className="absolute left-2 right-2" style={{ animation: 'scan 2s ease-in-out infinite' }} />
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none"
                     style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.45)' }} />
              </>
            )}
          </div>

          <button
            onClick={handleQrDetected}
            disabled={!!cameraError}
            className="h-[50px] px-10 bg-[#964900] hover:bg-[#7d3d00] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            QR Detectado — Continuar
          </button>
          <p className="text-[#75777e] text-[12px]">
            El sistema detectará el QR automáticamente al integrarse con el API.
          </p>
        </div>
      )}

      {/* ══════════════════ PASO 2: Reporte + Foto ══════════════════ */}
      {step === 'report' && employee && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 py-6">

          {/* ── Columna izquierda: empleado + actividades ── */}
          <div className="flex flex-col gap-4">

            {/* Tarjeta del empleado */}
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-[#041632] px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1b2b48] border-2 border-[#fc820c]/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#b7c8e1] text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[16px] font-bold leading-tight truncate">{employee.name}</p>
                  <p className="text-[#b7c8e1] text-[12px] mt-0.5">{employee.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#b7c8e1] text-[10px] uppercase font-semibold">Entrada</p>
                  <p className="text-white text-[15px] font-bold font-mono">{employee.checkInTime}</p>
                </div>
              </div>
              <div className="px-5 py-3 flex gap-6 bg-[#f7f9fb] border-t border-[#e0e3e5]">
                <InfoChip icon="badge"    value={employee.id}         />
                <InfoChip icon="factory"  value={employee.plant}      />
                <InfoChip icon="domain"   value={employee.department} />
              </div>
            </div>

            {/* Actividades realizadas */}
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e0e3e5]">
                <h2 className="text-[#041632] text-[15px] font-bold">
                  ¿Qué trabajos se realizaron en planta?
                </h2>
                <p className="text-[#75777e] text-[12px] mt-0.5">
                  Selecciona las actividades y/o agrega una descripción.
                </p>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Tags de actividades */}
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12px] font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#041632] text-white border-[#041632]'
                            : 'bg-white text-[#041632] border-[#c5c6ce] hover:border-[#041632]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">{tag.icon}</span>
                        {tag.label}
                      </button>
                    )
                  })}
                </div>

                {/* Descripción libre */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="desc" className="text-[#041632] text-[12px] font-semibold">
                    Notas adicionales
                    <span className="text-[#75777e] font-normal ml-1">(opcional si ya seleccionaste actividades)</span>
                  </label>
                  <textarea
                    id="desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe brevemente las actividades realizadas, condiciones especiales, incidencias menores, equipo utilizado..."
                    className="w-full bg-[#f7f9fb] border border-[#c5c6ce] rounded-xl px-4 py-3 text-[13px] text-[#191c1e] placeholder-[#adb0b7] outline-none resize-none transition-all focus:border-[#041632] focus:ring-2 focus:ring-[#041632]/10"
                  />
                  <p className={`text-[11px] text-right transition-colors ${
                    description.length > 0 && description.trim().length < 10
                      ? 'text-[#ba1a1a]'
                      : 'text-[#75777e]'
                  }`}>
                    {description.length} caracteres
                    {description.length > 0 && description.trim().length < 10 && ' · mínimo 10'}
                  </p>
                </div>

                {/* Indicador de validación */}
                {!canSubmit && (selectedTags.length > 0 || description.length > 0) && !photo && (
                  <p className="text-[#964900] text-[12px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Falta capturar la foto de salida →
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Columna derecha: foto de salida ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-[#e0e3e5] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#041632] text-[20px]">photo_camera</span>
                <h2 className="text-[#041632] text-[15px] font-bold">Foto de salida</h2>
                {photo && (
                  <span className="ml-auto text-[#15803d] text-[11px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Capturada
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Vista de cámara o foto */}
                <div className="relative bg-[#191c1e] rounded-xl overflow-hidden flex items-center justify-center"
                     style={{ minHeight: '260px' }}>
                  {photo ? (
                    <img src={photo} alt="Foto de salida" className="w-full h-full object-cover" />
                  ) : cameraError ? (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <span className="material-symbols-outlined text-[#fc820c] text-[36px]">videocam_off</span>
                      <p className="text-white text-[12px]">{cameraError}</p>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-36 h-44 rounded-full border-2 border-white/40 border-dashed" />
                      </div>
                    </>
                  )}
                </div>

                {photo ? (
                  <button onClick={retakePhoto}
                    className="w-full h-[44px] border border-[#c5c6ce] bg-white hover:bg-[#f2f4f6] text-[#041632] text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    Tomar de nuevo
                  </button>
                ) : (
                  <button onClick={capturePhoto} disabled={!!cameraError}
                    className="w-full h-[46px] bg-[#041632] hover:bg-[#1b2b48] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">camera</span>
                    Capturar foto de salida
                  </button>
                )}

                <p className="text-center text-[#75777e] text-[12px]">
                  Foto requerida para completar el registro de salida.
                </p>
              </div>
            </div>

            {/* Hora actual */}
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm px-5 py-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#964900] text-[22px]">schedule</span>
              <div>
                <p className="text-[#75777e] text-[11px] uppercase font-semibold tracking-wide">Hora de salida</p>
                <LiveClock />
              </div>
            </div>

            {/* Botón de finalizar */}
            <button
              onClick={handleFinish}
              disabled={!canSubmit || isRegistering}
              className="w-full h-[52px] bg-[#964900] hover:bg-[#7d3d00] disabled:bg-[#c5c6ce] disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-md"
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Registrando salida...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>exit_to_app</span>
                  {canSubmit ? 'Finalizar y registrar salida' : 'Completa actividades y foto'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function StepDot({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
        done   ? 'bg-[#15803d] text-white' :
        active ? 'bg-[#964900] text-white' :
                 'bg-[#e0e3e5] text-[#75777e]'
      }`}>
        {done ? <span className="material-symbols-outlined text-[14px]">check</span> : n}
      </div>
      <span className={`text-[12px] font-medium hidden sm:inline ${active ? 'text-[#041632]' : 'text-[#75777e]'}`}>
        {label}
      </span>
    </div>
  )
}

function InfoChip({ icon, value }) {
  return (
    <div className="flex items-center gap-1 text-[#44474d] text-[12px]">
      <span className="material-symbols-outlined text-[14px] text-[#75777e]">{icon}</span>
      {value}
    </div>
  )
}

function SummaryField({ label, value, icon, accent = false }) {
  return (
    <div className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1 text-[#75777e] mb-0.5">
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
        <span className="text-[10px] uppercase font-semibold tracking-wide">{label}</span>
      </div>
      <p className={`font-mono text-[16px] font-bold ${accent ? 'text-[#964900]' : 'text-[#041632]'}`}>{value}</p>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return <p className="text-[#041632] text-[18px] font-bold font-mono">{time}</p>
}
