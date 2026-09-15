import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { successResponse } from '../utils/validation.js';

const router = express.Router();

// Get employees assigned to a supervisor
router.get('/supervisor/:supervisorId/employees', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('asignaciones_empleado')
    .select(`
      id_asignacion,
      fecha_inicio,
      fecha_fin,
      activo,
      empleados:id_empleado(
        id_empleado,
        nombre,
        apellido_paterno,
        apellido_materno,
        rfc,
        telefono,
        foto_perfil
      )
    `)
    .eq('id_supervisor', req.params.supervisorId)
    .eq('activo', true);

  if (error) throw error;

  const employees = data.map(a => ({
    ...a.empleados,
    assigned_since: a.fecha_inicio,
  }));

  res.json(successResponse(employees));
}));

// Get today's attendance for supervisor's employees
router.get('/supervisor/:supervisorId/attendance/today', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: assignments, error: assignError } = await supabase
    .from('asignaciones_empleado')
    .select('id_empleado')
    .eq('id_supervisor', req.params.supervisorId)
    .eq('activo', true);

  if (assignError) throw assignError;

  const employeeIds = assignments.map(a => a.id_empleado);

  if (employeeIds.length === 0) {
    return res.json(successResponse([]));
  }

  const { data: attendance, error: attendError } = await supabase
    .from('asistencias')
    .select(`
      id_asistencia,
      fecha,
      hora_entrada,
      hora_salida,
      qr_validado,
      horas_trabajadas,
      estatus,
      empleados:id_empleado(nombre, apellido_paterno),
      plantas:id_planta(nombre_planta)
    `)
    .eq('fecha', today)
    .in('id_empleado', employeeIds);

  if (attendError) throw attendError;

  res.json(successResponse(attendance));
}));

// Get attendance for date range
router.get('/supervisor/:supervisorId/attendance/range', asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'start_date and end_date query parameters required',
      timestamp: new Date().toISOString(),
    });
  }

  const { data: assignments } = await supabase
    .from('asignaciones_empleado')
    .select('id_empleado')
    .eq('id_supervisor', req.params.supervisorId)
    .eq('activo', true);

  const employeeIds = assignments.map(a => a.id_empleado);

  if (employeeIds.length === 0) {
    return res.json(successResponse([]));
  }

  const { data: attendance, error } = await supabase
    .from('asistencias')
    .select('*')
    .gte('fecha', start_date)
    .lte('fecha', end_date)
    .in('id_empleado', employeeIds)
    .order('fecha', { ascending: false });

  if (error) throw error;

  res.json(successResponse(attendance));
}));

// Get total hours worked by employee
router.get('/employee/:employeeId/hours', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('asistencias')
    .select('horas_trabajadas, fecha')
    .eq('id_empleado', req.params.employeeId);

  if (error) throw error;

  const totalHours = data.reduce((sum, a) => sum + (a.horas_trabajadas || 0), 0);
  const attendanceDays = data.length;

  res.json(successResponse({
    total_hours: totalHours.toFixed(2),
    attendance_days: attendanceDays,
    average_hours_per_day: attendanceDays > 0 ? (totalHours / attendanceDays).toFixed(2) : 0,
  }));
}));

// Get employee incidents
router.get('/employee/:employeeId/incidents', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('incidencias')
    .select('*')
    .eq('id_empleado', req.params.employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json(successResponse(data));
}));

// Summary dashboard for supervisor
router.get('/supervisor/:supervisorId/summary', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // Get employees
  const { data: assignments } = await supabase
    .from('asignaciones_empleado')
    .select('id_empleado')
    .eq('id_supervisor', req.params.supervisorId)
    .eq('activo', true);

  const employeeIds = assignments.map(a => a.id_empleado);

  // Get today's attendance
  const { data: todayAttendance } = await supabase
    .from('asistencias')
    .select('id_empleado, estatus')
    .eq('fecha', today)
    .in('id_empleado', employeeIds);

  const presentToday = new Set(todayAttendance.map(a => a.id_empleado)).size;

  // Get pending QR validations
  const { data: pendingQR } = await supabase
    .from('asistencias')
    .select('count', { count: 'exact' })
    .eq('fecha', today)
    .eq('qr_validado', false)
    .in('id_empleado', employeeIds);

  res.json(successResponse({
    total_employees: employeeIds.length,
    present_today: presentToday,
    absent_today: employeeIds.length - presentToday,
    pending_qr_validations: pendingQR ? pendingQR[0].count : 0,
  }));
}));

export default router;
