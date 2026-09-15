import { useEffect, useState } from 'react'
import { useGeoTracker } from '../hooks/useGeoTracker'
import { getTrackingSession } from '../services/locationService'

/**
 * Componente invisible que vive en App.jsx.
 * Lee la sesión de tracking de localStorage y mantiene el GPS activo
 * aunque el empleado cambie de página dentro de la app.
 *
 * No renderiza nada visible — solo lógica de fondo.
 */
export default function GeoTrackerBridge() {
  const [session, setSession] = useState(() => getTrackingSession())

  // Escucha cambios en localStorage para activar/desactivar el tracker
  // en tiempo real (cuando CheckIn o Checkout modifican la sesión)
  useEffect(() => {
    const onStorage = () => setSession(getTrackingSession())
    window.addEventListener('storage', onStorage)

    // También hace polling local cada 5 seg para cambios en la misma pestaña
    const id = setInterval(() => setSession(getTrackingSession()), 5000)

    return () => {
      window.removeEventListener('storage', onStorage)
      clearInterval(id)
    }
  }, [])

  useGeoTracker({
    employeeId: session?.id   ?? null,
    name:       session?.name ?? '',
    role:       session?.role ?? '',
    active:     session?.active === true,
  })

  return null  // no renderiza nada
}
