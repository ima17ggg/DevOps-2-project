import { useEffect, useState } from 'react'
import { sendIncidentEmail } from '../services/emailService'

const STATUS_STYLES = {
  critica: 'bg-error-container text-on-error-container border-error',
  pendiente: 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]',
  abierta: 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]',
  'en proceso': 'bg-primary-fixed text-primary border-primary-fixed-variant',
  resuelto: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
  resuelta: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
  cerrado: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
  cerrada: 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]',
}

const INCIDENT_STATUSES = ['Abierta', 'Pendiente', 'En proceso', 'Resuelta', 'Cerrada']
const INCIDENT_PRIORITIES = ['Normal', 'Alta', 'Crítica']

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
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16)
  return date.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function normalizeStatus(value) {
  return String(value || 'Sin estado').trim()
}

function statusKey(value, priority) {
  const status = String(value || '').toLowerCase()
  const severity = String(priority || '').toLowerCase()
  if (status.includes('resuelt')) return 'resuelta'
  if (status.includes('cerrad')) return 'cerrada'
  if (status.includes('proceso')) return 'en proceso'
  if (status.includes('pend')) return 'pendiente'
  if (status.includes('abiert') || status.includes('open')) return 'abierta'
  if (severity.includes('crít') || severity.includes('crit')) return 'critica'
  return 'neutral'
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || 'No se pudo completar la operación')
  }
  return payload?.data
}

