import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { renewEmployeeQr } from '../utils/qrScheduler.js';

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

// GET /api/empleados/:id — detalle completo de un empleado (para el modal de "Details")
router.get('/:id', asyncHandler(async (req, res) => {
  const { data: empleado, error: empError } = await supabase
    .from('empleados')
    .select(`
      id_empleado,
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      rfc,
      fecha_ingreso,
      id_externo,
      Is_active,
      id_rol,
      id_planta_destino,
      roles ( id_rol, nombre ),
      plantas!empleados_id_planta_destino_fkey ( id_planta, nombre_planta, latitud, longitud )
    `)
    .eq('id_empleado', req.params.id)
    .maybeSingle();

  if (empError) throw empError;

  if (!empleado) {
    return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: asistenciaHoy, error: asistError } = await supabase
    .from('asistencias')
    .select('hora_entrada, hora_salida, qr_validado')
    .eq('id_empleado', req.params.id)
    .eq('fecha', today)
    .maybeSingle();

  if (asistError) throw asistError;

  const arrived = Boolean(asistenciaHoy?.hora_entrada);
  const plant = empleado.plantas;

  res.json(successResponse({
    id: empleado.id_externo || `EMP-${empleado.id_empleado}`,
    id_empleado: empleado.id_empleado,
    nombre: empleado.nombre,
    apellido_paterno: empleado.apellido_paterno,
    apellido_materno: empleado.apellido_materno,
    name: [empleado.nombre, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean).join(' '),
    telefono: empleado.telefono,
    rfc: empleado.rfc,
    fecha_ingreso: empleado.fecha_ingreso,
    id_rol: empleado.id_rol,
    id_planta_destino: empleado.id_planta_destino,
    role: empleado.roles?.nombre || 'Sin rol asignado',
    plant: plant?.nombre_planta || 'Sin planta asignada',
    status: arrived && !asistenciaHoy?.hora_salida ? 'On Shift' : 'Off Shift',
    checkIn: asistenciaHoy?.hora_entrada
      ? new Date(asistenciaHoy.hora_entrada).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : 'N/A',
    location: plant && plant.latitud != null && plant.longitud != null
      ? { lat: plant.latitud, lng: plant.longitud, plant_id: plant.id_planta, plant_name: plant.nombre_planta }
      : null,
  }));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['nombre', 'rfc']);

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const qr_code = `EMP-${crypto.randomUUID()}-${today}`;

  const { data, error } = await supabase
    .from('empleados')
    .insert([{ ...req.body, qr_code }])
    .select()
    .single();

  if (error) throw error;

  const qrImage = await QRCode.toDataURL(qr_code);

  res.status(201).json(successResponse({ ...data, qr_image: qrImage }));
}));

router.get('/:id/qr', asyncHandler(async (req, res) => {
  const { data: empleado, error } = await supabase
    .from('empleados')
    .select('qr_code')
    .eq('id_empleado', req.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!empleado) return res.status(404).json({ success: false, error: 'Empleado no encontrado' });

  const qrImage = await QRCode.toDataURL(empleado.qr_code);
  res.json(successResponse({ qr_code: empleado.qr_code, qr_image: qrImage }));
}));

router.post('/:id/qr/regenerar', asyncHandler(async (req, res) => {
  // Mismo criterio de búsqueda que GET /:id/qr
  const { data: emp, error: findError } = await supabase
    .from('empleados')
    .select('id_empleado, Is_active')
    .eq('id_empleado', req.params.id)
    .maybeSingle();
 
  if (findError) throw findError;
  if (!emp) {
    return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
  }
  if (emp.Is_active !== "Activo") {
    return res.status(403).json({
      success: false,
      error: 'El empleado no está activo (estado: Baja). Cámbialo a "Activo" para que su QR funcione al escanear.',
    });
  }
 
  const empleado = await renewEmployeeQr(emp.id_empleado);
  if (!empleado) {
    return res.status(500).json({ success: false, error: 'No se pudo actualizar el QR' });
  }
 
  const qr_image = await QRCode.toDataURL(empleado.qr_code, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
 
  res.json(successResponse({ qr_image, regenerated_at: new Date().toISOString() }));
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