import { useEffect, useState } from 'react'
import {
  CHECK_INS_UPDATED_EVENT,
  getRecentCheckIns,
} from '../services/checkInActivityService'

function formatTime(checkedInAt) {
  const minutes = Math.max(0, Math.floor((Date.now() - checkedInAt) / 60000))
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `hace ${minutes} min`
  return `hace ${Math.floor(minutes / 60)} h`
}

function CheckInItem({ item }) {
  return (
    <div className="flex gap-md p-sm hover:bg-surface-container-low rounded-lg transition-colors cursor-default border border-transparent hover:border-outline-variant">
      {item.photo ? (
        <img
          alt={`Foto de verificación de ${item.name}`}
          className="w-12 h-12 rounded-lg object-cover border border-outline-variant bg-surface-dim shrink-0"
          src={item.photo}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg border border-outline-variant bg-surface-dim flex items-center justify-center text-outline shrink-0">
          <span className="material-symbols-outlined">person</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-sm">
          <h4 className="font-label-lg text-label-lg text-on-surface truncate">{item.name}</h4>
          <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{formatTime(item.checkedInAt)}</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant truncate">
          {item.role}{item.department ? ` · ${item.department}` : ''}
        </p>
        <p className="font-body-md text-body-md text-on-surface-variant truncate">{item.location}</p>
        <span className="inline-flex items-center gap-xs mt-xs text-label-md font-label-md text-[#15803d] bg-[#dcfce7] rounded-full px-sm py-[2px]">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          Entrada registrada
        </span>
      </div>
    </div>
  )
}

export default function ActivityFeed() {
  const [checkIns, setCheckIns] = useState(() => getRecentCheckIns())

  useEffect(() => {
    const update = (event) => setCheckIns(event?.detail ?? getRecentCheckIns())
    const syncFromStorage = () => setCheckIns(getRecentCheckIns())
    const timer = setInterval(syncFromStorage, 30000)

    window.addEventListener(CHECK_INS_UPDATED_EVENT, update)
    window.addEventListener('storage', syncFromStorage)
    return () => {
      clearInterval(timer)
      window.removeEventListener(CHECK_INS_UPDATED_EVENT, update)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [])

  return (
    <div className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[500px]">
      <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-primary">Recent Check-ins</h3>
        <span className="font-label-md text-label-md text-on-surface-variant">{checkIns.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-xs">
        {checkIns.length ? (
          checkIns.map((item) => <CheckInItem key={item.id} item={item} />)
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] mb-xs">event_available</span>
            <p className="font-label-md text-label-md">Aún no hay entradas registradas.</p>
          </div>
        )}
      </div>

      <div className="p-sm border-t border-outline-variant bg-surface-container-lowest text-center">
        <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors cursor-pointer">
          View All Activity
        </button>
      </div>
    </div>
  )
}