import { useEffect, useRef } from 'react'
import { sendLocation, getOrCreateRtlsChannel } from '../services/locationService'

/**
 * Hook RTLS que rastrea la posición GPS en tiempo real continuo con watchPosition
 * y transmite cada cambio por WebSocket al canal Phoenix (rtls:locations).
 *
 * @param {object} params
 * @param {string}  params.employeeId - ID único del empleado
 * @param {string}  params.name       - Nombre completo
 * @param {string}  params.role       - Rol / puesto
 * @param {boolean} params.active     - Si false, el tracking se detiene
 */
export function useGeoTracker({ employeeId, name, role, active }) {
  const watchIdRef = useRef(null)

  useEffect(() => {
    if (!active || !employeeId) return

    if (!navigator.geolocation) {
      console.warn('[GeoTracker] Este navegador no soporta geolocalización.')
      return
    }

    const channel = getOrCreateRtlsChannel({ employeeId, name, role })
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.join()
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        sendLocation(employeeId, pos.coords.latitude, pos.coords.longitude, {
          name,
          role,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        console.warn('[GeoTracker] Error en watchPosition:', err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [active, employeeId, name, role])
}
