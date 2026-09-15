/**
 * emailService.js
 * Envío de correos via EmailJS (sin backend).
 *
 * Configuración:  /notifications  (NotificationSettings.jsx)
 * Documentación:  https://www.emailjs.com/docs/
 *
 * Template variables esperadas en EmailJS:
 *   {{to_email}}        — Correo del destinatario
 *   {{to_name}}         — Nombre del destinatario
 *   {{plant_name}}      — Nombre de la planta
 *   {{session_date}}    — Fecha del turno  (ej. 2026-05-22)
 *   {{session_hours}}   — Horario          (ej. 07:00 – 15:00)
 *   {{duration}}        — Duración         (ej. 8 h)
 *   {{employee_count}}  — Número de empleados
 *   {{employee_list}}   — Lista de empleados formateada
 *   {{checkin_url}}     — URL del check-in
 *   {{generated_at}}    — Fecha y hora de generación
 *   {{employee_name}}   — (check-in/out) Nombre del empleado
 *   {{employee_id}}     — (check-in/out) ID del empleado
 *   {{employee_role}}   — (check-in/out) Rol del empleado
 *   {{checkin_time}}    — (check-in) Hora de entrada
 *   {{checkout_time}}   — (check-out) Hora de salida
 *   {{activity_tags}}   — (check-out) Tags de actividad
 *   {{activity_desc}}   — (check-out) Descripción del trabajo
 */

import emailjs from '@emailjs/browser'

const CONFIG_KEY = 'notif_email_config:v1'
const CONFIG_KEY_LEGACY = 'notif_email_config'

// ── Configuración guardada ────────────────────────────────────────────────────

function readStoredConfig() {
  try {
    const current = localStorage.getItem(CONFIG_KEY)
    if (current) return JSON.parse(current)

    const legacy = localStorage.getItem(CONFIG_KEY_LEGACY)
    if (!legacy) return {}

    const parsed = JSON.parse(legacy)
    localStorage.setItem(CONFIG_KEY, JSON.stringify(parsed))
    localStorage.removeItem(CONFIG_KEY_LEGACY)
    return parsed
  } catch {
    return {}
  }
}

export function getEmailConfig() {
  return readStoredConfig()
}

