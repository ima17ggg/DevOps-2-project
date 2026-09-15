import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

// routes/empleados.js

router.get('/', asyncHandler(async (req, res) => {
  const { data: empleados, error: empError } = await supabase
    .from('empleados')
    .select(`
      id_empleado,
      nombre,
      apellido_paterno,
      apellido_materno,
      id_externo,
      Is_active,
      roles ( nombre ),
      plantas!empleados_id_planta_destino_fkey ( id_planta, nombre_planta, latitud, longitud )
    `)
    .limit(100);

  if (empError) throw empError;

  const today = new Date().toISOString().slice(0, 10);
  const { data: asistenciasHoy, error: asistError } = await supabase
    .from('asistencias')
    .select('id_empleado, hora_entrada, hora_salida, qr_validado')
    .eq('fecha', today);

  if (asistError) throw asistError;

  const asistenciaPorEmpleado = new Map(asistenciasHoy.map((a) => [a.id_empleado, a]));

  const result = empleados.map((emp) => {
    const asistencia = asistenciaPorEmpleado.get(emp.id_empleado);
    const arrived = Boolean(asistencia?.hora_entrada);
    const plant = emp.plantas;

    return {
      id: emp.id_externo || `EMP-${emp.id_empleado}`,
      id_empleado: emp.id_empleado,
      name: [emp.nombre, emp.apellido_paterno, emp.apellido_materno].filter(Boolean).join(' '),
      role: emp.roles?.nombre || 'Sin rol asignado',
      plant: plant?.nombre_planta || 'Sin planta asignada',
      status: arrived && !asistencia.hora_salida ? 'On Shift' : 'Off Shift',
      checkIn: asistencia?.hora_entrada
        ? new Date(asistencia.hora_entrada).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'N/A',
      checkInRaw: asistencia?.hora_entrada || null,
      on_site: arrived && !asistencia?.hora_salida,
      location: plant && plant.latitud != null && plant.longitud != null
        ? { lat: plant.latitud, lng: plant.longitud, plant_id: plant.id_planta, plant_name: plant.nombre_planta }
        : null,
    };
  });

  res.json(successResponse(result));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['nombre', 'rfc']);

  const { data, error } = await supabase
    .from('empleados')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(successResponse(data));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('empleados')
    .update(req.body)
    .eq('id_empleado', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('empleados')
    .delete()
    .eq('id_empleado', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;