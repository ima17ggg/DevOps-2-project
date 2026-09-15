import { useEffect, useRef } from 'react'
import { sendLocation } from '../services/locationService'

const INTERVAL_MS = 3 * 60 * 1000  // 3 minutos

/**
 * Hook que rastrea la posición GPS del empleado cada 3 minutos
 * y la envía al servidor (o localStorage en demo).
 *
 * @param {object} params
 * @param {string}  params.employeeId - ID único del empleado
 * @param {string}  params.name       - Nombre completo
 * @param {string}  params.role       - Rol / puesto
 * @param {boolean} params.active     - Si false, el tracking se detiene
 */
export function useGeoTracker({ employeeId, name, role, active }) {
  const intervalRef = useRef(null)

  useEffect(() => {
    // No rastrear si está inactivo o faltan datos
    if (!active || !employeeId) return

    if (!navigator.geolocation) {
      console.warn('[GeoTracker] Este navegador no soporta geolocalización.')
      return
    }

    const readAndSend = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLocation(employeeId, name, role, pos.coords.latitude, pos.coords.longitude)
        },
        (err) => {
          console.warn('[GeoTracker] Error al obtener posición:', err.message)
        },
        {
          enableHighAccuracy: true,  // mejor precisión en móvil
          timeout:            15000, // 15 seg máximo
          maximumAge:         60000, // acepta caché de hasta 1 min
        }
      )
    }

    readAndSend()                                         // lectura inmediata al activar
    intervalRef.current = setInterval(readAndSend, INTERVAL_MS) // luego cada 3 min

    return () => clearInterval(intervalRef.current)
  }, [active, employeeId, name, role])
}
