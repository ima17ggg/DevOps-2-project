import { Socket, Channel } from 'phoenix'
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'

export const BACKGROUND_LOCATION_TASK = 'RTLS_BACKGROUND_LOCATION_TASK'

export interface EmployeeSession {
  token: string
  apiHost: string // ej. "192.168.1.50"
  employee: {
    id_empleado: number
    id_externo: string
    name: string
    role: string
    plant: string
    qr_code: string
    qr_image: string | null
  }
}

let currentSession: EmployeeSession | null = null
let phoenixSocket: Socket | null = null
let rtlsChannel: Channel | null = null

export function setEmployeeSession(session: EmployeeSession | null) {
  currentSession = session
}

export function getEmployeeSession(): EmployeeSession | null {
  return currentSession
}

export function getExpressBaseUrl(host?: string) {
  const cleanHost = (host || currentSession?.apiHost || 'localhost').trim()
  return `http://${cleanHost}:3000/api`
}

export function getPhoenixHttpUrl(host?: string) {
  const cleanHost = (host || currentSession?.apiHost || 'localhost').trim()
  return `http://${cleanHost}:4000/api/rtls`
}

export function getPhoenixWsUrl(host?: string) {
  const cleanHost = (host || currentSession?.apiHost || 'localhost').trim()
  return `ws://${cleanHost}:4000/socket`
}

/**
 * Abre la conexión WebSocket con Phoenix Channels para el envío en primer plano (cada 1-2 s)
 */
export function connectRtlsSocket(onStatusChange?: (connected: boolean) => void): Channel | null {
  if (!currentSession) return null

  if (rtlsChannel && rtlsChannel.state === 'joined') {
    onStatusChange?.(true)
    return rtlsChannel
  }

  disconnectRtlsSocket()

  phoenixSocket = new Socket(getPhoenixWsUrl(), {
    params: { token: currentSession.token },
  })

  phoenixSocket.onOpen(() => onStatusChange?.(true))
  phoenixSocket.onClose(() => onStatusChange?.(false))
  phoenixSocket.onError(() => onStatusChange?.(false))
  phoenixSocket.connect()

  const { id_empleado, name, role } = currentSession.employee
  rtlsChannel = phoenixSocket.channel('rtls:locations', {
    employeeId: id_empleado,
    name,
    role,
  })

  rtlsChannel
    .join()
    .receive('ok', () => onStatusChange?.(true))
    .receive('error', () => onStatusChange?.(false))

  return rtlsChannel
}

export function disconnectRtlsSocket() {
  if (currentSession) {
    const empId = currentSession.employee.id_empleado
    if (rtlsChannel && rtlsChannel.state === 'joined') {
      try {
        rtlsChannel.push('location:stop', { employeeId: empId })
      } catch {
        // Ignorar errores al cerrar canal
      }
    }
    fetch(`${getPhoenixHttpUrl()}/locations/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: empId }),
    }).catch(() => {})
  }

  if (rtlsChannel) {
    rtlsChannel.leave()
    rtlsChannel = null
  }
  if (phoenixSocket) {
    phoenixSocket.disconnect()
    phoenixSocket = null
  }
}

/**
 * Envía ubicación en primer plano por WebSocket (y si el socket aún no está listo, por HTTP POST)
 */
export async function pushLocationRealtime(
  lat: number,
  lng: number,
  accuracy: number | null
): Promise<{ inside_geofence?: boolean; distance_meters?: number } | null> {
  if (!currentSession) return null

  const payload = {
    employeeId: currentSession.employee.id_empleado,
    name: currentSession.employee.name,
    role: currentSession.employee.role,
    lat,
    lng,
    accuracy,
  }

  if (rtlsChannel && rtlsChannel.state === 'joined') {
    return new Promise((resolve) => {
      rtlsChannel!
        .push('location:push', payload)
        .receive('ok', (resp: any) => resolve(resp))
        .receive('error', () => resolve(null))
        .receive('timeout', () => resolve(null))
    })
  }

  // Fallback HTTP hacia Phoenix (:4000/api/rtls/locations)
  try {
    const res = await fetch(`${getPhoenixHttpUrl()}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

/**
 * Tarea en segundo plano (cuando el usuario minimiza la app o bloquea pantalla).
 * Como el SO suspende el WebSocket en background, enviamos cada lectura por HTTP POST
 * directo a Phoenix (:4000/api/rtls/locations), que lo retransmite al PubSub del mapa.
 */
if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data || !currentSession) return

    const { locations } = data as { locations: Location.LocationObject[] }
    if (!Array.isArray(locations) || locations.length === 0) return

    const latest = locations[locations.length - 1]
    try {
      await fetch(`${getPhoenixHttpUrl()}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentSession.employee.id_empleado,
          name: currentSession.employee.name,
          role: currentSession.employee.role,
          lat: latest.coords.latitude,
          lng: latest.coords.longitude,
          accuracy: latest.coords.accuracy,
        }),
      })
    } catch {
      // Ignorar errores de red transitorios en segundo plano
    }
  })
}
