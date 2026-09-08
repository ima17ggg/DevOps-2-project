
import { supabase } from "../config/supabaseClient.js";

export async function saveLocation(employeeId, lat, lng) {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      id_empleado: employeeId,
      latitud: lat,
      longitud: lng
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')

  if (error) throw error

  return data
}