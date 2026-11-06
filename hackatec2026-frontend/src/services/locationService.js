import { Socket, Presence } from 'phoenix'

const API_BASE = '/api'
const SESSION_KEY = 'gps_session:v1'
let cachedLocations = {}
let phoenixSocket = null
let rtlsChannel = null

// ── Coordenadas del centro de la planta ─────────────────────────────────────
export const PLANT_CENTER = { lat: 25.442251, lng: -100.993114 }

export const OFFLINE_TIMEOUT_MS = 15 * 1000

function normalizeRow(row, isRealtime = false) {
  const empId = row.employee_id ?? row.id_empleado ?? row.id_externo
  if (!empId) return null

  const lat = Number(row.lat ?? row.latitud)
  const lng = Number(row.lng ?? row.longitud)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const fullName =
    row.name ||
    [row.empleados?.nombre, row.empleados?.apellido_paterno].filter(Boolean).join(' ') ||
    `Empleado #${empId}`

  const role = row.role || row.empleados?.roles?.nombre || 'Empleado'
  const rawTs = row.updated_at ?? row.updatedAt
  const updatedAt = isRealtime ? Date.now() : (rawTs ? new Date(rawTs).getTime() : 0)

  const isRecent = updatedAt > 0 && (Date.now() - updatedAt) <= OFFLINE_TIMEOUT_MS
  const online = row.online === false ? false : (isRealtime ? true : (row.online === true && isRecent))

  return {
    id: String(empId),
    lat,
    lng,
    name: fullName,
    role,
    accuracy: row.accuracy ?? null,
    insideGeofence: row.inside_geofence ?? true,
    distanceMeters: row.distance_meters ?? null,
    online,
    updatedAt: updatedAt || Date.now(),
  }
}

export function getOrCreateRtlsChannel(joinParams = {}) {
  if (rtlsChannel) return rtlsChannel

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${window.location.host}/socket`

  phoenixSocket = new Socket(wsUrl, {
    params: { token: localStorage.getItem('auth_token') || '' },
  })
  phoenixSocket.connect()

  rtlsChannel = phoenixSocket.channel('rtls:locations', joinParams)
  return rtlsChannel
}

/**
 * Suscribe el mapa web al canal RTLS de Phoenix en tiempo real (WebSocket).
 */
export function subscribeToRtlsLocations({ onInitialState, onLocationUpdate, onPresenceChange }) {
  const channel = getOrCreateRtlsChannel()
  const presence = new Presence(channel)

  const markEmployeeOffline = (empId) => {
    if (!empId) return
    const key = String(empId)
    if (cachedLocations[key]) {
      cachedLocations[key] = {
        ...cachedLocations[key],
        online: false,
      }
      if (onLocationUpdate) onLocationUpdate(cachedLocations[key], { ...cachedLocations })
    }
  }

  presence.onLeave((id, current) => {
    if (!current || !current.metas || current.metas.length === 0) {
      markEmployeeOffline(id)
    }
  })

  if (onPresenceChange) {
    presence.onSync(() => {
      onPresenceChange(presence.list())
    })
  }

  const updateRef = channel.on('location:update', (payload) => {
    const normalized = normalizeRow(payload, true)
    if (!normalized) return
    cachedLocations[normalized.id] = normalized
    if (onLocationUpdate) onLocationUpdate(normalized, { ...cachedLocations })
  })

  const offlineRef = channel.on('location:offline', (payload) => {
    const empId = payload?.employee_id ?? payload?.id_empleado ?? payload?.id_externo
    markEmployeeOffline(empId)
  })

  if (channel.state !== 'joined' && channel.state !== 'joining') {
    channel
      .join()
      .receive('ok', (resp) => {
        if (Array.isArray(resp?.locations)) {
          for (const item of resp.locations) {
            const norm = normalizeRow(item, false)
            if (norm) cachedLocations[norm.id] = norm
          }
          if (onInitialState) onInitialState({ ...cachedLocations })
        }
      })
      .receive('error', (err) => {
        console.warn('[RTLS WS] Error al unirse al canal rtls:locations:', err)
      })
  }

  return () => {
    channel.off('location:update', updateRef)
    channel.off('location:offline', offlineRef)
  }
}

/**
 * Envía ubicación en tiempo real por WebSocket a Phoenix (con fallback HTTP a /api/rtls/locations).
 */
export async function sendLocation(employeeId, lat, lng, extra = {}) {
  if (!employeeId || !Number.isFinite(lat) || !Number.isFinite(lng)) return

  const payload = {
    employeeId,
    lat,
    lng,
    name: extra.name || 'Empleado',
    role: extra.role || 'Empleado',
    accuracy: extra.accuracy ?? null,
  }

  const channel = getOrCreateRtlsChannel({
    employeeId,
    name: payload.name,
    role: payload.role,
  })

  if (channel.state === 'joined') {
    channel.push('location:push', payload)
    return
  }

  try {
    await fetch(`${API_BASE}/rtls/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
  } catch {
    cachedLocations[employeeId] = {
      id: String(employeeId),
      lat,
      lng,
      name: payload.name,
      role: payload.role,
      updatedAt: Date.now(),
    }
  }
}

export function startTrackingSession(employee) {
  if (!employee?.id) return
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...employee, active: true }))
}

export function stopTrackingSession() {
  const session = getTrackingSession()
  if (!session) return
  if (rtlsChannel && rtlsChannel.state === 'joined' && session.id) {
    rtlsChannel.push('location:stop', { employeeId: session.id })
  }
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
  try {
    // 1. Consultar buffer en memoria de Phoenix + histórico de Express en paralelo
    const [rtlsRes, expressRes] = await Promise.allSettled([
      fetch(`${API_BASE}/rtls/locations`, { credentials: 'include' }),
      fetch(`${API_BASE}/locations`, { credentials: 'include' }),
    ])

    const locations = { ...cachedLocations }

    if (expressRes.status === 'fulfilled' && expressRes.value.ok) {
      const json = await expressRes.value.json()
      if (json?.success && Array.isArray(json.data)) {
        for (const row of json.data) {
          const norm = normalizeRow(row)
          if (norm) locations[norm.id] = norm
        }
      }
    }

    if (rtlsRes.status === 'fulfilled' && rtlsRes.value.ok) {
      const json = await rtlsRes.value.json()
      if (json?.success && Array.isArray(json.data)) {
        for (const row of json.data) {
          const norm = normalizeRow(row)
          if (norm) locations[norm.id] = norm
        }
      }
    }

    cachedLocations = locations
    return locations
  } catch (err) {
    console.warn('[locations] Error al obtener ubicaciones:', err)
    return cachedLocations
  }
}
