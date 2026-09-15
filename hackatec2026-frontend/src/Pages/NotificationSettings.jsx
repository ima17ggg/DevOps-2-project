import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmailConfig, saveEmailConfig, sendTestEmail } from '../services/emailService'

// ── Plantilla de EmailJS lista para copiar ────────────────────────────────────
const EMAIL_TEMPLATE = `Hola {{to_name}},

Se ha generado un nuevo pase QR de acceso para {{plant_name}}.

📅 Fecha: {{session_date}}
⏰ Horario: {{session_hours}} ({{duration}})
👥 Empleados autorizados ({{employee_count}}):
{{employee_list}}

🔗 URL de check-in:
{{checkin_url}}

Generado el: {{generated_at}}

---
Sistema Industrial Ops — Notificación automática`

const TEMPLATE_VARS = [
  { v: '{{to_email}}',       desc: 'Correo del destinatario' },
  { v: '{{to_name}}',        desc: 'Nombre del destinatario' },
  { v: '{{plant_name}}',     desc: 'Nombre de la planta' },
  { v: '{{session_date}}',   desc: 'Fecha del turno' },
  { v: '{{session_hours}}',  desc: 'Horario (07:00 – 15:00)' },
  { v: '{{duration}}',       desc: 'Duración del turno' },
  { v: '{{employee_count}}', desc: 'Número de empleados' },
  { v: '{{employee_list}}',  desc: 'Lista de empleados (nombre, id, rol)' },
  { v: '{{checkin_url}}',    desc: 'URL de acceso al check-in' },
  { v: '{{generated_at}}',   desc: 'Fecha y hora de generación' },
  { v: '{{employee_name}}',  desc: 'Empleado (check-in / check-out)' },
  { v: '{{checkin_time}}',   desc: 'Hora de entrada del empleado' },
  { v: '{{checkout_time}}',  desc: 'Hora de salida del empleado' },
  { v: '{{activity_tags}}',  desc: 'Tags de actividad (check-out)' },
  { v: '{{activity_desc}}',  desc: 'Descripción de actividad (check-out)' },
]

