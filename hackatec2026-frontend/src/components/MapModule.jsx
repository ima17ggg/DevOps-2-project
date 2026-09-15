import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { getAllLocations, PLANT_CENTER } from '../services/locationService'
<<<<<<< HEAD
=======
import { getAllPlants } from '../services/plantasService'
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

const REFRESH_MS = 3 * 60 * 1000  // 3 minutos

const roleColor = (role = '') => {
  if (role.includes('Supervisor') || role.includes('Seguridad')) return '#041632'
  return '#fc820c'
}

function formatTimeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1)  return 'Ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  return `hace ${Math.floor(mins / 60)}h ${mins % 60}m`
}

function buildIcon(loc) {
  const stale = Date.now() - loc.updatedAt > 10 * 60 * 1000
  const color = stale ? '#75777e' : roleColor(loc.role)
  const pulse = stale ? '' : `
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
<<<<<<< HEAD
      <div class="notranslate" translate="no" style="position:relative;display:inline-flex;align-items:center;gap:6px;
=======
      <div style="position:relative;display:inline-flex;align-items:center;gap:6px;
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
        background:white;border:2px solid ${color};border-radius:20px;
        padding:4px 10px 4px 6px;font-size:11px;font-weight:700;color:#041632;
        white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.18);cursor:pointer;">
        ${pulse}
        <span style="width:9px;height:9px;border-radius:50%;background:${color};
          flex-shrink:0;display:inline-block;"></span>
        ${loc.name}
      </div>`,
  })
}

