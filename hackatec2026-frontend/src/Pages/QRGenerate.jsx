<<<<<<< HEAD
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { ALL_EMPLOYEES, createQRSession } from '../services/qrSessionService'
import { sendQRGeneratedEmail, isEmailConfigured, getEmailConfig } from '../services/emailService'

const DEPARTMENTS = ['Todos', 'Producción', 'Mantenimiento', 'Seguridad', 'Calidad', 'Supervisión']

=======
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
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
function calcDuration(start, end) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
<<<<<<< HEAD
  
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null

  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60

  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

function formatDateFormatted(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
=======
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60   // cruza medianoche
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
}

export default function QRGenerate() {
  const navigate = useNavigate()

<<<<<<< HEAD
  // Form & Filter States
  const [selectedIds, setSelectedIds] = useState([])
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('15:00')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('Todos')

  // Results & Operations States
  const [generatedQRs, setGeneratedQRs] = useState([])
  const [generating, setGenerating] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Email Notification State
  const [emailStatus, setEmailStatus] = useState('') 
  const [emailError, setEmailError] = useState('')

  const timerRef = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000)
  }, [])

  // Optimized Filtered Employees
  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase()
    return ALL_EMPLOYEES.filter(e => {
      const matchDept = deptFilter === 'Todos' || e.department === deptFilter
      const matchSearch = !term || 
        e.name.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term) ||
        e.role.toLowerCase().includes(term)
      return matchDept && matchSearch
    })
  }, [search, deptFilter])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const allFilteredSelected = useMemo(() => {
    if (filteredEmployees.length === 0) return false
    return filteredEmployees.every(e => selectedSet.has(e.id))
  }, [filteredEmployees, selectedSet])

  // Selection Handlers
  const toggleEmployee = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  const toggleAllFiltered = useCallback(() => {
    const filteredIds = filteredEmployees.map(e => e.id)
    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])))
    }
  }, [allFilteredSelected, filteredEmployees])

  // Generate QR Sessions
  async function handleGenerate() {
    if (selectedIds.length === 0 || !startTime || !endTime) return
    setGenerating(true)
    setEmailStatus('')
    setEmailError('')

    try {
      const selectedEmployees = ALL_EMPLOYEES.filter(e => selectedSet.has(e.id))

      const qrResults = await Promise.all(
        selectedEmployees.map(async (emp) => {
          const newSession = createQRSession({
            employeeIds: [emp.id],
            date,
            shift: `${startTime} – ${endTime}`,
          })

          const checkInUrl = `${window.location.origin}/checkin?session=${newSession.token}&empId=${emp.id}`

          const dataUrl = await QRCode.toDataURL(checkInUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#041632', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          })

          return {
            employee: emp,
            session: { ...newSession, url: checkInUrl },
            qrDataUrl: dataUrl,
            formattedDate: formatDateFormatted(date)
          }
        })
      )

      setGeneratedQRs(qrResults)
      showToast(`¡Se generaron ${qrResults.length} pases con éxito!`)

      // Email Notification Trigger
      const emailCfg = getEmailConfig()
      if (emailCfg?.notifications?.onQRGenerated === false || !isEmailConfigured()) {
        setEmailStatus('skip')
      } else {
        setEmailStatus('sending')
        try {
          await sendQRGeneratedEmail({
            sessions: qrResults.map(r => r.session),
            employees: selectedEmployees,
            qrs: qrResults
          })
          setEmailStatus('sent')
          timerRef.current = setTimeout(() => setEmailStatus(''), 6000)
        } catch (err) {
          setEmailStatus('error')
          setEmailError(err?.text ?? err?.message ?? 'Error al enviar correo')
          timerRef.current = setTimeout(() => setEmailStatus(''), 8000)
        }
      }

    } catch (err) {
      console.error('[QRGenerate] Error generando QRs:', err)
      showToast('Ocurrió un error al generar los pases QR')
=======
  // ── Estado de configuración ──────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState([])
  const [startTime,   setStartTime]   = useState('07:00')
  const [endTime,     setEndTime]     = useState('15:00')
  const [date,        setDate]        = useState(() => new Date().toISOString().slice(0, 10))
  const [search,      setSearch]      = useState('')
  const [plantFilter, setPlantFilter] = useState('Todas')

  // ── Estado del catálogo de empleados (real, desde el backend) ───────────
  const [employees,        setEmployees]        = useState([])
  const [loadingEmployees, setLoadingEmployees]  = useState(true)
  const [employeesError,   setEmployeesError]    = useState('')

  // ── Estado del QR generado ───────────────────────────────────────────────
  const [session,    setSession]   = useState(null)   // sesión creada
  const [qrDataUrl,  setQrDataUrl] = useState('')     // img base64
  const [generating, setGenerating]= useState(false)
  const [copied,     setCopied]    = useState(false)

  // ── Estado del envío de correo ───────────────────────────────────────────
  const [emailStatus, setEmailStatus] = useState('')  // '' | 'sending' | 'sent' | 'error' | 'skip'
  const [emailError,  setEmailError]  = useState('')

  const qrImgRef = useRef(null)

  // ── Carga del catálogo real de empleados (reemplaza el mock) ────────────
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

  // ── Plantas disponibles, derivadas de los empleados cargados ────────────
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
        width:           340,
        margin:          2,
        color: { dark: '#041632', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
      const fullSession = { ...newSession, url: checkInUrl }
      setQrDataUrl(dataUrl)
      setSession(fullSession)

      // ── Enviar correo automáticamente ──────────────────────────────────
      const emailCfg = getEmailConfig()
      if (emailCfg.notifications?.onQRGenerated === false) {
        setEmailStatus('skip')
      } else if (!isEmailConfigured()) {
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
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
    } finally {
      setGenerating(false)
    }
  }

<<<<<<< HEAD
  // Utilities
  const handleDownload = useCallback((qrDataUrl, employeeId) => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `QR_${employeeId}_${date}.png`
    a.click()
    showToast(`Descargando QR del empleado ${employeeId}`)
  }, [date, showToast])

  const handleCopyUrl = useCallback((url) => {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      showToast('¡Enlace copiado al portapapeles!')
    })
  }, [showToast])

  const handleSendWhatsApp = useCallback((empName, sessionUrl) => {
    const message = encodeURIComponent(
      `Hola ${empName}, aquí está tu pase de acceso QR para la planta el día ${formatDateFormatted(date)} (${startTime} a ${endTime}):\n${sessionUrl}`
    )
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank')
  }, [date, startTime, endTime])

  const handlePrintAll = useCallback(() => {
    window.print()
  }, [])

  const handleNewQR = useCallback(() => {
    if (generatedQRs.length > 0) {
      const confirmReset = window.confirm('¿Deseas reiniciar la sesión? Se perderá la vista previa de los pases no guardados.')
      if (!confirmReset) return
    }
    setGeneratedQRs([])
    setSelectedIds([])
    setEmailStatus('')
  }, [generatedQRs])

  const duration = useMemo(() => calcDuration(startTime, endTime), [startTime, endTime])

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col font-sans relative">

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#041632] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold animate-fade-in border border-white/10 print:hidden">
          <span className="material-symbols-outlined text-[#38ef7d] text-[18px]">info</span>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e0e3e5] px-6 h-14 flex items-center justify-between shrink-0 shadow-sm print:hidden">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[#041632] text-[13px] font-semibold hover:text-[#964900] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">{'\uE5C4'}</span>
            Dashboard
          </button>
          <div className="h-5 w-px bg-[#e0e3e5] shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#041632] text-[20px]">{'\uE00A'}</span>
            <div className="min-w-0">
              <h1 className="text-[#041632] text-[13px] font-bold leading-none truncate">Generar Pase QR</h1>
              <p className="text-[#75777e] text-[11px] mt-0.5 truncate">Plant Alpha-4 · Acceso de turno</p>
