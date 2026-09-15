import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KPITile from '../components/KPITile'
import MapModule from '../components/MapModule'
import ActivityFeed from '../components/ActivityFeed'

export default function Dashboard() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadEmployees() {
      try {
        const res = await fetch('/api/empleados')
        const json = await res.json()
        if (!cancelled && json.success) {
          setEmployees(json.data)
        }
      } catch (err) {
        console.error('Error cargando empleados:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadEmployees()
    const interval = setInterval(loadEmployees, 30000) // refresco cada 30s
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const arrivedEmployees = employees.filter((e) => e.arrived_today && e.location)

  const kpiData = [
    {
      label: 'Empleados totales',
      icon: 'badge',
      value: employees.length.toString(),
      trend: { trendIcon: 'trending_up', text: `${arrivedEmployees.length} en planta`, color: 'text-[#15803d]' },
    },
    {
      label: 'Clientes Activos',
      icon: 'business_center',
      value: '47',
      trend: { trendIcon: 'horizontal_rule', text: 'No change', color: 'text-on-surface-variant' },
    },
    {
      label: 'Incidentes pendientes',
      icon: 'report_problem',
      iconColor: 'text-error',
      value: '03',
      trend: { dot: 'bg-error', text: 'Action Required', color: 'text-error', valueColor: 'text-error' },
    },
    {
      label: 'GPS',
      icon: 'directions_car',
      value: loading ? '...' : '100%',
      trend: { dot: 'bg-[#15803d]', text: 'All vehicles transmitting', color: 'text-[#15803d]' },
    },
  ]

  return (
    <main className="flex-1 p-lg pt-lg grid grid-cols-12 gap-lg bg-background">
      {/* Section Header */}
      <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-xl flex flex-col md:flex-row md:justify-between md:items-center gap-md">
        <div>
          <div className="inline-flex items-center gap-xs bg-surface-container-low rounded-full px-sm py-xs mb-sm border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            <span className="font-label-md text-label-md text-on-surface-variant">Live Sync Active</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">
            Live Operations Overview
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs max-w-md">
            Real-time metrics for Plant Alpha-4 across all shifts.
          </p>
        </div>
      </div>

      {/* QR Registration Banner */}
      <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-md relative z-0 overflow-hidden">
        <div className="flex items-center gap-md relative z-10 min-w-0">
          <div className="p-3 bg-secondary-container text-on-primary rounded-xl shadow-sm shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined notranslate text-[28px]" translate="no">
              {'\uE00A'}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary truncate">
              QR Registration Active
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              Streamline access for employees and clients with the new contactless check-in system.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/qr-generate')}
          className="mt-md md:mt-0 bg-primary text-on-primary font-label-lg text-label-lg py-sm px-lg rounded-full flex items-center justify-center gap-sm hover:bg-primary-container transition-colors shadow-sm relative z-10 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined notranslate text-[18px]" translate="no">
            {'\uE00A'}
          </span>
          Generate Pass
        </button>
      </div>

      {/* KPI Tiles */}
      {kpiData.map((kpi) => (
        <KPITile key={kpi.label} {...kpi} />
      ))}

      {/* Map + Activity Feed */}
      <MapModule employees={arrivedEmployees} loading={loading} />
      <ActivityFeed />
    </main>
  )
}