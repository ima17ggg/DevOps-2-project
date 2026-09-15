/**
 * qrSessionService.js
 * Gestiona sesiones QR de acceso a planta.
 *
 * Flujo:
 *  1. Supervisor crea sesión → generateQRSession({ employeeIds, date, shift })
 *  2. QR muestra URL: /checkin?session=TOKEN
 *  3. Empleado escanea → CheckIn lee token → busca sesión → vincula dispositivo
 *
 * Reemplazar localStorage por fetch('/api/qr-sessions/...') en producción.
 */

const KEY_SESSIONS = 'qr_sessions:v1'
const KEY_SESSIONS_LEGACY = 'qr_sessions'
const KEY_DEVICES  = 'qr_device_links:v1'
const KEY_DEVICES_LEGACY = 'qr_device_links'

// ── Catálogo de empleados (mock — reemplazar con GET /api/employees) ──────────
export const ALL_EMPLOYEES = [
  { id: 'OP-4921', name: 'Marcus Johnson',   role: 'Operador de Maquinaria',    department: 'Producción',    shift: 'Mañana · 07:00–15:00' },
  { id: 'OP-3812', name: 'Ana García',        role: 'Supervisora de Turno',      department: 'Supervisión',   shift: 'Mañana · 07:00–15:00' },
  { id: 'MT-2205', name: 'Carlos Rodríguez',  role: 'Técnico de Mantenimiento',  department: 'Mantenimiento', shift: 'Mañana · 07:00–15:00' },
  { id: 'OP-5514', name: 'Laura Martínez',    role: 'Operadora de Línea',        department: 'Producción',    shift: 'Tarde  · 15:00–23:00' },
  { id: 'SE-0099', name: 'Jorge Sánchez',     role: 'Seguridad Industrial',      department: 'Seguridad',     shift: 'Mañana · 07:00–15:00' },
  { id: 'OP-6633', name: 'María López',       role: 'Operadora de Proceso',      department: 'Producción',    shift: 'Tarde  · 15:00–23:00' },
  { id: 'MT-3301', name: 'Fernando Torres',   role: 'Técnico Eléctrico',         department: 'Mantenimiento', shift: 'Noche  · 23:00–07:00' },
  { id: 'QA-1100', name: 'Patricia Flores',   role: 'Inspectora de Calidad',     department: 'Calidad',       shift: 'Mañana · 07:00–15:00' },
  { id: 'OP-7742', name: 'Roberto Díaz',      role: 'Operador Senior',           department: 'Producción',    shift: 'Tarde  · 15:00–23:00' },
  { id: 'SE-0112', name: 'Elena Castro',      role: 'Supervisora de Seguridad',  department: 'Seguridad',     shift: 'Noche  · 23:00–07:00' },
  { id: 'OP-8891', name: 'Diego Herrera',     role: 'Operador de Prensa',        department: 'Producción',    shift: 'Mañana · 07:00–15:00' },
  { id: 'MT-4420', name: 'Sofía Mendoza',     role: 'Técnica de Instrumentación',department: 'Mantenimiento', shift: 'Tarde  · 15:00–23:00' },
]

// ── Utilidades internas ───────────────────────────────────────────────────────

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 10).toUpperCase() +
         Math.random().toString(36).slice(2, 10).toUpperCase()
}

function loadSessions() {
  try {
    const current = localStorage.getItem(KEY_SESSIONS)
    if (current) return JSON.parse(current)

    const legacy = localStorage.getItem(KEY_SESSIONS_LEGACY)
    if (!legacy) return {}

    const parsed = JSON.parse(legacy)
    localStorage.setItem(KEY_SESSIONS, JSON.stringify(parsed))
    localStorage.removeItem(KEY_SESSIONS_LEGACY)
    return parsed
  } catch {
    return {}
  }
}

function saveSessions(map) {
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(map))
}

function loadDevices() {
  try {
    const current = localStorage.getItem(KEY_DEVICES)
    if (current) return JSON.parse(current)

    const legacy = localStorage.getItem(KEY_DEVICES_LEGACY)
    if (!legacy) return {}

    const parsed = JSON.parse(legacy)
    localStorage.setItem(KEY_DEVICES, JSON.stringify(parsed))
    localStorage.removeItem(KEY_DEVICES_LEGACY)
    return parsed
  } catch {
    return {}
  }
}

function saveDevices(map) {
  localStorage.setItem(KEY_DEVICES, JSON.stringify(map))
}

// ── Huella del dispositivo (no requiere librería externa) ─────────────────────
export function getDeviceFingerprint() {
  const parts = [
    navigator.userAgent,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.language,
    navigator.hardwareConcurrency ?? 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')

  let h = 0x811c9dc5
  for (let i = 0; i < parts.length; i++) {
    h ^= parts.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(36)
}

// ── CRUD de sesiones ──────────────────────────────────────────────────────────

/**
 * Crea una sesión QR nueva para el turno del día.
 * @param {{ employeeIds: string[], date: string, shift: string }} params
 * @returns {QRSession}
 */
export function createQRSession({ employeeIds, date, shift }) {
  const token   = uid()
  const session = { token, employeeIds, date, shift, plant: 'Alpha-4', createdAt: Date.now() }
  const sessions = loadSessions()
  sessions[token] = session
  saveSessions(sessions)
  // API: await fetch('/api/qr-sessions', { method:'POST', body: JSON.stringify(session) })
  return session
}

/** Obtiene una sesión por token. Devuelve null si no existe. */
export function getQRSession(token) {
  if (!token) return null
  return loadSessions()[token] ?? null
  // API: await fetch(`/api/qr-sessions/${token}`).then(r => r.json())
}

/** Lista las sesiones más recientes (últimas 20). */
export function listQRSessions() {
  return Object.values(loadSessions())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20)
}

// ── Vinculación dispositivo → empleado ───────────────────────────────────────

/**
 * Guarda que este dispositivo pertenece al empleado `employeeId`
 * para la sesión con ese token.
 * Llave compuesta: `fingerprint:token`
 */
export function registerDeviceForEmployee(token, employeeId) {
  const fp  = getDeviceFingerprint()
  const map = loadDevices()
  map[`${fp}:${token}`] = { employeeId, linkedAt: Date.now() }
  saveDevices(map)
  // API: await fetch('/api/qr-sessions/link', { method:'POST', body: JSON.stringify({ token, employeeId, fingerprint: fp }) })
}

/**
 * Devuelve el employeeId vinculado a ESTE dispositivo para el token dado.
 * Retorna null si el dispositivo no está registrado aún para esa sesión.
 */
export function getEmployeeByDevice(token) {
  const fp  = getDeviceFingerprint()
  const map = loadDevices()
  return map[`${fp}:${token}`]?.employeeId ?? null
  // API: await fetch(`/api/qr-sessions/device?token=${token}&fp=${fp}`).then(r => r.json())
}

/** Devuelve los objetos Employee completos de una sesión */
export function getSessionEmployees(token) {
  const session = getQRSession(token)
  if (!session) return []
  return ALL_EMPLOYEES.filter(e => session.employeeIds.includes(e.id))
}
