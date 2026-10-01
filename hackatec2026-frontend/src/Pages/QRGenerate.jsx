import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/** Trae el catálogo real de empleados desde el backend. */
async function fetchEmployees() {
  const res = await fetch('/api/empleados', { credentials: 'include' })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'No se pudo cargar la lista de empleados')
  }
  return json.data
}

/** Identificador del empleado según cómo lo regrese el backend */
const empKey = (e) => e.id_empleado ?? e.id

export default function QRGenerate() {
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [employeesError, setEmployeesError] = useState('')

  const [search, setSearch] = useState('')
  const [plantFilter, setPlantFilter] = useState('Todas')
  const [selectedEmp, setSelectedEmp] = useState(null)

  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loadingQr, setLoadingQr] = useState(false)
  const [qrError, setQrError] = useState('')

  // Regeneración de QR
  const [regenerating, setRegenerating] = useState(false)
  const [regenMsg, setRegenMsg] = useState('')
  const selectedRef = useRef(null)

  useEffect(() => {
    selectedRef.current = selectedEmp
  }, [selectedEmp])

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

  const PLANTS = useMemo(() => {
    const unique = [...new Set(employees.map(e => e.plant).filter(Boolean))].sort()
    return ['Todas', ...unique]
  }, [employees])

  const filtered = employees.filter(e => {
    const matchPlant = plantFilter === 'Todas' || e.plant === plantFilter
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.id && e.id.toLowerCase().includes(search.toLowerCase())) ||
      (e.role && e.role.toLowerCase().includes(search.toLowerCase()))
    return matchPlant && matchSearch
  })

  // Fetch QR when an employee is selected
  useEffect(() => {
    setRegenMsg('')

    if (!selectedEmp) {
      setQrDataUrl('')
      return
    }

    let isMounted = true
    setLoadingQr(true)
    setQrError('')

    const id = empKey(selectedEmp)

    fetch(`/api/empleados/${id}/qr`, { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        if (!isMounted) return
        if (json.success && json.data?.qr_image) {
          setQrDataUrl(json.data.qr_image)
        } else {
          setQrDataUrl('')
          setQrError(json.error || 'No se pudo cargar el QR')
        }
      })
      .catch(err => {
        if (isMounted) {
          setQrDataUrl('')
          setQrError(err.message)
        }
      })
      .finally(() => {
        if (isMounted) setLoadingQr(false)
      })

    return () => { isMounted = false }
  }, [selectedEmp])

  function handleDownload() {
    if (!qrDataUrl || !selectedEmp) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `QR_${selectedEmp.name.replace(/\s/g, '_')}.png`
    a.click()
  }

  /** Pide al backend un QR nuevo (invalida el anterior) y lo muestra */
  async function handleRegenerate() {
    if (!selectedEmp || regenerating) return

    const target = selectedEmp
    const ok = window.confirm(
      `Se generará un QR nuevo para ${target.name}.\nEl QR anterior dejará de funcionar. ¿Continuar?`
    )
    if (!ok) return

    setRegenerating(true)
    setQrError('')
    setRegenMsg('')

    try {
      const res = await fetch(`/api/empleados/${empKey(target)}/qr/regenerar`, {
        method: 'POST',
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))

      // Si mientras tanto se eligió otro empleado, no pisamos su pantalla
      if (selectedRef.current !== target) return

      if (!res.ok || !json.success || !json.data?.qr_image) {
        setQrError(json.error || 'No se pudo generar un QR nuevo')
        return
      }
      setQrDataUrl(json.data.qr_image)
      setRegenMsg('QR nuevo generado. El anterior ya no es válido.')
    } catch {
      if (selectedRef.current === target) setQrError('Sin conexión con el servidor')
    } finally {
      setRegenerating(false)
    }
  }

  const regenButton = (
    <button
      onClick={handleRegenerate}
      disabled={regenerating}
      className="w-full border border-[#c5c6ce] bg-white text-[#041632] py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <span className={`material-symbols-outlined text-[18px] ${regenerating ? 'animate-spin' : ''}`}>refresh</span>
      {regenerating ? 'Generando...' : '¿No funciona? Generar QR nuevo'}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
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
              <p className="text-[#041632] text-[13px] font-bold leading-none">Pases QR de Empleados</p>
              <p className="text-[#75777e] text-[11px] mt-0.5">Gestión individual de accesos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 p-5 lg:p-6 max-w-[1200px] w-full mx-auto">
        {/* PANEL IZQUIERDO — Selección de empleado */}
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h2 className="text-[#041632] text-[17px] font-black">Directorio de Empleados</h2>
            <p className="text-[#75777e] text-[12px] mt-0.5">Selecciona un empleado para ver su QR de hoy</p>
          </div>

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

          <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[500px]">
              {loadingEmployees ? (
                <div className="py-10 text-center text-[#75777e] text-[13px]">Cargando empleados...</div>
              ) : employeesError ? (
                <div className="py-10 text-center text-[#dc2626] text-[13px]">{employeesError}</div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-[#75777e] text-[13px]">Sin resultados</div>
              ) : (
                filtered.map(emp => {
                  const selected = !!selectedEmp && empKey(selectedEmp) === empKey(emp)
                  return (
                    <div
                      key={empKey(emp)}
                      onClick={() => setSelectedEmp(emp)}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-[#f2f4f6] cursor-pointer transition-colors ${selected ? 'bg-[#041632]/[0.04]' : 'hover:bg-[#f7f9fb]'}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${selected ? 'bg-[#041632] text-white' : 'bg-[#e8eaed] text-[#44474d]'}`}>
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold truncate ${selected ? 'text-[#041632]' : 'text-[#1c1f22]'}`}>{emp.name}</p>
                        <p className="text-[11px] text-[#75777e] truncate">{emp.role} · {emp.plant}</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#adb0b7] shrink-0">{emp.id}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO — Vista del QR */}
        <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
          <div>
            <h2 className="text-[#041632] text-[17px] font-black">Pase QR</h2>
            <p className="text-[#75777e] text-[12px] mt-0.5">El código se renueva cada medianoche</p>
          </div>

          <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm p-6 flex flex-col items-center text-center gap-4 min-h-[300px] justify-center">
            {!selectedEmp ? (
              <p className="text-[13px] text-[#75777e]">Selecciona un empleado para ver su QR</p>
            ) : loadingQr ? (
              <p className="text-[13px] text-[#75777e]">Cargando código QR...</p>
            ) : qrError ? (
              <>
                <p className="text-[13px] text-[#dc2626]">{qrError}</p>
                {regenButton}
              </>
            ) : qrDataUrl ? (
              <>
                <h3 className="text-[#041632] text-[15px] font-bold">{selectedEmp.name}</h3>
                <img
                  src={qrDataUrl}
                  alt="Código QR del Empleado"
                  className={`w-56 h-56 object-contain border p-2 rounded-xl transition-opacity ${regenerating ? 'opacity-40' : ''}`}
                />
                {regenMsg && (
                  <p className="text-[12px] text-[#15803d] font-semibold">{regenMsg}</p>
                )}
                <div className="w-full flex flex-col gap-2 mt-1">
                  <button
                    onClick={handleDownload}
                    disabled={regenerating}
                    className="w-full bg-[#041632] text-white py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#1b2b48] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Descargar QR
                  </button>
                  {regenButton}
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] text-[#75777e]">QR no disponible para este empleado</p>
                {regenButton}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}