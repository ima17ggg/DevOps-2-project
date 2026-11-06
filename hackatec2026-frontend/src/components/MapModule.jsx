import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { getAllLocations, subscribeToRtlsLocations, PLANT_CENTER, OFFLINE_TIMEOUT_MS } from '../services/locationService'
import { getAllPlants } from '../services/plantasService'

const roleColor = (role = '', insideGeofence = true) => {
  if (insideGeofence === false) return '#d93025' // Alerta roja fuera de geocerca
  if (role.includes('Supervisor') || role.includes('Seguridad')) return '#041632'
  return '#fc820c'
}

function isOffline(loc) {
  if (!loc) return true
  if (loc.online === false) return true
  return Date.now() - (loc.updatedAt || 0) > OFFLINE_TIMEOUT_MS
}

function formatTimeAgo(ts) {
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (secs < 10) return 'En vivo'
  if (secs < 60) return `hace ${secs} s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${mins} min`
  return `hace ${Math.floor(mins / 60)}h ${mins % 60}m`
}

function buildPopupHtml(loc) {
  const offline = isOffline(loc)
  const timeAgo = formatTimeAgo(loc.updatedAt || Date.now())
  const color = offline ? '#75777e' : roleColor(loc.role, loc.insideGeofence)
  const geofenceBadge =
    loc.insideGeofence === false
      ? `<div style="margin:4px 0;padding:2px 6px;border-radius:4px;background:#fce8e6;color:#c5221f;font-size:10px;font-weight:700">⚠️ Fuera de geocerca (${loc.distanceMeters ?? '?'} m)</div>`
      : `<div style="margin:4px 0;padding:2px 6px;border-radius:4px;background:#e6f4ea;color:#137333;font-size:10px;font-weight:600">✓ En geocerca${loc.distanceMeters != null ? ` (${loc.distanceMeters} m)` : ''}</div>`

  return `
    <div style="font-family:Inter,sans-serif;min-width:180px;">
      <p style="margin:0 0 3px;font-weight:700;color:#041632;font-size:13px">${loc.name || 'Sin nombre'}</p>
      <p style="margin:0 0 6px;color:#75777e;font-size:11px">${loc.role || 'Empleado'}</p>
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
        <span style="width:7px;height:7px;border-radius:50%;background:${color};display:inline-block"></span>
        <span style="font-size:11px;color:${color};font-weight:600">${offline ? 'Fuera de línea' : 'RTLS Activo'}</span>
        <span style="font-size:10px;color:#adb0b7;margin-left:4px">${timeAgo}</span>
      </div>
      ${geofenceBadge}
      <p style="margin:0;font-family:monospace;color:#44474d;font-size:10px;background:#f7f9fb;padding:3px 6px;border-radius:4px">
        ${loc.lat.toFixed(5)}°, ${loc.lng.toFixed(5)}°
      </p>
    </div>
  `
}

function buildIcon(loc) {
  const offline = isOffline(loc)
  const color = offline ? '#75777e' : roleColor(loc.role, loc.insideGeofence)
  const textColor = offline ? '#75777e' : '#041632'
  const statusTag = offline
    ? `<span style="font-size:9px;font-weight:600;color:#75777e;margin-left:2px">(Fuera de línea)</span>`
    : ''
  const pulse = offline ? '' : `
    <span style="
      position:absolute;top:-3px;right:-3px;
      width:10px;height:10px;border-radius:50%;
      background:${color};opacity:0.5;
      animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
    "></span>`
  return L.divIcon({
    className: '',
    iconAnchor: [0, 14],
    popupAnchor: [70, -8],
    html: `
      <div style="position:relative;display:inline-flex;align-items:center;gap:6px;
        background:${offline ? '#f2f4f6' : 'white'};border:2px solid ${color};border-radius:20px;
        padding:4px 10px 4px 6px;font-size:11px;font-weight:700;color:${textColor};
        white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.18);cursor:pointer;opacity:${offline ? '0.85' : '1'};">
        ${pulse}
        <span style="width:9px;height:9px;border-radius:50%;background:${color};
          flex-shrink:0;display:inline-block;"></span>
        ${loc.name || 'Sin nombre'}${statusTag}
      </div>`,
  })
}

function buildPlantIcon() {
  return L.divIcon({
    className: '',
    iconAnchor: [16, 16],
    html: `<div style="width:32px;height:32px;background:#041632;border:3px solid white;
      border-radius:8px;display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);">
      <span style="color:white;font-size:16px;line-height:1;" class="material-symbols-outlined">factory</span>
    </div>`,
  })
}

