const API_BASE = '/api'

export async function getAllPlants() {
  try {
    const res = await fetch(`${API_BASE}/plantas`, { credentials: 'include' })
    if (!res.ok) return []
    const json = await res.json()
    return json?.success && Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}