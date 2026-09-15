/**
 * locationService.js
 *
 * DEMO: usa localStorage como backend.
 * Para producción, reemplaza cada función con su fetch() correspondiente.
 *
 * Endpoints esperados en el backend:
 *   POST   /api/location          { employeeId, name, role, lat, lng }
 *   DELETE /api/location/:id
 *   GET    /api/locations          → { [id]: { name, role, lat, lng, updatedAt } }
 */

const LOCATIONS_KEY = 'gps_locations:v1'
const LOCATIONS_KEY_LEGACY = 'gps_locations'
const SESSION_KEY   = 'gps_session:v1'
const SESSION_KEY_LEGACY = 'gps_session'

// ── Coordenadas del centro de la planta ─────────────────────────────────────
// Cambia estos valores a las coordenadas reales de tu planta.
// Cómo obtenerlas: Google Maps → click derecho sobre la ubicación → copiar lat,lng
export const PLANT_CENTER = { lat: 19.4326, lng: -99.1332 }

// ── Empleados mock para demo (aparecen en el mapa si no hay GPS real) ────────
const MOCK_LOCATIONS = {
  'OP-4921': { name: 'Marcus Johnson',  role: 'Operador',    lat: 19.43350, lng: -99.13200, updatedAt: Date.now() },
  'SV-1104': { name: 'Sarah Chen',      role: 'Supervisor',  lat: 19.43180, lng: -99.13450, updatedAt: Date.now() - 120000 },
  'TC-8832': { name: 'David Miller',    role: 'Técnico',     lat: 19.43420, lng: -99.13100, updatedAt: Date.now() - 60000 },
  'SF-2290': { name: 'Elena Rodríguez', role: 'Seguridad',   lat: 19.43260, lng: -99.13550, updatedAt: Date.now() - 180000 },
}

// ── Enviar ubicación (empleado → servidor) ───────────────────────────────────
export function sendLocation(employeeId, name, role, lat, lng) {
  // ── PRODUCCIÓN: reemplazar con ──────────────────────────────────────────────
  // return fetch('/api/location', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //   body: JSON.stringify({ employeeId, name, role, lat, lng }),
  // })
  // ──────────────────────────────────────────────────────────────────────────
  const all = readLocations()
  all[employeeId] = { name, role, lat, lng, updatedAt: Date.now() }
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(all))
  console.info(`[GPS] ${name} → ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
}

// ── Eliminar ubicación al hacer checkout ─────────────────────────────────────
export function removeLocation(employeeId) {
  // ── PRODUCCIÓN: reemplazar con ──────────────────────────────────────────────
  // return fetch(`/api/location/${employeeId}`, { method: 'DELETE', ... })
  // ──────────────────────────────────────────────────────────────────────────
  const all = readLocations()
  delete all[employeeId]
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(all))
}

// ── Obtener todas las ubicaciones (dashboard) ────────────────────────────────
export function getAllLocations() {
  // ── PRODUCCIÓN: reemplazar con ──────────────────────────────────────────────
  // const res = await fetch('/api/locations', { headers: { Authorization: `Bearer ${token}` } })
  // return res.json()
  // ──────────────────────────────────────────────────────────────────────────
  const stored = readLocations()
  // Si no hay datos reales, usar mock para demo
  return Object.keys(stored).length > 0 ? stored : MOCK_LOCATIONS
}

// ── Sesión de tracking (persiste entre navegaciones) ────────────────────────
export function startTrackingSession(employee) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...employee, active: true }))
}

export function stopTrackingSession() {
  const session = getTrackingSession()
  if (session) {
    removeLocation(session.id)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, active: false }))
  }
}

export function getTrackingSession() {
  try {
    const current = localStorage.getItem(SESSION_KEY)
    if (current) return JSON.parse(current)

    const legacy = localStorage.getItem(SESSION_KEY_LEGACY)
    if (!legacy) return null

    const parsed = JSON.parse(legacy)
    localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
    localStorage.removeItem(SESSION_KEY_LEGACY)
    return parsed
  } catch {
    return null
  }
}

// ── Helpers internos ─────────────────────────────────────────────────────────
function readLocations() {
  try {
    const current = localStorage.getItem(LOCATIONS_KEY)
    if (current) return JSON.parse(current)

    const legacy = localStorage.getItem(LOCATIONS_KEY_LEGACY)
    if (!legacy) return {}

    const parsed = JSON.parse(legacy)
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(parsed))
    localStorage.removeItem(LOCATIONS_KEY_LEGACY)
    return parsed
  } catch {
    return {}
  }
}