<<<<<<< HEAD
export default function MapModule() {
  const mapDivRef  = useRef(null)
  const mapRef     = useRef(null)
  const markersRef = useRef({})

  const [locations, setLocations]   = useState({})
=======
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
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  const [lastSync,  setLastSync]    = useState(new Date())
  const [total,     setTotal]       = useState(0)
  const [staleCount,setStaleCount]  = useState(0)

<<<<<<< HEAD
  const refresh = useCallback(() => {
    const locs = getAllLocations()
=======
  const refresh = useCallback(async () => {
    const locs = await getAllLocations()
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
    setLocations(locs)
    setLastSync(new Date())
    setTotal(Object.keys(locs).length)
    setStaleCount(Object.values(locs).filter(l => Date.now() - l.updatedAt > 10 * 60 * 1000).length)
  }, [])

<<<<<<< HEAD
=======
  const loadPlants = useCallback(async () => {
    setPlants(await getAllPlants())
  }, [])

>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return

    const map = L.map(mapDivRef.current, {
      center:             [PLANT_CENTER.lat, PLANT_CENTER.lng],
<<<<<<< HEAD
      zoom:               15,
=======
      zoom:               13,
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
      zoomControl:        true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

<<<<<<< HEAD
    /* Pin Central con Unicode de Icono Factory */
    L.marker([PLANT_CENTER.lat, PLANT_CENTER.lng], {
      icon: L.divIcon({
        className: '',
        iconAnchor: [16, 16],
        html: `<div style="width:32px;height:32px;background:#041632;border:3px solid white;
          border-radius:8px;display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);">
          <span style="color:white;font-size:16px;line-height:1;" class="material-symbols-outlined notranslate" translate="no">&#xE0EF;</span>
        </div>`,
      }),
    }).addTo(map).bindPopup('<b style="font-family:Inter,sans-serif">Plant Alpha-4</b><br><small>Centro de operaciones</small>')

    mapRef.current = map
    refresh()
=======
    mapRef.current = map
    refresh()
    loadPlants()
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

    return () => {
      map.remove()
      mapRef.current  = null
      markersRef.current = {}
<<<<<<< HEAD
=======
      plantMarkersRef.current = {}
      plantCirclesRef.current = {}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

<<<<<<< HEAD
=======
  // Pinta las plantas (marcador + círculo de radio) cuando llegan del backend
  useEffect(() => {
    const map = mapRef.current
    if (!map || plants.length === 0) return

    Object.values(plantMarkersRef.current).forEach((m) => m.remove())
    Object.values(plantCirclesRef.current).forEach((c) => c.remove())
    plantMarkersRef.current = {}
    plantCirclesRef.current = {}

    const bounds = []

    plants.forEach((plant) => {
      const marker = L.marker([plant.lat, plant.lng], { icon: buildPlantIcon() })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif">
            <b style="color:#041632">${plant.nombre}</b><br>
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

  // Pinta los empleados (locations) — sin cambios respecto a antes
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    Object.entries(locations).forEach(([id, loc]) => {
      const stale    = Date.now() - loc.updatedAt > 10 * 60 * 1000
      const timeAgo  = formatTimeAgo(loc.updatedAt)
      const color    = stale ? '#75777e' : roleColor(loc.role)

      const marker = L.marker([loc.lat, loc.lng], { icon: buildIcon(loc) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:170px;">
            <p style="margin:0 0 3px;font-weight:700;color:#041632;font-size:13px">${loc.name}</p>
            <p style="margin:0 0 6px;color:#75777e;font-size:11px">${loc.role || 'Empleado'}</p>
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
              <span style="width:7px;height:7px;border-radius:50%;background:${color};display:inline-block"></span>
              <span style="font-size:11px;color:${color};font-weight:600">${stale ? 'Sin señal' : 'En línea'}</span>
              <span style="font-size:10px;color:#adb0b7;margin-left:4px">${timeAgo}</span>
            </div>
            <p style="margin:0;font-family:monospace;color:#44474d;font-size:10px;background:#f7f9fb;padding:3px 6px;border-radius:4px">
              ${loc.lat.toFixed(5)}°, ${loc.lng.toFixed(5)}°
            </p>
          </div>
        `)

      markersRef.current[id] = marker
    })
  }, [locations])

  const syncTime = lastSync.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[500px]">

      <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-sm">
          <h3 className="font-headline-sm text-headline-sm text-primary">Live Asset Tracking</h3>
          <span className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant ml-sm">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            Sync {syncTime}
          </span>
        </div>
        <div className="flex gap-sm">
          <button
            onClick={refresh}
<<<<<<< HEAD
            className="text-label-md font-label-md px-md py-xs bg-surface-container-lowest border border-outline-variant rounded-full text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined notranslate text-[14px]" translate="no">
              {'\uE5D5'} {/* refresh */}
            </span>
=======
            className="text-label-md font-label-md px-md py-xs bg-surface-container-lowest border border-outline-variant rounded-full text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            Refresh
          </button>
        </div>
      </div>

<<<<<<< HEAD
      <div className="flex-1 relative overflow-hidden rounded-b-xl z-0">
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        {/* Tarjeta flotante leyenda con z-10 para no competir con el Header (z-50) */}
        <div className="absolute top-md left-md bg-white/95 backdrop-blur-sm border border-outline-variant p-sm rounded-lg shadow-sm z-[10]">
=======
      <div className="flex-1 relative overflow-hidden rounded-b-xl">
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        <div className="absolute top-md left-md bg-white/95 backdrop-blur-sm border border-outline-variant p-sm rounded-lg shadow-sm z-[1000]">
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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
            Sin señal +10 min ({staleCount})
          </div>
        </div>

<<<<<<< HEAD
        <div className="absolute bottom-sm right-sm bg-white/90 border border-outline-variant px-sm py-xs rounded-full text-label-md text-on-surface-variant z-[10] flex items-center gap-xs">
          <span className="material-symbols-outlined notranslate text-[12px]" translate="no">
            {'\uE8B5'} {/* schedule */}
          </span>
          Actualiza cada 3 min · {total} empleados
=======
        <div className="absolute bottom-sm right-sm bg-white/90 border border-outline-variant px-sm py-xs rounded-full text-label-md text-on-surface-variant z-[1000] flex items-center gap-xs">
          <span className="material-symbols-outlined text-[12px]">schedule</span>
          Actualiza cada 3 min · {total} empleados · {plants.length} plantas
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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