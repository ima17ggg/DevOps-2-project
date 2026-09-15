const CHECK_INS_KEY = 'hackatec:recent-check-ins:v1'
export const CHECK_INS_UPDATED_EVENT = 'hackatec:check-ins-updated'

function readCheckIns() {
  try {
    const value = JSON.parse(localStorage.getItem(CHECK_INS_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
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
  const entries = [entry, ...readCheckIns()].slice(0, 50)
  localStorage.setItem(CHECK_INS_KEY, JSON.stringify(entries))
  window.dispatchEvent(new CustomEvent(CHECK_INS_UPDATED_EVENT, { detail: entries }))
  return entry
}

export function getRecentCheckIns() {
  return readCheckIns()
}