function downloadCsv(rows) {
  const headers = ['folio', 'fecha', 'empleado', 'ubicacion', 'tipo', 'estado', 'prioridad', 'descripcion']
  const csvRows = [
    headers.join(','),
    ...rows.map(row => headers.map(key => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(',')),
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
  const [priorityFilter, setPriorityFilter] = useState('todas')
  const [search, setSearch] = useState('')
  const [reportData, setReportData] = useState(null)
  const [selected, setSelected] = useState(null)
  const [control, setControl] = useState({ estatus: 'Abierta', prioridad: 'Normal', comentario: '' })
  const [followUp, setFollowUp] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, limit: '1000' })

    apiRequest(`/api/reportes?${params.toString()}`)
      .then(data => {
        if (!cancelled) {
          setReportData(data)
          setError('')
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [startDate, endDate, refreshKey])

  const summary = reportData?.summary ?? {}
  const incidents = reportData?.incidencias ?? []
  const trend = reportData?.tendencia_incidencias ?? []
  const normalizedSearch = search.trim().toLowerCase()
  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = statusFilter === 'todos' || statusKey(incident.estado, incident.prioridad) === statusFilter
    const matchesPriority = priorityFilter === 'todas' || String(incident.prioridad || '').toLowerCase() === priorityFilter
    const searchable = [incident.folio, incident.asunto, incident.empleado, incident.tipo, incident.ubicacion]
      .filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch)
    return matchesStatus && matchesPriority && matchesSearch
  })
  const maxTrend = Math.max(...trend.map(item => item.total), 1)

  async function openControl(incident) {
    setSelected(incident)
    setDetailLoading(true)
    setError('')
    setNotice('')
    try {
      const detail = await apiRequest(`/api/reportes/incidencias/${incident.id_incidencia}`)
      const complete = { ...incident, ...detail, reporter_email: incident.reporter_email }
      setSelected(complete)
      setControl({
        estatus: detail.estatus || detail.estado || incident.estado || 'Abierta',
        prioridad: detail.prioridad || incident.prioridad || 'Normal',
        comentario: '',
      })
      setFollowUp('')
    } catch (err) {
      setError(err.message)
      setSelected(null)
    } finally {
      setDetailLoading(false)
    }
  }

  async function saveControl(event) {
    event.preventDefault()
    if (!selected) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await apiRequest(`/api/reportes/incidencias/${selected.id_incidencia}`, {
        method: 'PATCH',
        body: JSON.stringify(control),
      })
      const merged = { ...selected, ...updated, estado: updated.estatus, reporter_email: selected.reporter_email }
      setRefreshKey(key => key + 1)
      await openControl(merged)
      setNotice(`Incidencia ${merged.folio} actualizada correctamente.`)
      sendIncidentEmail({
        incident: merged,
        recipientEmail: merged.reporter_email,
        movement: 'actualizada',
        detail: control.comentario || `Estado: ${control.estatus}. Prioridad: ${control.prioridad}.`,
      }).catch(() => setNotice(`Incidencia ${merged.folio} actualizada; no fue posible enviar el correo.`))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function addFollowUp(event) {
    event.preventDefault()
    if (!selected || !followUp.trim()) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const comment = followUp.trim()
      await apiRequest(`/api/reportes/incidencias/${selected.id_incidencia}/seguimientos`, {
        method: 'POST', body: JSON.stringify({ comentario: comment }),
      })
      await openControl(selected)
      setRefreshKey(key => key + 1)
      setNotice('Seguimiento registrado en la bitácora.')
      sendIncidentEmail({
        incident: selected,
        recipientEmail: selected.reporter_email,
        movement: 'actualizada',
        detail: comment,
      }).catch(() => setNotice('Seguimiento guardado; no fue posible enviar el correo.'))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-gutter md:p-lg space-y-lg bg-background">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Reportes y Control de Incidencias</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Consulta, documenta y actualiza la bitácora operativa de incidencias.</p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <DateInput label="Inicio" value={startDate} onChange={setStartDate} />
          <DateInput label="Fin" value={endDate} onChange={setEndDate} />
          <button onClick={() => downloadCsv(filteredIncidents)} disabled={filteredIncidents.length === 0} className="h-11 px-md bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 shadow-sm flex items-center gap-xs disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">download</span>Exportar CSV
          </button>
        </div>
      </div>

      {error && <Message tone="error">{error}</Message>}
      {notice && <Message tone="success">{notice}</Message>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <MetricCard title="Incidencias Totales" icon="assignment_late" value={loading ? '-' : summary.total_incidencias ?? 0} />
        <MetricCard title="Abiertas" icon="pending_actions" value={loading ? '-' : summary.incidencias_abiertas ?? 0} tone="warning" />
        <MetricCard title="Críticas" icon="warning" value={loading ? '-' : summary.incidencias_criticas ?? 0} tone="error" />
        <MetricCard title="Asistencia Cerrada" icon="fact_check" value={loading ? '-' : `${summary.tasa_cierre_asistencia ?? 0}%`} tone="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        <section className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
          <div className="p-md border-b border-outline-variant bg-surface space-y-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Bitácora de Incidencias</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{loading ? 'Cargando...' : `${filteredIncidents.length} registros encontrados`}</p>
              </div>
              <div className="flex flex-wrap gap-xs">
                <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-sm text-on-surface">
                  <option value="todos">Todos los estados</option>
                  <option value="abierta">Abiertas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en proceso">En proceso</option>
                  <option value="resuelta">Resueltas</option>
                  <option value="cerrada">Cerradas</option>
                </select>
                <select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className="h-10 bg-surface-container-lowest border border-outline-variant rounded-lg px-sm text-on-surface">
                  <option value="todas">Todas las prioridades</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>
            </div>
            <label className="h-10 flex items-center gap-xs bg-surface-container-lowest border border-outline-variant rounded-lg px-sm">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por folio, asunto, empleado, tipo o ubicación" className="flex-1 bg-transparent outline-none text-on-surface font-body-md text-body-md" />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left border-collapse">
              <thead><tr className="bg-surface border-b-2 border-primary text-primary font-label-md text-label-md uppercase">
                <th className="p-sm pl-md">Folio</th><th className="p-sm">Fecha</th><th className="p-sm">Empleado</th><th className="p-sm">Asunto/Tipo</th><th className="p-sm">Prioridad</th><th className="p-sm">Estado</th><th className="p-sm pr-md">Control</th>
              </tr></thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {loading && <TableState text="Cargando reportes..." />}
                {!loading && !error && filteredIncidents.length === 0 && <TableState text="No hay incidencias que coincidan con los filtros." />}
                {!loading && filteredIncidents.map((incident, index) => (
                  <tr key={incident.id_incidencia ?? incident.folio ?? index} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="p-sm pl-md font-code-md text-primary font-medium">{incident.folio}</td>
                    <td className="p-sm whitespace-nowrap text-on-surface-variant">{formatDate(incident.fecha)}</td>
                    <td className="p-sm">{incident.empleado}</td>
                    <td className="p-sm"><span className="block font-medium">{incident.asunto || 'Sin asunto'}</span><span className="text-on-surface-variant">{incident.tipo || 'Sin tipo'}</span></td>
                    <td className="p-sm">{incident.prioridad || 'Normal'}</td>
                    <td className="p-sm"><StatusBadge status={incident.estado} priority={incident.prioridad} /></td>
                    <td className="p-sm pr-md"><button type="button" onClick={() => openControl(incident)} className="h-9 px-sm rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed flex items-center gap-xs"><span className="material-symbols-outlined text-[17px]">edit_note</span>Gestionar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="xl:col-span-4 flex flex-col gap-gutter">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant bg-surface"><h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">monitoring</span>Tendencia</h3></div>
            <div className="p-md h-[260px] flex items-end gap-xs">
              {loading ? <div className="w-full text-center text-on-surface-variant">Cargando gráfica...</div> : trend.length === 0 ? <div className="w-full text-center text-on-surface-variant">Sin datos de tendencia.</div> : trend.slice(-14).map(item => (
                <div key={item.date} className="flex-1 min-w-0 flex flex-col items-center gap-xs"><div className="w-full bg-primary rounded-t" style={{ height: `${Math.max((item.total / maxTrend) * 180, 8)}px` }} title={`${item.date}: ${item.total}`} /><span className="text-[10px] text-outline truncate w-full text-center">{item.date.slice(5)}</span></div>
              ))}
            </div>
          </section>
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant bg-surface"><h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">summarize</span>Resumen Operativo</h3></div>
            <div className="p-md space-y-sm"><SummaryRow label="Asistencias registradas" value={summary.asistencias_registradas ?? 0} /><SummaryRow label="Entradas confirmadas" value={summary.asistencias_con_entrada ?? 0} /><SummaryRow label="Turnos completados" value={summary.asistencias_completadas ?? 0} /><SummaryRow label="Horas trabajadas" value={summary.horas_trabajadas ?? 0} /></div>
          </section>
        </aside>
      </div>

      {selected && (
        <IncidentControl
          incident={selected} control={control} followUp={followUp} saving={saving} loading={detailLoading}
          onClose={() => setSelected(null)} onControlChange={(field, value) => setControl(current => ({ ...current, [field]: value }))}
          onFollowUpChange={setFollowUp} onSave={saveControl} onAddFollowUp={addFollowUp}
        />
      )}
    </main>
  )
}

function IncidentControl({ incident, control, followUp, saving, loading, onClose, onControlChange, onFollowUpChange, onSave, onAddFollowUp }) {
  const requiresResolution = ['Resuelta', 'Cerrada'].includes(control.estatus)
  const history = incident.seguimientos || []
  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex justify-end" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="w-full max-w-2xl h-full bg-background shadow-2xl overflow-y-auto">
        <header className="sticky top-0 z-10 bg-primary text-on-primary p-md flex items-start justify-between gap-md shadow-sm">
          <div><p className="font-code-md opacity-80">{incident.folio}</p><h3 className="font-headline-md text-headline-md mt-xs">Control de incidencia</h3><p className="font-body-md text-body-md opacity-80 mt-xs">{incident.asunto || incident.tipo}</p></div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Cerrar"><span className="material-symbols-outlined">close</span></button>
        </header>
        {loading ? <div className="p-lg text-center text-on-surface-variant">Cargando detalle...</div> : (
          <div className="p-md space-y-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-sm">
              <Detail label="Reportó" value={incident.empleado || incident.reporter_email || 'Sin dato'} /><Detail label="Fecha" value={formatDate(incident.fecha_reporte || incident.fecha)} /><Detail label="Tipo" value={incident.tipo || 'Sin tipo'} /><Detail label="Ubicación" value={incident.ubicacion || 'Sin ubicación'} />
            </div>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md"><h4 className="font-label-lg text-label-lg text-primary">Descripción</h4><p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap mt-xs">{incident.descripcion || 'Sin descripción.'}</p>{incident.evidencia_url && <a href={incident.evidencia_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-xs text-secondary mt-sm hover:underline"><span className="material-symbols-outlined text-[17px]">attachment</span>Abrir evidencia</a>}</section>

            <form onSubmit={onSave} className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="px-md py-sm bg-surface border-b border-outline-variant"><h4 className="font-headline-sm text-headline-sm text-primary">Actualizar control</h4></div>
              <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
                <SelectField label="Estado" value={control.estatus} onChange={value => onControlChange('estatus', value)} options={INCIDENT_STATUSES} />
                <SelectField label="Prioridad" value={control.prioridad} onChange={value => onControlChange('prioridad', value)} options={INCIDENT_PRIORITIES} />
                <label className="md:col-span-2 flex flex-col gap-xs font-label-md text-label-md text-on-surface-variant">{requiresResolution ? 'Nota de resolución *' : 'Nota del cambio (opcional)'}<textarea value={control.comentario} onChange={event => onControlChange('comentario', event.target.value)} required={requiresResolution} maxLength={3000} rows={3} className="p-sm bg-surface border border-outline-variant rounded-lg text-on-surface resize-y outline-none focus:border-primary" /></label>
              </div>
              <div className="px-md py-sm bg-surface border-t border-outline-variant flex justify-end"><button disabled={saving} className="h-10 px-md rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar cambios'}</button></div>
            </form>

            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="px-md py-sm bg-surface border-b border-outline-variant"><h4 className="font-headline-sm text-headline-sm text-primary">Historial de seguimiento</h4><p className="font-body-md text-body-md text-on-surface-variant">{history.length} movimiento{history.length === 1 ? '' : 's'}</p></div>
              <div className="p-md space-y-sm max-h-[320px] overflow-y-auto">{history.length === 0 && <p className="text-on-surface-variant">Sin movimientos registrados.</p>}{history.map(item => <article key={item.id_seguimiento} className="border border-outline-variant rounded-lg p-sm bg-surface"><div className="flex items-center justify-between gap-sm"><span className="font-label-md text-label-md text-primary">{item.autor_email}</span><span className="text-on-surface-variant text-xs">{formatDate(item.created_at)}</span></div><p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap mt-xs">{item.comentario}</p><span className="inline-block mt-xs text-[10px] uppercase font-bold text-on-surface-variant">{item.estado}</span></article>)}</div>
              <form onSubmit={onAddFollowUp} className="p-md bg-surface border-t border-outline-variant"><label className="flex flex-col gap-xs font-label-md text-label-md text-on-surface-variant">Nuevo seguimiento<textarea value={followUp} onChange={event => onFollowUpChange(event.target.value)} required maxLength={3000} rows={3} placeholder="Registra diagnóstico, acción realizada o información solicitada..." className="p-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface resize-y outline-none focus:border-primary" /></label><div className="flex justify-end mt-sm"><button disabled={saving || !followUp.trim()} className="h-10 px-md rounded-lg bg-secondary text-on-secondary font-label-md text-label-md disabled:opacity-50">Agregar seguimiento</button></div></form>
            </section>
          </div>
        )}
      </section>
    </div>
  )
}

function DateInput({ label, value, onChange }) { return <label className="flex items-center gap-xs h-11 px-sm bg-surface-container-lowest border border-outline-variant rounded-lg"><span className="font-label-md text-label-md text-on-surface-variant">{label}</span><input type="date" value={value} onChange={event => onChange(event.target.value)} className="border-0 bg-transparent p-0 text-primary focus:ring-0" /></label> }
function MetricCard({ title, icon, value, tone = 'neutral' }) { const tones = { neutral: 'text-primary bg-primary-fixed', warning: 'text-[#9a3412] bg-[#fff7ed]', error: 'text-error bg-error-container', success: 'text-[#166534] bg-[#ecfdf3]' }; return <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm"><div className="flex justify-between items-start mb-sm"><span className="font-label-md text-label-md text-on-surface-variant uppercase">{title}</span><span className={`material-symbols-outlined text-[22px] rounded-lg p-xs ${tones[tone]}`}>{icon}</span></div><div className="font-headline-lg text-headline-lg text-primary">{value}</div></div> }
function StatusBadge({ status, priority }) { const key = statusKey(status, priority); const className = STATUS_STYLES[key] || 'bg-surface-container-highest text-on-surface-variant border-outline-variant'; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${className}`}>{normalizeStatus(status)}</span> }
function SummaryRow({ label, value }) { return <div className="flex items-center justify-between border border-outline-variant rounded-lg px-sm py-sm bg-surface"><span className="text-on-surface-variant">{label}</span><span className="font-label-lg text-label-lg text-primary">{value}</span></div> }
function TableState({ text }) { return <tr><td colSpan={7} className="p-lg text-center text-on-surface-variant">{text}</td></tr> }
function Detail({ label, value }) { return <div><p className="font-label-md text-label-md text-on-surface-variant">{label}</p><p className="font-body-md text-body-md text-on-surface mt-xs break-words">{value}</p></div> }
function SelectField({ label, value, onChange, options }) { return <label className="flex flex-col gap-xs font-label-md text-label-md text-on-surface-variant">{label}<select value={value} onChange={event => onChange(event.target.value)} className="h-11 px-sm bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary">{options.map(option => <option key={option}>{option}</option>)}</select></label> }
function Message({ tone, children }) { const className = tone === 'error' ? 'bg-error-container text-on-error-container border-error' : 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]'; return <div className={`border rounded-lg p-sm ${className}`}>{children}</div> }
