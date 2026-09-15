import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { createQRSession } from '../services/qrSessionService'
import { sendQRGeneratedEmail, isEmailConfigured, getEmailConfig } from '../services/emailService'

/** Trae el catálogo real de empleados (con su planta asignada) desde el backend. */
async function fetchEmployees() {
  const res = await fetch('/api/empleados', { credentials: 'include' })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'No se pudo cargar la lista de empleados')
  }
  return json.data
}

/** Calcula la diferencia entre dos strings HH:MM. Devuelve texto legible. */
function calcDuration(start, end) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null

  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60  // cruza medianoche
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

export default function QRGenerate() {
  const navigate = useNavigate()

  // ── Estado de configuración ──────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState([])
  const [startTime,   setStartTime]   = useState('07:00')
  const [endTime,     setEndTime]     = useState('15:00')
  const [date,        setDate]        = useState(() => new Date().toISOString().slice(0, 10))
  const [search,      setSearch]      = useState('')
  const [plantFilter, setPlantFilter] = useState('Todas')

  // ── Estado del catálogo de empleados (real, desde el backend) ───────────
  const [employees,        setEmployees]        = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [employeesError,   setEmployeesError]   = useState('')

  // ── Estado del QR generado ───────────────────────────────────────────────
  const [session,    setSession]   = useState(null)
  const [qrDataUrl,  setQrDataUrl] = useState('')
  const [generating, setGenerating]= useState(false)
  const [copied,     setCopied]    = useState(false)

  // ── Estado del envío de correo ───────────────────────────────────────────
  const [emailStatus, setEmailStatus] = useState('')
  const [emailError,  setEmailError]  = useState('')

  // ── Carga del catálogo real de empleados ────────────────────────────────
  useEffect(() => {
    let isMounted = true

    async function loadEmployees() {
      setLoadingEmployees(true)
      setEmployeesError('')
      try {
        const data = await fetchEmployees()
        if (isMounted) setEmployees(data)
      } catch (err) {
        if (isMounted) setEmployeesError(err.message)
      } finally {
        if (isMounted) setLoadingEmployees(false)
      }
    }

    loadEmployees()
    return () => { isMounted = false }
  }, [])

  // ── Plantas disponibles derivadas de los empleados ──────────────────────
  const PLANTS = useMemo(() => {
    const unique = [...new Set(employees.map(e => e.plant).filter(Boolean))].sort()
    return ['Todas', ...unique]
  }, [employees])

  // ── Filtrado de empleados ────────────────────────────────────────────────
  const filtered = employees.filter(e => {
    const matchPlant  = plantFilter === 'Todas' || e.plant === plantFilter
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())   ||
      e.role.toLowerCase().includes(search.toLowerCase())
    return matchPlant && matchSearch
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every(e => selectedIds.includes(e.id))

  function toggleEmployee(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filtered.map(e => e.id).includes(id)))
    } else {
      const ids = filtered.map(e => e.id)
      setSelectedIds(prev => [...new Set([...prev, ...ids])])
    }
  }

  // ── Generar QR ───────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (selectedIds.length === 0 || !startTime || !endTime) return
    setGenerating(true)

    const newSession = createQRSession({
      employeeIds: selectedIds,
      date,
      shift: `${startTime} – ${endTime}`,
    })

    const checkInUrl = `${window.location.origin}/checkin?session=${newSession.token}`

    try {
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width:              340,
        margin:             2,
        color: { dark: '#041632', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
      const fullSession = { ...newSession, url: checkInUrl }
      setQrDataUrl(dataUrl)
      setSession(fullSession)

      // ── Enviar correo automáticamente ──────────────────────────────────
      const emailCfg = getEmailConfig()
      if (emailCfg.notifications?.onQRGenerated === false || !isEmailConfigured()) {
        setEmailStatus('skip')
      } else {
        setEmailStatus('sending')
        const selectedEmployees = employees.filter(e => selectedIds.includes(e.id))
        sendQRGeneratedEmail({ session: fullSession, employees: selectedEmployees, qrDataUrl: dataUrl })
          .then(() => { setEmailStatus('sent'); setTimeout(() => setEmailStatus(''), 6000) })
          .catch(err => {
            setEmailStatus('error')
            setEmailError(err?.text ?? err?.message ?? 'Error al enviar')
            setTimeout(() => setEmailStatus(''), 8000)
          })
      }
    } catch (err) {
      console.error('[QRGenerate] Error generando QR:', err)
    } finally {
      setGenerating(false)
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return
    const a  = document.createElement('a')
    a.href    = qrDataUrl
    a.download = `QR_${session?.shift?.replace(/\s/g,'_')}_${session?.date}.png`
    a.click()
  }

  function handleCopyUrl() {
    if (!session?.url) return
    navigator.clipboard.writeText(session.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleNewQR() {
    setSession(null)
    setQrDataUrl('')
    setSelectedIds([])
  }

  const duration = calcDuration(startTime, endTime)

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#e0e3e5] px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[#041632] text-[13px] font-semibold hover:text-[#964900] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Dashboard
          </button>
          <div className="h-5 w-px bg-[#e0e3e5]" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#964900] text-[20px]">qr_code_2</span>
            <div>
              <p className="text-[#041632] text-[13px] font-bold leading-none">Generar Pase QR</p>
              <p className="text-[#75777e] text-[11px] mt-0.5">Plant Alpha-4 · Acceso de turno</p>
            </div>
          </div>
        </div>

        {session && (
          <button
            onClick={handleNewQR}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-1.5 border border-[#c5c6ce] rounded-lg bg-white hover:bg-[#f2f4f6] text-[#041632] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nuevo QR
          </button>
        )}
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 p-5 lg:p-6 max-w-[1200px] w-full mx-auto">

        {/* ══════════════ PANEL IZQUIERDO — Selección de empleados ══════════════ */}
        <div className={`flex flex-col gap-4 ${session ? 'lg:w-[480px]' : 'flex-1'}`}>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#041632] text-[17px] font-black">Empleados del turno</h2>
              <p className="text-[#75777e] text-[12px] mt-0.5">Selecciona quiénes entrarán a planta hoy</p>
            </div>
            {selectedIds.length > 0 && (
              <span className="flex items-center gap-1.5 bg-[#041632] text-white text-[12px] font-bold px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">group</span>
                {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-2.5">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[17px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 bg-white border border-[#c5c6ce] rounded-lg pl-8 pr-3 text-[13px] text-[#041632] placeholder-[#adb0b7] focus:outline-none focus:border-[#041632] transition-colors"
              />
            </div>

            <select
              value={plantFilter}
              onChange={e => setPlantFilter(e.target.value)}
              disabled={loadingEmployees || !!employeesError}
              className="h-9 bg-white border border-[#c5c6ce] rounded-lg px-3 text-[13px] text-[#041632] focus:outline-none focus:border-[#041632] cursor-pointer disabled:opacity-50"
            >
              {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Lista de empleados */}
          <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-[#e0e3e5] flex items-center gap-3 bg-[#f7f9fb]">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAll}
                disabled={loadingEmployees || !!employeesError || filtered.length === 0}
                className="w-4 h-4 rounded border-[#c5c6ce] accent-[#041632] cursor-pointer"
              />
              <span className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex-1">
                {allFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </span>
            </div>

            <div className="overflow-y-auto max-h-[420px]">
              {loadingEmployees ? (
                <div className="py-10 text-center text-[#75777e] text-[13px]">Cargando empleados...</div>
              ) : employeesError ? (
                <div className="py-10 text-center text-[#dc2626] text-[13px]">{employeesError}</div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-[#75777e] text-[13px]">Sin resultados</div>
              ) : (
                filtered.map(emp => {
                  const selected = selectedIds.includes(emp.id)
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-[#f2f4f6] cursor-pointer transition-colors ${selected ? 'bg-[#041632]/[0.04]' : 'hover:bg-[#f7f9fb]'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 rounded border-[#c5c6ce] accent-[#041632] cursor-pointer shrink-0"
                      />
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${selected ? 'bg-[#041632] text-white' : 'bg-[#e8eaed] text-[#44474d]'}`}>
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold truncate ${selected ? 'text-[#041632]' : 'text-[#1c1f22]'}`}>{emp.name}</p>
                        <p className="text-[11px] text-[#75777e] truncate">{emp.role} · {emp.plant}</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#adb0b7] shrink-0">{emp.id}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ══════════════ PANEL DERECHO — Configuración + QR ══════════════ */}
        <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
          {!session ? (
            <>
              <div>
                <h2 className="text-[#041632] text-[17px] font-black">Configurar turno</h2>
                <p className="text-[#75777e] text-[12px] mt-0.5">Define la fecha y turno del acceso</p>
              </div>

              {/* Fecha */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm p-5 flex flex-col gap-3">
                <label className="flex items-center gap-2 text-[#041632] text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Fecha de acceso
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="h-10 border border-[#c5c6ce] rounded-lg px-3 text-[14px] text-[#041632] focus:outline-none focus:border-[#041632] bg-[#f7f9fb] cursor-pointer"
                />
              </div>

              {/* Horario */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                <p className="text-[#041632] text-[13px] font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  Horario de turno
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#75777e] block mb-1">Entrada</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full h-9 border border-[#c5c6ce] rounded-lg px-3 text-[13px] text-[#041632] bg-[#f7f9fb]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#75777e] block mb-1">Salida</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full h-9 border border-[#c5c6ce] rounded-lg px-3 text-[13px] text-[#041632] bg-[#f7f9fb]"
                    />
                  </div>
                </div>
                {duration && (
                  <p className="text-[11px] text-[#75777e] bg-[#f2f4f6] px-3 py-1.5 rounded-lg">
                    Duración estimada: <strong className="text-[#041632]">{duration}</strong>
                  </p>
                )}
              </div>

              {/* Botón Generar */}
              <button
                onClick={handleGenerate}
                disabled={selectedIds.length === 0 || generating}
                className="w-full h-11 bg-[#041632] text-white rounded-xl text-[13px] font-bold hover:bg-[#1b2b48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {generating ? 'Generando...' : `Generar Código QR (${selectedIds.length})`}
              </button>
            </>
          ) : (
            /* ── Vista del QR Generado ── */
            <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm p-5 flex flex-col items-center text-center gap-4">
              <h3 className="text-[#041632] text-[15px] font-bold">¡Pase QR Generado!</h3>
              {qrDataUrl && <img src={qrDataUrl} alt="Código QR" className="w-56 h-56 object-contain border p-2 rounded-xl" />}
              <div className="flex gap-2 w-full">
                <button onClick={handleDownload} className="flex-1 bg-[#041632] text-white py-2 rounded-lg text-[12px] font-bold">Descargar</button>
                <button onClick={handleCopyUrl} className="flex-1 border py-2 rounded-lg text-[12px] font-bold">{copied ? '¡Copiado!' : 'Copiar Link'}</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}