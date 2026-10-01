export const CHECK_INS_UPDATED_EVENT = 'hackatec:check-ins-updated'
const MAX_CHECK_INS = 50
let recentCheckIns = []

function readCheckIns() {
  return recentCheckIns
}

export function recordCheckIn(employee, photo) {
  const now = Date.now()
  const entry = {
    id: globalThis.crypto?.randomUUID?.() ?? `${employee.id}-${now}`,
    employeeId: employee.id,
    name: employee.name,
    role: employee.role ?? 'Empleado',
    department: employee.department ?? '',
    shift: employee.shift ?? '',
    location: employee.plant ?? 'Planta no especificada',
    photo: photo ?? null,
    status: 'verified',
    checkedInAt: now,
  }
  const entries = [entry, ...readCheckIns()].slice(0, MAX_CHECK_INS)
  recentCheckIns = entries
  window.dispatchEvent(new CustomEvent(CHECK_INS_UPDATED_EVENT, { detail: entries }))
  return entry
}

export function getRecentCheckIns() {
  return readCheckIns()
}
