<<<<<<< HEAD
const checkIns = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    location: 'Gate B North Entry',
    time: '2 mins ago',
    status: 'verified',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMHOpDBt6PShHyGZjZ0zwMzTpsOzrsgCyYVg-4gu9xP5w8XdaqBUGBuRnTOEa5kgxNUq7aRbeb5LRB_9YdHniVEE_nGGEQ8Fn2BlcZgU1GTin1SWEcVuom67tUPdzZ7ePNV1TizzRgUABblmbAWw0f5H_n4m4_EMRt7L9ic5qDNoCBe6lCHtgcYBppySYP4MfO99VSX3z1gJSBl0NE3ffMedXzW7nzq9oZQ6VdJKbQ06WOUGcdo6EIhgPaj8Msf_4Lh1UaDtSssxk',
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    location: 'Loading Dock 4',
    time: '15 mins ago',
    status: 'verified',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYSBl0Ca2m6SUE5yuAHlLbzCYYjsypVaxJPUq8SGkrXnhiyakkTSd0CQaaQSwwAQ_psCKwJ2Lh9Q11moZReGdB-QIz3G8ZR37Ughd_JgXifSpXEf4G83C3kqGdTkOuYO5SIaLJMEgdv9kECk70bRcX5POHK7qlwec5yhoh46zA8idhGWexqaRiipqJpzJEO5DpwZZOpu4dDU6jaH9dUGQP6O1QSrpVZ-b4VEgaigjAQmHtzooU6ejZeURyB2E5AwgJGF7DxPgsPR0',
  },
  {
    id: 3,
    name: 'Unknown ID',
    location: 'Perimeter Fence East',
    time: '42 mins ago',
    status: 'unknown',
    photo: null,
  },
  {
    id: 4,
    name: 'Elena Rostova',
    location: 'Main Administration',
    time: '1 hr ago',
    status: 'verified',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbUmQA3F9ZELMf8lUG16oEf5q3LvwJD7SFORE6qOLT0j5cAqZOeJiRCpNe1znJq6LivLsNkXFOp3U7kWQ49TwJDO7Y1HApxfriwvBdIxAJyoFDDP060CVT5bcZayLT1UHOTTeCgXxle-Or-p2ZmN3yq-AXGyBY4dodVK-BbuK5jaJRADNalSGZPW6pgyP0NbytkhuJ9_UaNQHbibxj5BrC9_0TyfqQh2lPEVaKK8-3C3yhEQ4iuXBPMuGohCg2Ua6IkGVfO7JxAuY',
  },
]

function CheckInItem({ item }) {
  const isUnknown = item.status === 'unknown'

  return (
    <div
      className={`flex gap-md p-sm hover:bg-surface-container-low rounded-lg transition-colors cursor-default border border-transparent hover:border-outline-variant ${
        isUnknown ? 'bg-surface-variant/30' : ''
      }`}
    >
      {item.photo ? (
        <img
          alt="Verification Photo"
          className="w-12 h-12 rounded-lg object-cover border border-outline-variant bg-surface-dim shrink-0"
          src={item.photo}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg border border-outline-variant bg-surface-dim flex items-center justify-center text-outline shrink-0">
          <span className="material-symbols-outlined notranslate" translate="no">
            {'\uE7FF'} {/* person_off */}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-xs">
          <h4 className="font-label-lg text-label-lg text-on-surface truncate">{item.name}</h4>
          <span className="font-label-md text-label-md text-on-surface-variant shrink-0">{item.time}</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant truncate">{item.location}</p>
        
        {isUnknown ? (
          <span className="inline-flex items-center gap-xs mt-xs text-label-md font-label-md text-secondary-container bg-secondary-container/10 rounded-full px-sm py-[2px]">
            <span className="material-symbols-outlined notranslate text-[14px]" translate="no">
              {'\uE002'} {/* warning */}
            </span>
            Manual Review Required
          </span>
        ) : (
          <span className="inline-flex items-center gap-xs mt-xs text-label-md font-label-md text-[#15803d] bg-[#dcfce7] rounded-full px-sm py-[2px]">
            <span className="material-symbols-outlined notranslate text-[14px]" translate="no">
              {'\uE86C'} {/* verified */}
            </span>
            Verified Match
          </span>
        )}
=======
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
          className="w-12 h-12 rounded-lg object-cover border border-outline-variant bg-surface-dim"
          src={item.photo}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg border border-outline-variant bg-surface-dim flex items-center justify-center text-outline">
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
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
      </div>
    </div>
  )
}

export default function ActivityFeed() {
<<<<<<< HEAD
=======
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

>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  return (
    <div className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[500px]">
      <div className="px-md py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-primary">Recent Check-ins</h3>
<<<<<<< HEAD
        <span className="material-symbols-outlined notranslate text-outline text-[20px] cursor-pointer" translate="no">
          {'\uE5D4'} {/* more_vert */}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-xs">
        {checkIns.map((item) => (
          <CheckInItem key={item.id} item={item} />
        ))}
      </div>
      <div className="p-sm border-t border-outline-variant bg-surface-container-lowest text-center">
        <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors cursor-pointer">
          View All Activity
        </button>
      </div>
    </div>
  )
}
=======
        <span className="font-label-md text-label-md text-on-surface-variant">{checkIns.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-xs">
        {checkIns.length ? checkIns.map((item) => (
          <CheckInItem key={item.id} item={item} />
        )) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] mb-xs">event_available</span>
            <p className="font-label-md text-label-md">Aún no hay entradas registradas.</p>
          </div>
        )}
      </div>
    </div>
  )
}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