export default function MapModule() {
  const mapDivRef       = useRef(null)
  const mapRef          = useRef(null)
  const markersRef      = useRef({})
  const plantMarkersRef = useRef({})
  const plantCirclesRef = useRef({})

  const [locations, setLocations]   = useState({})
  const [plants, setPlants]         = useState([])
  const [lastSync,  setLastSync]    = useState(new Date())
  const [total,     setTotal]       = useState(0)
  const [staleCount,setStaleCount]  = useState(0)
  const [wsConnected, setWsConnected] = useState(false)

  const recomputeMetrics = useCallback((locs) => {
    const entries = Object.values(locs || {})
    setTotal(entries.length)
    setStaleCount(entries.filter((l) => isOffline(l)).length)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const locs = await getAllLocations()
      if (locs && typeof locs === 'object') {
        setLocations(locs)
        setLastSync(new Date())
        recomputeMetrics(locs)
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }, [recomputeMetrics])

  const loadPlants = useCallback(async () => {
    try {
      const p = await getAllPlants()
      if (Array.isArray(p)) {
        setPlants(p)
      }
    } catch (err) {
      console.error('Error fetching plants:', err)
    }
  }, [])

  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return

    const defaultLat = PLANT_CENTER?.lat || 25.4232
    const defaultLng = PLANT_CENTER?.lng || -101.0053

    const map = L.map(mapDivRef.current, {
      center:              [defaultLat, defaultLng],
      zoom:                13,
      zoomControl:         true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    refresh()
    loadPlants()

    // Suscripción en tiempo real vía Phoenix Channels WebSocket
    const unsubscribe = subscribeToRtlsLocations({
      onInitialState: (initialLocs) => {
        setWsConnected(true)
        setLocations((prev) => {
          const merged = { ...prev, ...initialLocs }
          recomputeMetrics(merged)
          return merged
        })
        setLastSync(new Date())
      },
      onLocationUpdate: (loc) => {
        setWsConnected(true)
        setLocations((prev) => {
          const next = { ...prev, [loc.id]: loc }
          recomputeMetrics(next)
          return next
        })
        setLastSync(new Date())
      },
    })

    return () => {
      unsubscribe()
      map.remove()
      mapRef.current  = null
      markersRef.current = {}
      plantMarkersRef.current = {}
      plantCirclesRef.current = {}
    }
  }, [refresh, loadPlants, recomputeMetrics])

  // Pinta las plantas de forma segura validando coordenadas
  useEffect(() => {
    const map = mapRef.current
    if (!map || !plants.length) return

    Object.values(plantMarkersRef.current).forEach((m) => m.remove())
    Object.values(plantCirclesRef.current).forEach((c) => c.remove())
    plantMarkersRef.current = {}
    plantCirclesRef.current = {}

    const bounds = []

    plants.forEach((plant) => {
      if (!plant || typeof plant.lat !== 'number' || typeof plant.lng !== 'number') return

      const marker = L.marker([plant.lat, plant.lng], { icon: buildPlantIcon() })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif">
            <b style="color:#041632">${plant.nombre || 'Planta'}</b><br>
            <small style="color:#75777e">${plant.ubicacion || 'Centro de operaciones'}</small>
          </div>
        `)
      plantMarkersRef.current[plant.id_planta] = marker

      const circle = L.circle([plant.lat, plant.lng], {
        radius: plant.radio_metros || 100,
        color: '#041632',
        weight: 1,
        fillColor: '#041632',
        fillOpacity: 0.06,
      }).addTo(map)
      plantCirclesRef.current[plant.id_planta] = circle

      bounds.push([plant.lat, plant.lng])
    })

    if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] })
    else if (bounds.length === 1) map.setView(bounds[0], 15)
  }, [plants])

  // Actualiza marcadores en tiempo real sin destruir los existentes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !locations) return

    const activeIds = new Set(Object.keys(locations))

    // Eliminar marcadores de empleados que ya no están
    Object.keys(markersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })

    // Crear o mover suavemente cada marcador en el mapa
    Object.entries(locations).forEach(([id, loc]) => {
      if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return

      const existing = markersRef.current[id]
      if (existing) {
        existing.setLatLng([loc.lat, loc.lng])
        existing.setIcon(buildIcon(loc))
        existing.setPopupContent(buildPopupHtml(loc))
      } else {
        const marker = L.marker([loc.lat, loc.lng], { icon: buildIcon(loc) })
          .addTo(map)
          .bindPopup(buildPopupHtml(loc))
        markersRef.current[id] = marker
      }
    })
  }, [locations])

  // Verificar periódicamente si algún empleado dejó de transmitir para pasarlo a gris ("Fuera de línea")
  useEffect(() => {
    const timer = setInterval(() => {
      recomputeMetrics(locations)
      Object.entries(locations).forEach(([id, loc]) => {
        const existing = markersRef.current[id]
        if (existing && loc) {
          existing.setIcon(buildIcon(loc))
          existing.setPopupContent(buildPopupHtml(loc))
        }
      })
    }, 3000)

    return () => clearInterval(timer)
  }, [locations, recomputeMetrics])

  const syncTime = lastSync.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[500px]">

      <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-sm">
          <h3 className="font-headline-sm text-headline-sm text-primary">RTLS Live Tracking</h3>
          <span className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant ml-sm">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-secondary-container'} animate-pulse`} />
            {wsConnected ? `WebSocket Live · ${syncTime}` : `Sync ${syncTime}`}
          </span>
        </div>
        <div className="flex gap-sm">
          <button
            onClick={refresh}
            className="text-label-md font-label-md px-md py-xs bg-surface-container-lowest border border-outline-variant rounded-full text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden rounded-b-xl">
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        <div className="absolute top-md left-md bg-white/95 backdrop-blur-sm border border-outline-variant p-sm rounded-lg shadow-sm z-[1000]">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">
            Empleados en planta
          </p>
          <div className="flex items-center gap-sm font-label-md text-label-md text-on-surface">
            <span className="w-3 h-3 rounded-full bg-secondary-container" />
            En línea ({total - staleCount})
          </div>
          <div className="flex items-center gap-sm font-label-md text-label-md text-on-surface mt-xs">
            <span className="w-3 h-3 rounded-full bg-primary" />
            Supervisores / Seguridad
          </div>
          <div className="flex items-center gap-sm font-label-md text-label-md text-on-surface-variant mt-xs">
            <span className="w-3 h-3 rounded-full bg-outline" />
            Fuera de línea ({staleCount})
          </div>
        </div>

        <div className="absolute bottom-sm right-sm bg-white/90 border border-outline-variant px-sm py-xs rounded-full text-label-md text-on-surface-variant z-[1000] flex items-center gap-xs">
          <span className="material-symbols-outlined text-[12px]">sensors</span>
          RTLS Phoenix WebSocket · {total} empleados · {plants.length} plantas
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
