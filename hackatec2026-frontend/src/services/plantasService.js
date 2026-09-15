const API_BASE = '/api'

export async function getAllPlants() {
  try {
    const res = await fetch(`${API_BASE}/plantas`, { credentials: 'include' })
    if (!res.ok) return []
    const json = await res.json()
    const rows = json?.success && Array.isArray(json.data) ? json.data : []

    return rows.map((p) => ({
      ...p,
      lat: p.latitud != null ? Number(p.latitud) : null,
      lng: p.longitud != null ? Number(p.longitud) : null,
    }))
  } catch {
    return []
  }
}