export function saveEmailConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function isEmailConfigured() {
  const c = getEmailConfig()
  return !!(c.serviceId && c.templateId && c.publicKey && c.hrEmails?.length)
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function calcDuration(shift = '') {
  // shift format: "HH:MM – HH:MM"
  const match = shift.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/)
  if (!match) return ''
  const [sh, sm] = match[1].split(':').map(Number)
  const [eh, em] = match[2].split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

async function sendToAll(templateParams) {
  const { serviceId, templateId, publicKey, hrEmails } = getEmailConfig()
  const results = []
  for (const email of hrEmails) {
    const res = await emailjs.send(
      serviceId,
      templateId,
      { ...templateParams, to_email: email },
      { publicKey }
    )
    results.push(res)
  }
  return results
}

// ── Tipos de notificación ─────────────────────────────────────────────────────

/**
 * Envía notificación cuando el supervisor genera un pase QR.
 * @param {{ session, employees, qrDataUrl }} params
 */
export async function sendQRGeneratedEmail({ session, employees, qrDataUrl = '' }) {
  const config = getEmailConfig()
  if (!config.notifications?.onQRGenerated) return   // desactivado
  if (!isEmailConfigured()) throw new Error('Email no configurado. Ve a Notificaciones → Configurar.')

  const employeeList = employees
    .map((e, i) => `${i + 1}. ${e.name} (${e.id}) — ${e.role}`)
    .join('<br>')

  const checkInUrl = `${window.location.origin}/checkin?session=${session.token}`

  return sendToAll({
    to_name:        'Equipo de RH',
    plant_name:     'Plant Alpha-4',
    session_date:   session.date,
    session_hours:  session.shift,
    duration:       calcDuration(session.shift),
    employee_count: String(employees.length),
    employee_list:  employeeList,
    checkin_url:    checkInUrl,
    qr_image:       qrDataUrl,   // base64 PNG — usado en <img src="{{qr_image}}">
    generated_at:   new Date().toLocaleString('es-MX', {
      dateStyle: 'full', timeStyle: 'short',
    }),
  })
}

/**
 * Envía notificación de check-in de un empleado.
 * @param {{ employee, checkinTime }} params
 */
export async function sendCheckInEmail({ employee, checkinTime }) {
  const config = getEmailConfig()
  if (!config.notifications?.onCheckIn) return
  if (!isEmailConfigured()) return   // silencioso en check-in

  return sendToAll({
    to_name:        'Equipo de RH',
    plant_name:     'Plant Alpha-4',
    employee_name:  employee.name,
    employee_id:    employee.id,
    employee_role:  employee.role,
    checkin_time:   checkinTime,
    session_date:   new Date().toLocaleDateString('es-MX'),
    generated_at:   new Date().toLocaleString('es-MX', { timeStyle: 'short', dateStyle: 'medium' }),
    // Campos no usados en esta plantilla — dejarlos vacíos
    session_hours:  '',
    duration:       '',
    employee_count: '',
    employee_list:  '',
    checkin_url:    '',
    checkout_time:  '',
    activity_tags:  '',
    activity_desc:  '',
  })
}

/**
 * Envía notificación de check-out de un empleado.
 * @param {{ employee, checkinTime, checkoutTime, tags, description }} params
 */
export async function sendCheckOutEmail({ employee, checkinTime, checkoutTime, tags = [], description = '' }) {
  const config = getEmailConfig()
  if (!config.notifications?.onCheckOut) return
  if (!isEmailConfigured()) return

  return sendToAll({
    to_name:        'Equipo de RH',
    plant_name:     'Plant Alpha-4',
    employee_name:  employee.name,
    employee_id:    employee.id,
    employee_role:  employee.role,
    checkin_time:   checkinTime,
    checkout_time:  checkoutTime,
    activity_tags:  tags.join(', ') || 'Sin etiquetas',
    activity_desc:  description || 'Sin descripción',
    session_date:   new Date().toLocaleDateString('es-MX'),
    generated_at:   new Date().toLocaleString('es-MX', { timeStyle: 'short', dateStyle: 'medium' }),
    session_hours:  '',
    duration:       '',
    employee_count: '',
    employee_list:  '',
    checkin_url:    '',
  })
}

/**
 * Envía un correo de prueba para verificar la configuración.
 */
export async function sendTestEmail() {
  const { serviceId, templateId, publicKey, hrEmails } = getEmailConfig()
  if (!serviceId || !templateId || !publicKey || !hrEmails?.length) {
    throw new Error('Completa todos los campos de configuración primero.')
  }

  return emailjs.send(
    serviceId,
    templateId,
    {
      to_email:       hrEmails[0],
      to_name:        'Equipo de RH',
      plant_name:     'Plant Alpha-4 (TEST)',
      session_date:   new Date().toLocaleDateString('es-MX'),
      session_hours:  '07:00 – 15:00',
      duration:       '8 h',
      employee_count: '3',
      employee_list:  'Ana García (OP-3812) — Supervisora\nCarlos Rodríguez (MT-2205) — Técnico\nLaura Martínez (OP-5514) — Operadora',
      checkin_url:    window.location.origin + '/checkin',
      generated_at:   new Date().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' }),
      employee_name:  'Empleado de Prueba',
      employee_id:    'OP-0000',
      employee_role:  'Prueba de sistema',
      checkin_time:   '08:00',
      checkout_time:  '16:00',
      activity_tags:  'mantenimiento preventivo, inspección',
      activity_desc:  'Este es un correo de prueba del sistema Industrial Ops.',
    },
    { publicKey }
  )
}