export default function NotificationSettings() {
  const navigate  = useNavigate()
  const saved     = getEmailConfig()

  // ── Formulario ───────────────────────────────────────────────────────────
  const [serviceId,   setServiceId]   = useState(saved.serviceId   ?? '')
  const [templateId,  setTemplateId]  = useState(saved.templateId  ?? '')
  const [publicKey,   setPublicKey]   = useState(saved.publicKey   ?? '')
  const [hrEmails,    setHrEmails]    = useState(saved.hrEmails    ?? [])
  const [newEmail,    setNewEmail]    = useState('')
  const [notifications, setNotifications] = useState({
    onQRGenerated: saved.notifications?.onQRGenerated ?? true,
    onCheckIn:     saved.notifications?.onCheckIn     ?? false,
    onCheckOut:    saved.notifications?.onCheckOut    ?? false,
  })

  // ── Estado UI ────────────────────────────────────────────────────────────
  const [saveStatus,    setSaveStatus]   = useState('')   // '' | 'saved' | 'error'
  const [testStatus,    setTestStatus]   = useState('')   // '' | 'sending' | 'ok' | 'error'
  const [testError,     setTestError]    = useState('')
  const [showGuide,     setShowGuide]    = useState(false)
  const [copiedTpl,     setCopiedTpl]    = useState(false)
  const [showPasswords, setShowPasswords]= useState(false)
  const emailInputRef = useRef(null)

  // ── Emails de RH ─────────────────────────────────────────────────────────
  function addEmail() {
    const e = newEmail.trim().toLowerCase()
    if (!e || !e.includes('@') || hrEmails.includes(e)) return
    setHrEmails(prev => [...prev, e])
    setNewEmail('')
    emailInputRef.current?.focus()
  }

  function removeEmail(e) {
    setHrEmails(prev => prev.filter(x => x !== e))
  }

  function handleEmailKeyDown(ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); addEmail() }
  }

  // ── Guardar ──────────────────────────────────────────────────────────────
  function handleSave() {
    saveEmailConfig({ serviceId, templateId, publicKey, hrEmails, notifications })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  // ── Prueba ───────────────────────────────────────────────────────────────
  async function handleTest() {
<<<<<<< HEAD
    handleSave()
=======
    handleSave()   // guarda primero para que sendTestEmail use los datos actuales
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
    setTestStatus('sending')
    setTestError('')
    try {
      await sendTestEmail()
      setTestStatus('ok')
      setTimeout(() => setTestStatus(''), 4000)
    } catch (err) {
      setTestStatus('error')
      setTestError(err?.text ?? err?.message ?? 'Error desconocido')
    }
  }

  // ── Copiar plantilla ─────────────────────────────────────────────────────
  function copyTemplate() {
    navigator.clipboard.writeText(EMAIL_TEMPLATE).then(() => {
      setCopiedTpl(true)
      setTimeout(() => setCopiedTpl(false), 2500)
    })
  }

  const isConfigured = serviceId && templateId && publicKey && hrEmails.length > 0

<<<<<<< HEAD
=======
  // ────────────────────────────────────────────────────────────────────────
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#e0e3e5] px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[#041632] text-[13px] font-semibold hover:text-[#964900] transition-colors cursor-pointer"
          >
<<<<<<< HEAD
            <span translate="no" className="material-symbols-outlined notranslate text-[18px]">arrow_back</span>
=======
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            Dashboard
          </button>
          <div className="h-5 w-px bg-[#e0e3e5]" />
          <div className="flex items-center gap-2">
<<<<<<< HEAD
            <span translate="no" className="material-symbols-outlined notranslate text-[#964900] text-[20px]">notifications</span>
=======
            <span className="material-symbols-outlined text-[#964900] text-[20px]">notifications</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            <div>
              <p className="text-[#041632] text-[13px] font-bold leading-none">Notificaciones por correo</p>
              <p className="text-[#75777e] text-[11px] mt-0.5">Configura alertas automáticas para RH</p>
            </div>
          </div>
        </div>

        {/* Estado de guardado */}
        <div className="flex items-center gap-2.5">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-[#15803d] text-[12px] font-semibold animate-in fade-in">
<<<<<<< HEAD
              <span translate="no" className="material-symbols-outlined notranslate text-[16px]"
=======
              <span className="material-symbols-outlined text-[16px]"
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Configuración guardada
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 bg-[#041632] hover:bg-[#1b2b48] text-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
<<<<<<< HEAD
            <span translate="no" className="material-symbols-outlined notranslate text-[15px]">save</span>
=======
            <span className="material-symbols-outlined text-[15px]">save</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            Guardar
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <div className="flex-1 p-5 lg:p-8 max-w-[820px] w-full mx-auto flex flex-col gap-6">

        {/* Banner de estado general */}
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 border ${
          isConfigured
            ? 'bg-[#f0fdf4] border-[#bbf7d0]'
            : 'bg-[#fffbeb] border-[#fde68a]'
        }`}>
          <span
<<<<<<< HEAD
            translate="no"
            className={`material-symbols-outlined notranslate text-[22px] ${isConfigured ? 'text-[#15803d]' : 'text-[#92400e]'}`}
=======
            className={`material-symbols-outlined text-[22px] ${isConfigured ? 'text-[#15803d]' : 'text-[#92400e]'}`}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isConfigured ? 'check_circle' : 'warning'}
          </span>
          <div>
            <p className={`text-[13px] font-bold ${isConfigured ? 'text-[#15803d]' : 'text-[#92400e]'}`}>
              {isConfigured ? 'Sistema de correo configurado y activo' : 'Configuración incompleta'}
            </p>
            <p className={`text-[12px] ${isConfigured ? 'text-[#166534]' : 'text-[#b45309]'}`}>
              {isConfigured
                ? `Enviando a ${hrEmails.length} destinatario${hrEmails.length > 1 ? 's' : ''} · EmailJS conectado`
                : 'Completa los campos de EmailJS y agrega al menos un correo de RH'}
            </p>
          </div>
        </div>

        {/* ══════════ SECCIÓN 1 — ¿Qué notificar? ══════════ */}
        <Card
          icon="tune"
          title="¿Cuándo enviar notificaciones?"
          subtitle="Elige los eventos que generan un correo automático"
        >
          <div className="flex flex-col gap-3">
            <Toggle
              icon="qr_code_2"
              label="QR de turno generado"
              description="Se envía un correo con la lista de empleados y el enlace de acceso cada vez que el supervisor genera un pase."
              checked={notifications.onQRGenerated}
              onChange={v => setNotifications(n => ({ ...n, onQRGenerated: v }))}
              accent="#041632"
            />
            <Toggle
              icon="login"
              label="Registro de entrada (check-in)"
              description="Se notifica cada vez que un empleado confirma su entrada a planta."
              checked={notifications.onCheckIn}
              onChange={v => setNotifications(n => ({ ...n, onCheckIn: v }))}
              accent="#15803d"
            />
            <Toggle
              icon="logout"
              label="Registro de salida (check-out)"
              description="Se notifica cuando un empleado cierra su turno, incluyendo el reporte de actividades."
              checked={notifications.onCheckOut}
              onChange={v => setNotifications(n => ({ ...n, onCheckOut: v }))}
              accent="#964900"
            />
          </div>
        </Card>

        {/* ══════════ SECCIÓN 2 — Destinatarios ══════════ */}
        <Card
          icon="group"
          title="Destinatarios de RH"
          subtitle="Correos que recibirán las notificaciones automáticas"
        >
          {/* Chips de correos actuales */}
          {hrEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {hrEmails.map(email => (
                <span
                  key={email}
                  className="flex items-center gap-1.5 bg-[#041632]/[0.07] border border-[#041632]/20 text-[#041632] text-[12px] font-semibold px-3 py-1.5 rounded-full"
                >
<<<<<<< HEAD
                  <span translate="no" className="material-symbols-outlined notranslate text-[13px]">alternate_email</span>
                  <span translate="no" className="notranslate">{email}</span>
=======
                  <span className="material-symbols-outlined text-[13px]">alternate_email</span>
                  {email}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  <button
                    onClick={() => removeEmail(email)}
                    className="ml-0.5 hover:text-[#b91c1c] transition-colors cursor-pointer"
                    aria-label={`Eliminar ${email}`}
                  >
<<<<<<< HEAD
                    <span translate="no" className="material-symbols-outlined notranslate text-[14px]">close</span>
=======
                    <span className="material-symbols-outlined text-[14px]">close</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Agregar nuevo correo */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
<<<<<<< HEAD
              <span translate="no" className="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-[#75777e] text-[17px]">
=======
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#75777e] text-[17px]">
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                mail
              </span>
              <input
                ref={emailInputRef}
                type="email"
                placeholder="correo@empresa.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                className="w-full h-10 bg-white border border-[#c5c6ce] rounded-lg pl-9 pr-3 text-[13px] text-[#041632] placeholder-[#adb0b7] focus:outline-none focus:border-[#041632] transition-colors"
              />
            </div>
            <button
              onClick={addEmail}
              disabled={!newEmail.trim() || !newEmail.includes('@')}
              className="h-10 px-4 bg-[#041632] hover:bg-[#1b2b48] disabled:bg-[#c5c6ce] disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
<<<<<<< HEAD
              <span translate="no" className="material-symbols-outlined notranslate text-[16px]">add</span>
=======
              <span className="material-symbols-outlined text-[16px]">add</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
              Agregar
            </button>
          </div>
          <p className="text-[11px] text-[#75777e] mt-2">
            Presiona Enter o el botón Agregar. Puedes añadir varios correos.
          </p>
        </Card>

        {/* ══════════ SECCIÓN 3 — Configuración EmailJS ══════════ */}
        <Card
          icon="settings"
          title="Configuración EmailJS"
          subtitle="Credenciales de tu cuenta en emailjs.com"
          action={
            <button
              onClick={() => setShowGuide(g => !g)}
              className="flex items-center gap-1 text-[12px] font-semibold text-[#964900] hover:underline cursor-pointer"
            >
<<<<<<< HEAD
              <span translate="no" className="material-symbols-outlined notranslate text-[15px]">help</span>
=======
              <span className="material-symbols-outlined text-[15px]">help</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
              {showGuide ? 'Ocultar guía' : '¿Cómo configurar?'}
            </button>
          }
        >
          {/* Guía paso a paso */}
          {showGuide && (
            <div className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl p-4 mb-4 flex flex-col gap-3">
              <p className="text-[#041632] text-[12px] font-bold flex items-center gap-1.5">
<<<<<<< HEAD
                <span translate="no" className="material-symbols-outlined notranslate text-[15px] text-[#964900]">info</span>
=======
                <span className="material-symbols-outlined text-[15px] text-[#964900]">info</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                Pasos para configurar EmailJS (gratis, 200 correos/mes)
              </p>
              <ol className="flex flex-col gap-2 text-[12px] text-[#44474d] list-none">
                {[
                  {
                    id: 'create-account',
<<<<<<< HEAD
                    content: <>Crea tu cuenta en <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-[#964900] font-semibold hover:underline" translate="no">emailjs.com</a></>,
=======
                    content: <>Crea tu cuenta en <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-[#964900] font-semibold hover:underline">emailjs.com</a></>,
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  },
                  {
                    id: 'email-services',
                    content: 'En "Email Services", conecta tu cuenta de Gmail u Outlook → copia el Service ID.',
                  },
                  {
                    id: 'email-templates',
                    content: 'En "Email Templates", crea una plantilla usando las variables de abajo → copia el Template ID.',
                  },
                  {
                    id: 'api-keys',
                    content: 'En "Account > API Keys", copia tu Public Key.',
                  },
                  {
                    id: 'paste-values',
                    content: 'Pega los tres valores aquí, agrega los correos de RH y guarda.',
                  },
                ].map((step, i) => (
                  <li key={step.id} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#041632] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step.content}</span>
                  </li>
                ))}
              </ol>

              {/* Plantilla de texto */}
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-[#75777e] uppercase tracking-wide">
                    Plantilla de correo — pega esto en EmailJS
                  </p>
                  <button
                    onClick={copyTemplate}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer
                      ${copiedTpl ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-white border border-[#c5c6ce] text-[#041632] hover:bg-[#f2f4f6]'}`}
                  >
<<<<<<< HEAD
                    <span translate="no" className="material-symbols-outlined notranslate text-[13px]">{copiedTpl ? 'check' : 'content_copy'}</span>
                    {copiedTpl ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                {/* BLINDAJE: Código de la plantilla de correo */}
                <pre translate="no" className="bg-[#1e2937] text-[#c9d8e8] text-[11px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre-wrap notranslate">
=======
                    <span className="material-symbols-outlined text-[13px]">{copiedTpl ? 'check' : 'content_copy'}</span>
                    {copiedTpl ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-[#1e2937] text-[#c9d8e8] text-[11px] p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre-wrap">
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  {EMAIL_TEMPLATE}
                </pre>
              </div>

              {/* Variables disponibles */}
              <details className="mt-1">
                <summary className="text-[11px] font-bold text-[#75777e] uppercase tracking-wide cursor-pointer select-none">
                  Variables disponibles ({TEMPLATE_VARS.length})
                </summary>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {TEMPLATE_VARS.map(({ v, desc }) => (
                    <div key={v} className="flex items-start gap-2 text-[11px]">
<<<<<<< HEAD
                      {/* BLINDAJE: Variables {{variable}} */}
                      <code translate="no" className="bg-[#e8eaed] text-[#041632] px-1.5 py-0.5 rounded font-mono shrink-0 notranslate">{v}</code>
=======
                      <code className="bg-[#e8eaed] text-[#041632] px-1.5 py-0.5 rounded font-mono shrink-0">{v}</code>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                      <span className="text-[#75777e]">{desc}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Campos de configuración */}
          <div className="flex flex-col gap-3.5">
            <Field
              label="Service ID"
              icon="dns"
              placeholder="service_xxxxxxx"
              value={serviceId}
              onChange={setServiceId}
              show={showPasswords}
            />
            <Field
              label="Template ID"
              icon="description"
              placeholder="template_xxxxxxx"
              value={templateId}
              onChange={setTemplateId}
              show={showPasswords}
            />
            <Field
              label="Public Key"
              icon="key"
              placeholder="xxxxxxxxxxxxxxxxxxxx"
              value={publicKey}
              onChange={setPublicKey}
              show={showPasswords}
              isLast
            />

            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)}
                className="w-4 h-4 accent-[#041632]"
              />
              <span className="text-[12px] text-[#75777e]">Mostrar credenciales</span>
            </label>
          </div>
        </Card>

        {/* ══════════ SECCIÓN 4 — Prueba de conexión ══════════ */}
        <Card
          icon="send"
          title="Probar conexión"
          subtitle="Envía un correo de prueba para verificar que todo funciona"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleTest}
              disabled={testStatus === 'sending' || !isConfigured}
              className="flex items-center gap-2 px-5 h-10 bg-[#041632] hover:bg-[#1b2b48] disabled:bg-[#c5c6ce] disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {testStatus === 'sending' ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
<<<<<<< HEAD
                  <span translate="no" className="material-symbols-outlined notranslate text-[16px]">send</span>
=======
                  <span className="material-symbols-outlined text-[16px]">send</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  Enviar correo de prueba
                </>
              )}
            </button>

            {testStatus === 'ok' && (
              <span className="flex items-center gap-1.5 text-[#15803d] text-[13px] font-semibold">
<<<<<<< HEAD
                <span translate="no" className="material-symbols-outlined notranslate text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ¡Correo enviado a <span translate="no" className="notranslate">{hrEmails[0]}</span>!
=======
                <span className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ¡Correo enviado a {hrEmails[0]}!
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
              </span>
            )}

            {testStatus === 'error' && (
              <div className="flex items-start gap-1.5 text-[#b91c1c] text-[12px] font-semibold">
<<<<<<< HEAD
                <span translate="no" className="material-symbols-outlined notranslate text-[16px] shrink-0"
=======
                <span className="material-symbols-outlined text-[16px] shrink-0"
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                  style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <div>
                  <p>Error al enviar</p>
                  {testError && <p className="font-normal text-[11px] text-[#dc2626] mt-0.5">{testError}</p>}
                </div>
              </div>
            )}
          </div>

          {!isConfigured && (
            <p className="text-[11px] text-[#75777e] mt-2">
              Completa la configuración de EmailJS y agrega al menos un correo de RH para poder probar.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Card({ icon, title, subtitle, children, action }) {
  return (
    <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e0e3e5] bg-[#f7f9fb] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#041632]/[0.08] flex items-center justify-center">
<<<<<<< HEAD
            <span translate="no" className="material-symbols-outlined notranslate text-[#041632] text-[17px]">{icon}</span>
=======
            <span className="material-symbols-outlined text-[#041632] text-[17px]">{icon}</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
          </div>
          <div>
            <p className="text-[#041632] text-[13px] font-bold leading-tight">{title}</p>
            {subtitle && <p className="text-[#75777e] text-[11px] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Toggle({ icon, label, description, checked, onChange, accent }) {
  return (
    <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
      ${checked ? 'border-[#041632]/30 bg-[#041632]/[0.03]' : 'border-[#e0e3e5] bg-[#f7f9fb] hover:border-[#c5c6ce]'}`}>
      {/* Icono */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
           style={{ background: checked ? accent + '15' : '#e8eaed' }}>
<<<<<<< HEAD
        <span translate="no" className="material-symbols-outlined notranslate text-[17px]"
=======
        <span className="material-symbols-outlined text-[17px]"
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
              style={{ color: checked ? accent : '#75777e' }}>{icon}</span>
      </div>
      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-bold ${checked ? 'text-[#041632]' : 'text-[#44474d]'}`}>{label}</p>
        <p className="text-[11px] text-[#75777e] mt-0.5 leading-relaxed">{description}</p>
      </div>
      {/* Switch */}
      <div className="shrink-0 mt-0.5">
        <div
          onClick={() => onChange(!checked)}
          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer
            ${checked ? 'bg-[#041632]' : 'bg-[#c5c6ce]'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all
            ${checked ? 'left-5' : 'left-1'}`} />
        </div>
      </div>
    </label>
  )
}

function Field({ label, icon, placeholder, value, onChange, show, isLast }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#75777e] font-semibold uppercase tracking-wide flex items-center gap-1.5">
<<<<<<< HEAD
        <span translate="no" className="material-symbols-outlined notranslate text-[13px]">{icon}</span>
=======
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
        {label}
      </label>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        className="h-10 border border-[#c5c6ce] rounded-lg px-3 text-[13px] font-mono text-[#041632] bg-[#f7f9fb] focus:outline-none focus:border-[#041632] focus:bg-white transition-colors placeholder-[#adb0b7]"
      />
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
