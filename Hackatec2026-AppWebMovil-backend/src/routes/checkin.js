import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

// Identifica al dueño de un QR (paso de escaneo) — valida que el QR sea del día actual
router.get('/scan/:code', asyncHandler(async (req, res) => {
  const code = req.params.code;

  // Validar que el QR contiene la fecha de hoy (formato: EMP-{uuid}-YYYY-MM-DD)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const qrDateMatch = code.match(/(\d{4}-\d{2}-\d{2})$/);

  if (!qrDateMatch || qrDateMatch[1] !== today) {
    return res.status(410).json({ success: false, error: 'QR expirado. Se requiere el código del día actual.' });
  }

  const { data: empleado, error } = await supabase
    .from('empleados')
    .select(`
      id_empleado, nombre, apellido_paterno, apellido_materno, id_externo,
      roles ( nombre ),
      plantas!empleados_id_planta_destino_fkey ( id_planta, nombre_planta )
    `)
    .eq('qr_code', code)
    .eq('Is_active', 'Activo')
    .maybeSingle();

  if (error) throw error;
  if (!empleado) return res.status(404).json({ success: false, error: 'QR no reconocido' });

  res.json(successResponse({
    id: empleado.id_externo || `EMP-${empleado.id_empleado}`,
    id_empleado: empleado.id_empleado,
    name: [empleado.nombre, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean).join(' '),
    role: empleado.roles?.nombre || 'Sin rol asignado',
    plant: empleado.plantas?.nombre_planta || 'Sin planta asignada',
  }));
}));

// Registra entrada o salida y calcula horas trabajadas
router.post('/registrar', asyncHandler(async (req, res) => {
  const { id_empleado } = req.body;
  validateRequired(req.body, ['id_empleado']);

  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const { data: asistencia, error: findError } = await supabase
    .from('asistencias')
    .select('*')
    .eq('id_empleado', id_empleado)
    .eq('fecha', today)
    .maybeSingle();

  if (findError) throw findError;

  if (!asistencia) {
    const { data, error } = await supabase
      .from('asistencias')
      .insert([{ id_empleado, fecha: today, hora_entrada: nowIso, qr_validado: true }])
      .select()
      .single();
    if (error) throw error;
    return res.json(successResponse({ tipo: 'entrada', asistencia: data }));
  }

  if (asistencia.hora_entrada && !asistencia.hora_salida) {
    const { data, error } = await supabase
      .from('asistencias')
      .update({ hora_salida: nowIso })
      .eq('id_asistencia', asistencia.id_asistencia)
      .select()
      .single();
    if (error) throw error;

    const horas = (new Date(data.hora_salida) - new Date(data.hora_entrada)) / 3600000;
    return res.json(successResponse({ tipo: 'salida', asistencia: data, horas_trabajadas: Number(horas.toFixed(2)) }));
  }

  return res.status(409).json({ success: false, error: 'Ya se registró entrada y salida hoy para este empleado' });
}));

export default router;