=======
  function handleDownload() {
    if (!qrDataUrl) return
    const a   = document.createElement('a')
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

  // ────────────────────────────────────────────────────────────────────────
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
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {generatedQRs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintAll}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 bg-[#041632] text-white rounded-lg hover:bg-[#1b2b48] transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">{'\uE8AD'}</span>
              Imprimir Pases
            </button>
            <button
              type="button"
              onClick={handleNewQR}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 border border-[#c5c6ce] rounded-lg bg-white hover:bg-[#f2f4f6] text-[#041632] transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">{'\uE145'}</span>
              Nuevo
            </button>
          </div>
        )}
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col lg:flex-row gap-5 p-5 lg:p-6 max-w-[1200px] w-full mx-auto print:p-0 print:max-w-none">

        {/* Panel Izquierdo — Selección de Empleados */}
        <section className={`flex flex-col gap-4 print:hidden ${generatedQRs.length > 0 ? 'lg:w-[480px]' : 'flex-1'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#041632] text-[17px] font-black">Empleados del turno</h2>
              <p className="text-[#75777e] text-[12px] mt-0.5">Selecciona quiénes entrarán a planta hoy</p>
            </div>
            {selectedIds.length > 0 && (
              <span className="flex items-center gap-1.5 bg-[#041632] text-white text-[12px] font-bold px-3 py-1 rounded-full shrink-0">
                <span className="material-symbols-outlined text-[14px]">{'\uE7EF'}</span>
=======
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

          {/* Título del panel */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#041632] text-[17px] font-black">Empleados del turno</h2>
              <p className="text-[#75777e] text-[12px] mt-0.5">
                Selecciona quiénes entrarán a planta hoy
              </p>
            </div>
            {selectedIds.length > 0 && (
              <span className="flex items-center gap-1.5 bg-[#041632] text-white text-[12px] font-bold px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">group</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Filtros */}
<<<<<<< HEAD
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <div className="flex-1 min-w-[180px] relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[17px]">
                {'\uE8B6'}
=======
          <div className="flex gap-2.5">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#75777e] text-[17px]">
                search
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
              </span>
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 bg-white border border-[#c5c6ce] rounded-lg pl-8 pr-3 text-[13px] text-[#041632] placeholder-[#adb0b7] focus:outline-none focus:border-[#041632] transition-colors"
              />
            </div>
<<<<<<< HEAD
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="h-9 bg-white border border-[#c5c6ce] rounded-lg px-3 text-[13px] text-[#041632] focus:outline-none focus:border-[#041632] cursor-pointer"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Lista de Empleados */}
          <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-[#e0e3e5] flex items-center justify-between gap-3 bg-[#f7f9fb]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                  className="w-4 h-4 rounded border-[#c5c6ce] accent-[#041632] cursor-pointer shrink-0"
                />
                <label htmlFor="select-all" className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide cursor-pointer select-none">
                  {allFilteredSelected ? 'Deseleccionar filtro' : 'Seleccionar filtro'}
                </label>
              </div>

              {deptFilter !== 'Todos' && (
                <button
                  type="button"
                  onClick={toggleAllFiltered}
                  className="text-[11px] font-bold text-[#041632] hover:underline"
                >
                  {allFilteredSelected ? 'Quitar' : 'Seleccionar'} Dpto. {deptFilter}
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[420px] divide-y divide-[#f2f4f6]">
              {filteredEmployees.length === 0 ? (
                <div className="py-10 text-center text-[#75777e] text-[13px]">
                  <span className="material-symbols-outlined text-[32px] block mb-2">{'\uE8B6'}</span>
                  Sin resultados para la búsqueda
                </div>
              ) : (
                filteredEmployees.map(emp => {
                  const selected = selectedSet.has(emp.id)
                  const initials = emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')
                  
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selected ? 'bg-[#041632]/[0.04]' : 'hover:bg-[#f7f9fb]'
                      }`}
=======
            {/* Planta asignada */}
            <select
              value={plantFilter}
              onChange={e => setPlantFilter(e.target.value)}
              disabled={loadingEmployees || !!employeesError}
              className="h-9 bg-white border border-[#c5c6ce] rounded-lg px-3 text-[13px] text-[#041632] focus:outline-none focus:border-[#041632] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {PLANTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Lista de empleados */}
          <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">

            {/* Header de lista con Select All */}
            <div className="px-4 py-2.5 border-b border-[#e0e3e5] flex items-center gap-3 bg-[#f7f9fb]">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAll}
                disabled={loadingEmployees || !!employeesError || filtered.length === 0}
                className="w-4 h-4 rounded border-[#c5c6ce] accent-[#041632] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex-1">
                {allFilteredSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                {search || plantFilter !== 'Todas' ? ` (${filtered.length} filtrado${filtered.length !== 1 ? 's' : ''})` : ` (${employees.length})`}
              </span>
            </div>

            {/* Filas de empleados */}
            <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
              {loadingEmployees ? (
                <div className="py-10 text-center text-[#75777e] text-[13px] flex flex-col items-center gap-2">
                  <svg className="animate-spin w-5 h-5 text-[#041632]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Cargando empleados...
                </div>
              ) : employeesError ? (
                <div className="py-10 text-center text-[#dc2626] text-[13px] flex flex-col items-center gap-2 px-4">
                  <span className="material-symbols-outlined text-[32px]">error</span>
                  <p>{employeesError}</p>
                  <button
                    onClick={() => {
                      setLoadingEmployees(true)
                      setEmployeesError('')
                      fetchEmployees()
                        .then(setEmployees)
                        .catch(err => setEmployeesError(err.message))
                        .finally(() => setLoadingEmployees(false))
                    }}
                    className="text-[12px] font-semibold underline cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-[#75777e] text-[13px]">
                  <span className="material-symbols-outlined text-[32px] block mb-2">search_off</span>
                  Sin resultados para "{search}"
                </div>
              ) : (
                filtered.map(emp => {
                  const selected = selectedIds.includes(emp.id)
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-[#f2f4f6] cursor-pointer transition-colors
                        ${selected ? 'bg-[#041632]/[0.04]' : 'hover:bg-[#f7f9fb]'}`}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 rounded border-[#c5c6ce] accent-[#041632] cursor-pointer shrink-0"
                      />
<<<<<<< HEAD
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
                        selected ? 'bg-[#041632] text-white' : 'bg-[#e8eaed] text-[#44474d]'
                      }`}>
                        {initials}
=======
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold
                        ${selected ? 'bg-[#041632] text-white' : 'bg-[#e8eaed] text-[#44474d]'}`}>
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold truncate ${selected ? 'text-[#041632]' : 'text-[#1c1f22]'}`}>
                          {emp.name}
                        </p>
<<<<<<< HEAD
                        <p className="text-[11px] text-[#75777e] truncate">{emp.role} · {emp.department}</p>
=======
                        <p className="text-[11px] text-[#75777e] truncate">{emp.role} · {emp.plant}</p>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                      </div>
                      <span className="text-[11px] font-mono text-[#adb0b7] shrink-0">{emp.id}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
<<<<<<< HEAD
        </section>

        {/* Panel Derecho — Configuración o Resultados */}
        <section className="flex flex-col gap-4 flex-1 lg:max-w-[420px] print:max-w-none print:w-full">
          {generatedQRs.length === 0 ? (
            <>
              <div>
                <h2 className="text-[#041632] text-[17px] font-black">Configurar turno</h2>
                <p className="text-[#75777e] text-[12px] mt-0.5">Define la fecha y turno del acceso</p>
=======
        </div>

        {/* ══════════════ PANEL DERECHO — Configuración + QR ══════════════ */}
        <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">

          {!session ? (
            /* ── Configuración de turno ── */
            <>
              <div>
                <h2 className="text-[#041632] text-[17px] font-black">Configurar turno</h2>
                <p className="text-[#75777e] text-[12px] mt-0.5">
                  Define la fecha y turno del acceso
                </p>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
              </div>

              {/* Fecha */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm p-5 flex flex-col gap-3">
<<<<<<< HEAD
                <label htmlFor="access-date" className="flex items-center gap-2 text-[#041632] text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">{'\uE935'}</span>
                  Fecha de acceso
                </label>
                <input
                  id="access-date"
=======
                <label className="flex items-center gap-2 text-[#041632] text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Fecha de acceso
                </label>
                <input
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="h-10 border border-[#c5c6ce] rounded-lg px-3 text-[14px] text-[#041632] focus:outline-none focus:border-[#041632] bg-[#f7f9fb] cursor-pointer"
                />
              </div>

              {/* Horario */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                <p className="text-[#041632] text-[13px] font-bold flex items-center gap-2">
<<<<<<< HEAD
                  <span className="material-symbols-outlined text-[18px]">{'\uE8B5'}</span>
                  Horario del turno
                </p>

                <div className="flex gap-3 items-end">
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <label htmlFor="start-time" className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[13px] shrink-0">{'\uEA77'}</span>
                      Entrada
                    </label>
                    <input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="h-[46px] w-full border-2 border-[#c5c6ce] focus:border-[#041632] rounded-xl px-2.5 text-[14px] font-bold text-[#041632] bg-[#f7f9fb] focus:outline-none focus:bg-white transition-colors cursor-pointer text-center"
                    />
                  </div>

                  <div className="pb-2.5 text-[#adb0b7] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{'\uE5C8'}</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <label htmlFor="end-time" className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[13px] shrink-0">{'\uE9BA'}</span>
                      Salida
                    </label>
                    <input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="h-[46px] w-full border-2 border-[#c5c6ce] focus:border-[#041632] rounded-xl px-2.5 text-[14px] font-bold text-[#041632] bg-[#f7f9fb] focus:outline-none focus:bg-white transition-colors cursor-pointer text-center"
=======
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  Horario del turno
                </p>

                {/* Inputs de hora */}
                <div className="flex gap-3 items-end">
                  {/* Hora de entrada */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">login</span>
                      Entrada
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="h-[46px] w-full border-2 border-[#c5c6ce] focus:border-[#041632] rounded-xl px-3 text-[15px] font-bold text-[#041632] bg-[#f7f9fb] focus:outline-none focus:bg-white transition-colors cursor-pointer"
                    />
                  </div>

                  {/* Flecha separadora */}
                  <div className="pb-2.5 text-[#adb0b7]">
                    <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                  </div>

                  {/* Hora de salida */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">logout</span>
                      Salida
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="h-[46px] w-full border-2 border-[#c5c6ce] focus:border-[#041632] rounded-xl px-3 text-[15px] font-bold text-[#041632] bg-[#f7f9fb] focus:outline-none focus:bg-white transition-colors cursor-pointer"
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                    />
                  </div>
                </div>

<<<<<<< HEAD
                {duration && (
                  <div className="flex items-center justify-between bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[#964900] text-[16px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {'\uE425'}
                      </span>
                      <span className="text-[#75777e] text-[12px] font-semibold truncate">Duración del turno</span>
                    </div>
                    <span className="text-[#041632] text-[14px] font-black shrink-0">{duration}</span>
=======
                {/* Duración calculada */}
                {duration && (
                  <div className="flex items-center justify-between bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#964900] text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                      <span className="text-[#75777e] text-[12px] font-semibold">Duración del turno</span>
                    </div>
                    <span className="text-[#041632] text-[14px] font-black">{duration}</span>
                  </div>
                )}

                {/* Advertencia si cruza medianoche */}
                {startTime && endTime && startTime >= endTime && (
                  <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#fde68a] rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-[#92400e] text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>bedtime</span>
                    <span className="text-[#92400e] text-[11px] font-semibold">
                      Turno nocturno — termina el día siguiente
                    </span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {/* Botón de Generación */}
              <button
                type="button"
=======
              {/* Resumen */}
              {selectedIds.length > 0 && startTime && endTime && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#15803d] text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="text-[#15803d] text-[13px] font-semibold">
                    {selectedIds.length} empleado{selectedIds.length !== 1 ? 's' : ''}
                    {' '}· {startTime} – {endTime}
                    {duration && <span className="font-normal opacity-80"> ({duration})</span>}
                  </p>
                </div>
              )}

              {/* Botón generar */}
              <button
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                onClick={handleGenerate}
                disabled={selectedIds.length === 0 || !startTime || !endTime || generating}
                className="w-full h-[52px] bg-[#041632] hover:bg-[#1b2b48] disabled:bg-[#c5c6ce] disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-md"
              >
                {generating ? (
                  <>
<<<<<<< HEAD
                    <span className="animate-spin material-symbols-outlined text-[18px]">{'\uE86A'}</span>
                    Generando QRs...
                  </>
                ) : (
                  `Generar ${selectedIds.length} QR(s) de acceso`
                )}
              </button>
            </>
          ) : (
            <>
              {/* Encabezado Resultados */}
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#15803d] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {'\uE5CA'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-[#041632] text-[17px] font-black leading-tight">QRs Listos</h2>
                    <p className="text-[#75777e] text-[12px]">{generatedQRs.length} pases individuales</p>
                  </div>
                </div>
              </div>

              {/* Badges de Estado de Email */}
              {emailStatus === 'sending' && (
                <div className="p-2.5 bg-[#eff6ff] text-[#1d4ed8] text-[12px] rounded-xl border border-[#bfdbfe] flex items-center gap-2 print:hidden">
                  <span className="animate-spin material-symbols-outlined text-[16px]">{'\uE86A'}</span>
                  Enviando correo a RH...
                </div>
              )}
              {emailStatus === 'sent' && (
                <div className="p-2.5 bg-[#f0fdf4] text-[#15803d] text-[12px] rounded-xl border border-[#bbf7d0] flex items-center gap-2 print:hidden">
                  <span className="material-symbols-outlined text-[16px]">{'\uE86C'}</span>
                  Notificación enviada a RH
                </div>
              )}
              {emailStatus === 'error' && (
                <div className="p-2.5 bg-[#fef2f2] text-[#b91c1c] text-[12px] rounded-xl border border-[#fecaca] flex items-center gap-2 print:hidden">
                  <span className="material-symbols-outlined text-[16px]">{'\uE000'}</span>
                  {emailError}
                </div>
              )}

              {/* Lista de Tarjetas QR (Optimizada para pantalla e impresión) */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[580px] pr-1 print:max-h-none print:overflow-visible print:grid print:grid-cols-2 print:gap-6">
                {generatedQRs.map(({ employee, session, qrDataUrl, formattedDate }) => (
                  <div key={employee.id} className="bg-white border-2 border-[#041632] rounded-2xl shadow-md overflow-hidden flex flex-col justify-between print:break-inside-avoid">
                    <div className="bg-[#041632] px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-[13px] font-bold truncate">{employee.name}</p>
                        <p className="text-[#b7c8e1] text-[10px] truncate">{employee.role} · ID: {employee.id}</p>
                      </div>
                      <span className="text-[10px] font-mono text-white bg-white/20 px-2 py-0.5 rounded shrink-0">
                        #{session.token.slice(0, 6)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-white">
                      <img src={qrDataUrl} alt={`QR ${employee.name}`} className="w-[180px] h-[180px] object-contain" />
                      
                      {/* Leyenda de Expiración Visible */}
                      <div className="mt-2 text-center bg-[#f7f9fb] border border-[#e0e3e5] px-3 py-1.5 rounded-lg w-full">
                        <p className="text-[10px] uppercase font-bold text-[#75777e] tracking-wide">Válido únicamente:</p>
                        <p className="text-[11px] font-extrabold text-[#041632]">
                          {formattedDate} · {startTime} a {endTime}
                        </p>
                      </div>
                    </div>

                    {/* Acciones de Tarjeta (Ocultas al imprimir) */}
                    <div className="px-4 pb-4 grid grid-cols-3 gap-1.5 print:hidden">
                      <button
                        type="button"
                        onClick={() => handleDownload(qrDataUrl, employee.id)}
                        className="h-8 bg-[#041632] hover:bg-[#1b2b48] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Descargar imagen QR"
                      >
                        <span className="material-symbols-outlined text-[13px]">{'\uF090'}</span>
                        Descargar
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(employee.name, session.url)}
                        className="h-8 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Enviar por WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[13px]">{'\uE0B7'}</span>
                        WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyUrl(session.url)}
                        className="h-8 border border-[#c5c6ce] hover:bg-[#f2f4f6] text-[#041632] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Copiar Enlace"
                      >
                        <span className="material-symbols-outlined text-[13px]">{'\uE14D'}</span>
                        Copiar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
=======
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generando QR...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                    {selectedIds.length === 0 ? 'Selecciona empleados primero' : `Generar QR de acceso`}
                  </>
                )}
              </button>
            </>

          ) : (
            /* ── QR generado ── */
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#15803d] text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <h2 className="text-[#041632] text-[17px] font-black leading-tight">QR listo</h2>
                  <p className="text-[#75777e] text-[12px]">Muéstralo a los empleados para escanear</p>
                </div>
              </div>

              {/* Toast de estado del correo */}
              {emailStatus === 'sending' && (
                <div className="flex items-center gap-2.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5">
                  <svg className="animate-spin w-4 h-4 text-[#2563eb] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <p className="text-[#1d4ed8] text-[12px] font-semibold">Enviando notificación a RH...</p>
                </div>
              )}
              {emailStatus === 'sent' && (
                <div className="flex items-center gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
                  <span className="material-symbols-outlined text-[#15803d] text-[18px] shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                  <div>
                    <p className="text-[#15803d] text-[12px] font-bold">Correo enviado a RH</p>
                    <p className="text-[#166534] text-[11px]">
                      {getEmailConfig().hrEmails?.join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {emailStatus === 'error' && (
                <div className="flex items-start gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-2.5">
                  <span className="material-symbols-outlined text-[#dc2626] text-[18px] shrink-0 mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <div>
                    <p className="text-[#dc2626] text-[12px] font-bold">No se pudo enviar el correo</p>
                    {emailError && <p className="text-[#b91c1c] text-[11px] mt-0.5">{emailError}</p>}
                    <button
                      onClick={() => navigate('/notifications')}
                      className="text-[11px] font-semibold text-[#dc2626] underline mt-0.5 cursor-pointer"
                    >
                      Verificar configuración →
                    </button>
                  </div>
                </div>
              )}
              {emailStatus === 'skip' && (
                <div className="flex items-center gap-2.5 bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-2.5">
                  <span className="material-symbols-outlined text-[#75777e] text-[16px]">mail_off</span>
                  <p className="text-[#75777e] text-[12px]">
                    Sin notificación —{' '}
                    <button onClick={() => navigate('/notifications')} className="font-semibold underline cursor-pointer">
                      Configurar correo
                    </button>
                  </p>
                </div>
              )}

              {/* Tarjeta del QR */}
              <div className="bg-white border-2 border-[#041632] rounded-2xl shadow-md overflow-hidden">
                {/* Cabecera */}
                <div className="bg-[#041632] px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-[12px] font-bold uppercase tracking-wider">Plant Alpha-4</p>
                    <p className="text-[#b7c8e1] text-[11px]">
                      {session.date} · {session.shift}
                      {duration && <span className="text-[#fc820c] font-semibold"> · {duration}</span>}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#fc820c] text-[28px]">qr_code_2</span>
                </div>

                {/* Imagen QR */}
                <div className="flex justify-center px-5 pt-5 pb-3">
                  {qrDataUrl && (
                    <img
                      ref={qrImgRef}
                      src={qrDataUrl}
                      alt="Código QR de acceso"
                      className="w-[240px] h-[240px] rounded-lg border border-[#e0e3e5]"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="px-5 pb-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-[#f7f9fb] border border-[#e0e3e5] rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-[#75777e] text-[14px]">group</span>
                    <span className="text-[#041632] text-[12px] font-semibold">
                      {session.employeeIds.length} empleado{session.employeeIds.length !== 1 ? 's' : ''} autorizados
                    </span>
                    <span className="ml-auto text-[11px] font-mono text-[#adb0b7]">
                      #{session.token.slice(0, 8)}
                    </span>
                  </div>

                  {/* Instrucción */}
                  <p className="text-center text-[#75777e] text-[11px] leading-relaxed">
                    Cada empleado escanea este QR con su teléfono.
                    El sistema lo identificará automáticamente.
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleDownload}
                  className="flex-1 h-[44px] bg-[#041632] hover:bg-[#1b2b48] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Descargar
                </button>
                <button
                  onClick={handleCopyUrl}
                  className={`flex-1 h-[44px] border text-[13px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer
                    ${copied
                      ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]'
                      : 'bg-white border-[#c5c6ce] hover:bg-[#f2f4f6] text-[#041632]'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copiado' : 'Copiar URL'}
                </button>
              </div>

              {/* Lista de empleados autorizados */}
              <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#e0e3e5] bg-[#f7f9fb]">
                  <p className="text-[11px] font-semibold text-[#75777e] uppercase tracking-wide">
                    Empleados autorizados en este QR
                  </p>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                  {employees.filter(e => session.employeeIds.includes(e.id)).map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#f2f4f6]">
                      <div className="w-7 h-7 rounded-full bg-[#041632] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#041632] truncate">{emp.name}</p>
                        <p className="text-[10px] text-[#75777e] truncate">{emp.role}</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#adb0b7]">{emp.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
    </div>
  )
}