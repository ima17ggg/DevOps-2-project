import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendIncidentEmail } from '../services/emailService'

const EMPTY_FORM = {
  asunto: '',
  tipo: '',
  descripcion: '',
  prioridad: 'Normal',
  ubicacion: '',
  evidencia_url: '',
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || 'No se pudo completar la operación')
  }
  return payload?.data
}

function incidentDate(incident) {
  return incident?.fecha_reporte || incident?.created_at || incident?.updated_at
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function Incidencias() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [followUp, setFollowUp] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadIncidents() {
    setLoading(true)
    setError('')
    try {
      setIncidents(await apiRequest('/api/incidencias'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    apiRequest('/api/incidencias')
      .then(data => {
        if (active) setIncidents(data)
      })
      .catch(err => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function updateForm(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function openIncident(incident) {
    setError('')
    try {
      setSelected(await apiRequest(`/api/incidencias/${incident.id_incidencia}`))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const created = await apiRequest('/api/incidencias', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      setForm(EMPTY_FORM)
      setShowForm(false)
      setNotice(`Incidencia ${created.folio} registrada correctamente.`)
      await loadIncidents()
      await openIncident(created)

      sendIncidentEmail({
        incident: created,
        recipientEmail: user?.email,
        movement: 'registrada',
        detail: created.descripcion,
      }).catch(() => setNotice(`Incidencia ${created.folio} registrada; no fue posible enviar el correo.`))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleFollowUp(event) {
    event.preventDefault()
    if (!followUp.trim() || !selected) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await apiRequest(`/api/incidencias/${selected.id_incidencia}/seguimientos`, {
        method: 'POST',
        body: JSON.stringify({ comentario: followUp }),
      })
      const detail = followUp.trim()
      setFollowUp('')
      await openIncident(selected)
      await loadIncidents()
      setNotice('Seguimiento agregado correctamente.')

      sendIncidentEmail({
        incident: selected,
        recipientEmail: user?.email,
        movement: 'actualizada',
        detail,
      }).catch(() => setNotice('Seguimiento guardado; no fue posible enviar el correo.'))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background p-gutter md:p-lg">
      <div className="max-w-7xl mx-auto space-y-lg">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-wide text-secondary">HelpDesk</p>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              Mis incidencias
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
              Reporta un problema y consulta el historial de atención.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(value => !value)}
            className="h-11 px-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-xs shadow-sm hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[19px]">{showForm ? 'close' : 'add'}</span>
            {showForm ? 'Cancelar' : 'Reportar incidencia'}
          </button>
        </header>

        {error && <Message tone="error">{error}</Message>}
        {notice && <Message tone="success">{notice}</Message>}

        {showForm && (
          <IncidentForm
            form={form}
            saving={saving}
            onChange={updateForm}
            onSubmit={handleCreate}
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
          <section className="xl:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="px-md py-sm bg-surface border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary">Reportes enviados</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {loading ? 'Cargando...' : `${incidents.length} incidencia${incidents.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="divide-y divide-outline-variant max-h-[650px] overflow-y-auto">
              {loading && <EmptyState icon="progress_activity" text="Cargando incidencias..." />}
              {!loading && incidents.length === 0 && <EmptyState icon="inbox" text="Aún no has reportado incidencias." />}
              {!loading && incidents.map(incident => (
                <button
                  type="button"
                  key={incident.id_incidencia}
                  onClick={() => openIncident(incident)}
                  className={`w-full text-left p-md hover:bg-surface-container-low transition-colors ${selected?.id_incidencia === incident.id_incidencia ? 'bg-primary-fixed' : ''}`}
                >
                  <div className="flex items-start justify-between gap-sm">
                    <div className="min-w-0">
                      <p className="font-code-md text-primary font-semibold">{incident.folio || `INC-${incident.id_incidencia}`}</p>
                      <p className="font-label-lg text-label-lg text-on-surface truncate mt-xs">{incident.asunto || incident.tipo}</p>
                    </div>
                    <StatusBadge value={incident.estatus || incident.estado} />
                  </div>
                  <div className="flex items-center justify-between gap-sm mt-sm text-on-surface-variant font-body-md text-body-md">
                    <span>{incident.tipo}</span>
                    <span>{formatDate(incidentDate(incident))}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="xl:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            {selected ? (
              <IncidentDetail
                incident={selected}
                followUp={followUp}
                saving={saving}
                onFollowUpChange={setFollowUp}
                onFollowUpSubmit={handleFollowUp}
              />
            ) : (
              <EmptyState icon="forum" text="Selecciona una incidencia para consultar su detalle y seguimiento." large />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function IncidentForm({ form, saving, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
      <div className="px-md py-sm bg-surface border-b border-outline-variant">
        <h3 className="font-headline-sm text-headline-sm text-primary">Nueva incidencia</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Los campos marcados con * son obligatorios.</p>
      </div>
      <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md">
        <Field label="Asunto *" value={form.asunto} onChange={value => onChange('asunto', value)} maxLength={160} required />
        <SelectField label="Tipo *" value={form.tipo} onChange={value => onChange('tipo', value)} required>
          <option value="">Selecciona una categoría</option>
          <option>Acceso al sistema</option>
          <option>Equipo</option>
          <option>Red o conectividad</option>
          <option>Software</option>
          <option>Seguridad</option>
          <option>Otro</option>
        </SelectField>
        <SelectField label="Prioridad" value={form.prioridad} onChange={value => onChange('prioridad', value)}>
          <option>Normal</option>
          <option>Alta</option>
          <option>Crítica</option>
        </SelectField>
        <Field label="Ubicación o área" value={form.ubicacion} onChange={value => onChange('ubicacion', value)} maxLength={200} />
        <div className="md:col-span-2">
          <TextArea label="Descripción *" value={form.descripcion} onChange={value => onChange('descripcion', value)} maxLength={4000} required rows={5} />
        </div>
        <div className="md:col-span-2">
          <Field label="URL de evidencia (opcional)" type="url" value={form.evidencia_url} onChange={value => onChange('evidencia_url', value)} maxLength={1000} placeholder="https://..." />
        </div>
      </div>
      <div className="px-md py-sm bg-surface border-t border-outline-variant flex justify-end">
        <button disabled={saving} className="h-11 px-lg rounded-lg bg-primary text-on-primary font-label-lg text-label-lg disabled:opacity-50">
          {saving ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </div>
    </form>
  )
}

function IncidentDetail({ incident, followUp, saving, onFollowUpChange, onFollowUpSubmit }) {
  const history = incident.seguimientos || []
  const isClosed = ['cerrada', 'cerrado'].includes(String(incident.estatus || incident.estado || '').toLowerCase())

  return (
    <div>
      <div className="p-md bg-surface border-b border-outline-variant">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-sm">
          <div>
            <p className="font-code-md text-primary font-semibold">{incident.folio || `INC-${incident.id_incidencia}`}</p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-xs">{incident.asunto || incident.tipo}</h3>
          </div>
          <StatusBadge value={incident.estatus || incident.estado} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mt-md">
          <Detail label="Tipo" value={incident.tipo} />
          <Detail label="Prioridad" value={incident.prioridad || 'Normal'} />
          <Detail label="Ubicación" value={incident.ubicacion || 'No especificada'} />
          <Detail label="Fecha" value={formatDate(incidentDate(incident))} />
        </div>
      </div>

      <div className="p-md border-b border-outline-variant">
        <h4 className="font-label-lg text-label-lg text-primary">Descripción</h4>
        <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap mt-xs">{incident.descripcion || 'Sin descripción.'}</p>
        {incident.evidencia_url && (
          <a href={incident.evidencia_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-xs text-secondary font-label-md text-label-md mt-sm hover:underline">
            <span className="material-symbols-outlined text-[17px]">attachment</span>
            Abrir evidencia
          </a>
        )}
      </div>

      <div className="p-md">
        <h4 className="font-label-lg text-label-lg text-primary mb-md">Historial de seguimiento</h4>
        <div className="space-y-sm max-h-[280px] overflow-y-auto pr-xs">
          {history.length === 0 && <p className="font-body-md text-body-md text-on-surface-variant">Aún no hay seguimientos.</p>}
          {history.map(item => (
            <article key={item.id_seguimiento} className="border border-outline-variant rounded-lg p-sm bg-surface">
              <div className="flex items-center justify-between gap-sm">
                <span className="font-label-md text-label-md text-primary">{item.autor_email}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{formatDate(item.created_at)}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap mt-xs">{item.comentario}</p>
            </article>
          ))}
        </div>

        {!isClosed && (
          <form onSubmit={onFollowUpSubmit} className="mt-md border-t border-outline-variant pt-md">
            <TextArea label="Agregar seguimiento" value={followUp} onChange={onFollowUpChange} maxLength={3000} required rows={3} placeholder="Escribe información adicional sobre la incidencia..." />
            <div className="flex justify-end mt-sm">
              <button disabled={saving || !followUp.trim()} className="h-10 px-md rounded-lg bg-secondary text-on-secondary font-label-md text-label-md disabled:opacity-50">
                {saving ? 'Guardando...' : 'Agregar seguimiento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required = false, type = 'text', ...props }) {
  return (
    <label className="flex flex-col gap-xs font-label-md text-label-md text-on-surface-variant">
      {label}
      <input type={type} value={value} onChange={event => onChange(event.target.value)} required={required} className="h-11 px-sm bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md outline-none focus:border-primary" {...props} />
    </label>
  )
}

function SelectField({ label, value, onChange, required = false, children }) {
  return (
    <label className="flex flex-col gap-xs font-label-md text-label-md text-on-surface-variant">
      {label}
      <select value={value} onChange={event => onChange(event.target.value)} required={required} className="h-11 px-sm bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md outline-none focus:border-primary">
        {children}
      </select>
    </label>
  )
}

function TextArea({ label, value, onChange, required = false, ...props }) {
  return (
    <label className="flex flex-col gap-xs font-label-md text-label-md text-on-surface-variant">
      {label}
      <textarea value={value} onChange={event => onChange(event.target.value)} required={required} className="p-sm bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md outline-none focus:border-primary resize-y" {...props} />
    </label>
  )
}

function StatusBadge({ value = 'Abierta' }) {
  const status = String(value || 'Abierta')
  const normalized = status.toLowerCase()
  const tone = normalized.includes('resuelt') || normalized.includes('cerrad')
    ? 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]'
    : normalized.includes('proceso')
      ? 'bg-primary-fixed text-primary border-primary-fixed-variant'
      : 'bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]'
  return <span className={`inline-flex self-start px-2 py-1 rounded-full border text-[10px] font-bold uppercase whitespace-nowrap ${tone}`}>{status}</span>
}

function Detail({ label, value }) {
  return <div><p className="font-label-md text-label-md text-on-surface-variant">{label}</p><p className="font-body-md text-body-md text-on-surface mt-xs">{value}</p></div>
}

function EmptyState({ icon, text, large = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center text-on-surface-variant p-lg ${large ? 'min-h-[420px]' : 'min-h-[150px]'}`}>
      <span className="material-symbols-outlined text-[36px] mb-sm">{icon}</span>
      <p className="font-body-md text-body-md max-w-sm">{text}</p>
    </div>
  )
}

function Message({ tone, children }) {
  const className = tone === 'error'
    ? 'bg-error-container text-on-error-container border-error'
    : 'bg-[#ecfdf3] text-[#166534] border-[#bbf7d0]'
  return <div className={`border rounded-lg p-sm font-body-md text-body-md ${className}`}>{children}</div>
}
