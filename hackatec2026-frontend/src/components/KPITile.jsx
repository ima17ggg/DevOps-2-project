export default function KPITile({ label, icon, iconColor, value, trend }) {
  return (
    <div className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-lg">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <span className={`material-symbols-outlined notranslate text-[20px] ${iconColor ?? 'text-outline'}`}>
          {icon}
        </span>
      </div>
      <div className={`font-headline-lg text-headline-lg font-bold ${trend?.valueColor ?? 'text-primary'}`}>
        {value}
      </div>
      <div className={`flex items-center gap-xs mt-sm text-label-md font-label-md ${trend?.color ?? 'text-on-surface-variant'}`}>
        {trend?.dot ? (
          <span className={`w-1.5 h-1.5 rounded-full ${trend.dot}`}></span>
        ) : trend?.trendIcon ? (
          <span className="material-symbols-outlined notranslate text-[16px]">
            {trend.trendIcon}
          </span>
        ) : null}
        <span>{trend?.text}</span>
      </div>
    </div>
  )
}