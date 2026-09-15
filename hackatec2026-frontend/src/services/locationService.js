const API_BASE = '/api'
const LOCATIONS_KEY = 'gps_locations:v1'
const SESSION_KEY = 'gps_session:v1'

// ── Coordenadas del centro de la planta ─────────────────────────────────────
export const PLANT_CENTER = { lat: 25.442251, lng: -100.993114 }

export async function sendLocation(employeeId, lat, lng) {
  if (!employeeId || !Number.isFinite(lat) || !Number.isFinite(lng)) return

  try {
    await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ employeeId, lat, lng }),
    })
  } catch {
    const locations = readStoredLocations()
    locations[employeeId] = { lat, lng, updatedAt: Date.now() }
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations))
  }
}

export function startTrackingSession(employee) {
  if (!employee?.id) return
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...employee, active: true }))
}

export function stopTrackingSession() {
  const session = getTrackingSession()
  if (!session) return
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, active: false }))
}

export function getTrackingSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function getAllLocations() {
  let json
  try {
    const res = await fetch(`${API_BASE}/locations`, { credentials: 'include' })
    if (!res.ok) return readStoredLocations()
    json = await res.json()
  } catch {
    return readStoredLocations()
  }

  if (!json?.success || !Array.isArray(json.data)) return readStoredLocations()

  const locations = {}
  for (const row of json.data) {
    locations[row.id_empleado] = {
      lat: row.latitud,
      lng: row.longitud,
      name: [row.empleados?.nombre, row.empleados?.apellido_paterno].filter(Boolean).join(' '),
      role: row.empleados?.roles?.nombre || 'Empleado',
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    }
  }
  return locations
}

function readStoredLocations() {
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY)
    const locations = raw ? JSON.parse(raw) : {}
    return locations && typeof locations === 'object' ? locations : {}
  } catch {
    return {}
  }
}