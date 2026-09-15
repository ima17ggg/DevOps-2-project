import { supabase } from "../config/supabaseClient.js";

export async function saveLocation(employeeId, lat, lng) {
  const { data, error } = await supabase
    .from('locations')
    .upsert(
      { id_empleado: employeeId, latitud: lat, longitud: lng, updated_at: new Date().toISOString() },
      { onConflict: 'id_empleado' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select(`
      id_empleado,
      latitud,
      longitud,
      updated_at,
      empleados:id_empleado ( nombre, apellido_paterno, roles ( nombre ) )
    `)

  if (error) throw error
  return data
}