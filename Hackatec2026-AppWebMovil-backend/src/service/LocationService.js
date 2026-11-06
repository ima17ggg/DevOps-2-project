import { supabase } from "../utils/supabase.js";

export async function saveLocation(employeeId, lat, lng, extra = {}) {
  const idStr = String(employeeId).trim();
  let empName = extra.name;
  let empRole = extra.role;
  let plantName = extra.nombre_planta;

  if (!empName || !empRole) {
    const isNumeric = /^\d+$/.test(idStr);
    let query = supabase
      .from('empleados')
      .select('id_empleado, id_externo, nombre, apellido_paterno, roles ( nombre ), plantas!empleados_id_planta_destino_fkey ( nombre_planta )');
    query = isNumeric ? query.eq('id_empleado', Number(idStr)) : query.eq('id_externo', idStr);
    const { data: emp } = await query.maybeSingle();
    if (emp) {
      empName = empName || [emp.nombre, emp.apellido_paterno].filter(Boolean).join(' ');
      empRole = empRole || emp.roles?.nombre || 'Empleado';
      plantName = plantName ?? emp.plantas?.nombre_planta ?? null;
    }
  }

  const payload = {
    id_externo: idStr,
    lat,
    lng,
    updated_at: new Date().toISOString(),
    ...(empName ? { name: empName } : {}),
    ...(empRole ? { role: empRole } : {}),
    ...(extra.inside_geofence !== undefined ? { inside_geofence: extra.inside_geofence } : {}),
    ...(plantName !== undefined ? { nombre_planta: plantName } : {}),
  };

  const { data, error } = await supabase
    .from('locations')
    .upsert(payload, { onConflict: 'id_externo' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLocations() {
  const [locRes, empRes] = await Promise.all([
    supabase
      .from('locations')
      .select('id_externo, name, role, lat, lng, updated_at, inside_geofence, nombre_planta'),
    supabase
      .from('empleados')
      .select('id_empleado, id_externo, nombre, apellido_paterno, roles ( nombre )'),
  ]);

  if (locRes.error) throw locRes.error;

  const empleados = empRes.data || [];
  const empById = new Map();
  const empByExterno = new Map();

  for (const emp of empleados) {
    empById.set(String(emp.id_empleado), emp);
    if (emp.id_externo) {
      empByExterno.set(String(emp.id_externo), emp);
    }
  }

  return (locRes.data || []).map((loc) => {
    const key = String(loc.id_externo);
    const emp = empById.get(key) || empByExterno.get(key) || null;
    const fullName =
      loc.name ||
      (emp ? [emp.nombre, emp.apellido_paterno].filter(Boolean).join(' ') : null) ||
      `Empleado #${loc.id_externo}`;
    const roleName = loc.role || emp?.roles?.nombre || 'Empleado';

    return {
      id_externo: loc.id_externo,
      id_empleado: emp ? emp.id_empleado : loc.id_externo,
      employee_id: emp ? emp.id_empleado : loc.id_externo,
      name: fullName,
      role: roleName,
      lat: loc.lat,
      lng: loc.lng,
      latitud: loc.lat,
      longitud: loc.lng,
      inside_geofence: loc.inside_geofence ?? true,
      nombre_planta: loc.nombre_planta ?? null,
      updated_at: loc.updated_at,
      empleados: emp
        ? {
            id_empleado: emp.id_empleado,
            id_externo: emp.id_externo,
            nombre: emp.nombre,
            apellido_paterno: emp.apellido_paterno,
            roles: emp.roles,
          }
        : null,
    };
  });
}