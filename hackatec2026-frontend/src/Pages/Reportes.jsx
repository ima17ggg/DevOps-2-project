import { useEffect, useState } from 'react'

const STATUS_STYLES = {
  critica: 'bg-error-container text-on-error-container border-error',
  critica_alt: 'bg-error-container text-on-error-container border-error',
  pendiente: 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]',
  abierta: 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]',
  abierto: 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]',
  resuelto: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
  resuelta: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
  cerrado: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
  cerrada: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
}

function defaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeStatus(value) {
  return String(value || 'Sin estado').trim()
}

function statusKey(value, priority) {
  const source = `${value || ''} ${priority || ''}`.toLowerCase()
  if (source.includes('crít') || source.includes('crit')) return 'critica'
  if (source.includes('pend')) return 'pendiente'
  if (source.includes('abiert') || source.includes('open')) return 'abierta'
  if (source.includes('resuelt') || source.includes('cerrad')) return 'resuelto'
  return 'neutral'
}

function downloadCsv(rows) {
  const headers = ['folio', 'fecha', 'empleado', 'ubicacion', 'tipo', 'estado', 'prioridad', 'descripcion']
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(',')),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-incidencias-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [dateRange] = useState(defaultDateRange)
  const [startDate, setStartDate] = useState(dateRange.startDate)
  const [endDate, setEndDate] = useState(dateRange.endDate)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadReport() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          limit: '1000',
        })

        const res = await fetch(`/api/reportes?${params.toString()}`, { credentials: 'include' })
        const json = await res.json().catch(() => null)

        if (!res.ok || json?.success === false) {
          throw new Error(json?.error || 'No se pudo cargar el reporte')
        }

        if (!cancelled) setReportData(json.data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReport()
    return () => { cancelled = true }
  }, [startDate, endDate])

  const summary = reportData?.summary ?? {}
  const incidents = reportData?.incidencias ?? []
  const trend = reportData?.tendencia_incidencias ?? []

  const filteredIncidents = incidents.filter((incident) => {
    if (statusFilter === 'todos') return true
    return statusKey(incident.estado, incident.prioridad) === statusFilter
  })

  const maxTrend = Math.max(...trend.map((item) => item.total), 1)

  return (
    <main className="flex-1 overflow-y-auto p-gutter md:p-lg space-y-lg bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
            Reportes y Control de Incidencias
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            Consulta incidencias, asistencia y cumplimiento operativo por rango de fechas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <DateInput label="Inicio" value={startDate} onChange={setStartDate} />
          <DateInput label="Fin" value={endDate} onChange={setEndDate} />
          <button
            onClick={() => downloadCsv(filteredIncidents)}
            disabled={filteredIncidents.length === 0}
            className="h-11 px-md bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span translate="no" className="material-symbols-outlined notranslate text-[18px]">download</span>
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container border border-error rounded-lg p-md font-body-md text-body-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <MetricCard title="Incidencias Totales" icon="assignment_late" value={loading ? '-' : summary.total_incidencias ?? 0} />
        <MetricCard title="Abiertas" icon="pending_actions" value={loading ? '-' : summary.incidencias_abiertas ?? 0} tone="warning" />
        <MetricCard title="Críticas" icon="warning" value={loading ? '-' : summary.incidencias_criticas ?? 0} tone="error" />
        <MetricCard title="Asistencia Cerrada" icon="fact_check" value={loading ? '-' : `${summary.tasa_cierre_asistencia ?? 0}%`} tone="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        <section className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
          <div className="px-md py-sm border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-sm bg-surface">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary">Bitácora de Incidencias</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {loading ? 'Cargando registros...' : `${filteredIncidents.length} registros encontrados`}
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-sm font-body-md text-body-md text-on-surface outline-none focus:border-primary"
            >
              <option value="todos">Todos los estados</option>
              <option value="critica">Críticas</option>
              <option value="pendiente">Pendientes</option>
              <option value="abierta">Abiertas</option>
              <option value="resuelto">Resueltas</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b-2 border-primary text-primary font-label-md text-label-md uppercase">
                  <th className="p-sm pl-md font-semibold">Folio</th>
                  <th className="p-sm font-semibold">Fecha</th>
                  <th className="p-sm font-semibold">Empleado</th>
                  <th className="p-sm font-semibold">Ubicación</th>
                  <th className="p-sm font-semibold">Tipo</th>
                  <th className="p-sm pr-md font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {loading && <TableState text="Cargando reportes..." />}
                {!loading && !error && filteredIncidents.length === 0 && <TableState text="No hay incidencias en el rango seleccionado." />}
                {!loading && filteredIncidents.map((incident, index) => (
                  <tr key={incident.id_incidencia ?? incident.folio ?? index} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="p-sm pl-md font-code-md text-primary font-medium">{incident.folio}</td>
                    <td className="p-sm whitespace-nowrap text-on-surface-variant">{formatDate(incident.fecha)}</td>
                    <td className="p-sm">{incident.empleado}</td>
                    <td className="p-sm">{incident.ubicacion}</td>
                    <td className="p-sm">{incident.tipo || 'Sin tipo'}</td>
                    <td className="p-sm pr-md">
                      <StatusBadge status={incident.estado} priority={incident.prioridad} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="xl:col-span-4 flex flex-col gap-gutter">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant bg-surface">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                <span translate="no" className="material-symbols-outlined notranslate text-[18px]">monitoring</span>
                Tendencia
              </h3>
            </div>
            <div className="p-md h-[260px] flex items-end gap-xs">
              {loading ? (
                <div className="w-full text-center text-on-surface-variant font-body-md text-body-md">Cargando gráfica...</div>
              ) : trend.length === 0 ? (
                <div className="w-full text-center text-on-surface-variant font-body-md text-body-md">Sin datos de tendencia.</div>
              ) : trend.slice(-14).map((item) => (
                <div key={item.date} className="flex-1 min-w-0 flex flex-col items-center gap-xs">
                  <div className="w-full bg-primary rounded-t" style={{ height: `${Math.max((item.total / maxTrend) * 180, 8)}px` }} title={`${item.date}: ${item.total}`} />
                  <span className="text-[10px] text-outline truncate w-full text-center">{item.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant bg-surface">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                <span translate="no" className="material-symbols-outlined notranslate text-[18px]">summarize</span>
                Resumen Operativo
              </h3>
            </div>
            <div className="p-md space-y-sm">
              <SummaryRow label="Asistencias registradas" value={summary.asistencias_registradas ?? 0} />
              <SummaryRow label="Entradas confirmadas" value={summary.asistencias_con_entrada ?? 0} />
              <SummaryRow label="Turnos completados" value={summary.asistencias_completadas ?? 0} />
              <SummaryRow label="Horas trabajadas" value={summary.horas_trabajadas ?? 0} />
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function DateInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-xs h-11 px-sm bg-surface-container-lowest border border-outline-variant rounded-lg">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 bg-transparent p-0 font-body-md text-body-md text-primary focus:ring-0"
      />
    </label>
  )
}

function MetricCard({ title, icon, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-primary bg-primary-fixed',
    warning: 'text-[#9a3412] bg-[#fff7ed]',
    error: 'text-error bg-error-container',
    success: 'text-[#166534] bg-[#ecfdf3]',
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
      <div className="flex justify-between items-start mb-sm">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase">{title}</span>
        <span translate="no" className={`material-symbols-outlined notranslate text-[22px] rounded-lg p-xs ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <div className="font-headline-lg text-headline-lg text-primary">{value}</div>
    </div>
  )
}

function StatusBadge({ status, priority }) {
  const key = statusKey(status, priority)
  const className = STATUS_STYLES[key] || 'bg-surface-container-highest text-on-surface-variant border-outline-variant'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${className}`}>
      {normalizeStatus(status)}
    </span>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border border-outline-variant rounded-lg px-sm py-sm bg-surface">
      <span className="font-body-md text-body-md text-on-surface-variant">{label}</span>
      <span className="font-label-lg text-label-lg text-primary">{value}</span>
    </div>
  )
}

function TableState({ text }) {
  return (
    <tr>
      <td colSpan={6} className="p-lg text-center text-on-surface-variant">
        {text}
      </td>
    </tr>
  )
}