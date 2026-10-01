import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { successResponse } from '../utils/validation.js';

const router = express.Router();

const DEFAULT_LIMIT = 500;

function parseLimit(value) {
  const limit = Number(value || DEFAULT_LIMIT);
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), 1000);
}

function getRecordDate(record) {
  return record.fecha_reporte || record.fecha || record.created_at || record.updated_at || null;
}

function isWithinDateRange(record, startDate, endDate) {
  const rawDate = getRecordDate(record);
  if (!rawDate) return true;

  const date = String(rawDate).slice(0, 10);
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function normalizeStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  if (!status) return 'sin estado';
  return status;
}

function isOpenIncident(incident) {
  const status = normalizeStatus(incident.estatus || incident.estado || incident.status);
  return ['abierta', 'abierto', 'pendiente', 'critica', 'crítica', 'open', 'pending'].some((item) => status.includes(item));
}

function isCriticalIncident(incident) {
  const fields = [
    incident.prioridad,
    incident.severidad,
    incident.estatus,
    incident.estado,
    incident.tipo,
  ].map((value) => String(value || '').toLowerCase());

  return fields.some((value) => value.includes('crit') || value.includes('alta') || value.includes('grave'));
}

function indexBy(items, key) {
  return new Map((items || []).map((item) => [item[key], item]));
}

function fullName(employee) {
  return [employee?.nombre, employee?.apellido_paterno, employee?.apellido_materno]
    .filter(Boolean)
    .join(' ') || 'Empleado no especificado';
}

function buildTrend(records) {
  const buckets = new Map();

  for (const record of records) {
    const date = String(getRecordDate(record) || '').slice(0, 10);
    if (!date) continue;
    buckets.set(date, (buckets.get(date) || 0) + 1);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

async function loadReportData({ startDate, endDate, limit }) {
  const [
    { data: incidencias, error: incidenciasError },
    { data: asistencias, error: asistenciasError },
    { data: empleados, error: empleadosError },
    { data: plantas, error: plantasError },
  ] = await Promise.all([
    supabase.from('incidencias').select('*').limit(limit),
    supabase.from('asistencias').select('*').limit(limit),
    supabase.from('empleados').select('id_empleado, nombre, apellido_paterno, apellido_materno, id_externo, id_planta_destino').limit(1000),
    supabase.from('plantas').select('id_planta, nombre_planta, nombre, ubicacion').limit(1000),
  ]);

  if (incidenciasError) throw incidenciasError;
  if (asistenciasError) throw asistenciasError;
  if (empleadosError) throw empleadosError;
  if (plantasError) throw plantasError;

  const employeeById = indexBy(empleados, 'id_empleado');
  const plantById = indexBy(plantas, 'id_planta');

  const filteredIncidents = (incidencias || [])
    .filter((incident) => isWithinDateRange(incident, startDate, endDate))
    .map((incident) => {
      const employee = employeeById.get(incident.id_empleado);
      const plant = plantById.get(incident.id_planta || employee?.id_planta_destino);

      return {
        ...incident,
        folio: incident.folio || `INC-${incident.id_incidencia ?? 'S/N'}`,
        fecha: getRecordDate(incident),
        empleado: fullName(employee),
        ubicacion: plant?.nombre_planta || plant?.nombre || plant?.ubicacion || 'Sin ubicación',
        estado: incident.estatus || incident.estado || incident.status || 'Sin estado',
        prioridad: incident.prioridad || incident.severidad || (isCriticalIncident(incident) ? 'Crítica' : 'Normal'),
      };
    });

  const filteredAttendance = (asistencias || [])
    .filter((attendance) => isWithinDateRange(attendance, startDate, endDate))
    .map((attendance) => {
      const employee = employeeById.get(attendance.id_empleado);
      const plant = plantById.get(attendance.id_planta || employee?.id_planta_destino);

      return {
        ...attendance,
        empleado: fullName(employee),
        ubicacion: plant?.nombre_planta || plant?.nombre || plant?.ubicacion || 'Sin ubicación',
      };
    });

  const attendanceWithEntry = filteredAttendance.filter((item) => item.hora_entrada);
  const completedAttendance = filteredAttendance.filter((item) => item.hora_entrada && item.hora_salida);
  const totalWorkedHours = filteredAttendance.reduce((sum, item) => sum + Number(item.horas_trabajadas || 0), 0);

  return {
    summary: {
      total_incidencias: filteredIncidents.length,
      incidencias_abiertas: filteredIncidents.filter(isOpenIncident).length,
      incidencias_criticas: filteredIncidents.filter(isCriticalIncident).length,
      asistencias_registradas: filteredAttendance.length,
      asistencias_con_entrada: attendanceWithEntry.length,
      asistencias_completadas: completedAttendance.length,
      horas_trabajadas: Number(totalWorkedHours.toFixed(2)),
      tasa_cierre_asistencia: filteredAttendance.length
        ? Math.round((completedAttendance.length / filteredAttendance.length) * 100)
        : 0,
    },
    incidencias: filteredIncidents,
    asistencias: filteredAttendance,
    tendencia_incidencias: buildTrend(filteredIncidents),
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const data = await loadReportData({
    startDate: req.query.start_date,
    endDate: req.query.end_date,
    limit: parseLimit(req.query.limit),
  });

  res.json(successResponse(data));
}));

router.get('/incidencias', asyncHandler(async (req, res) => {
  const data = await loadReportData({
    startDate: req.query.start_date,
    endDate: req.query.end_date,
    limit: parseLimit(req.query.limit),
  });

  res.json(successResponse(data.incidencias));
}));

router.get('/asistencias', asyncHandler(async (req, res) => {
  const data = await loadReportData({
    startDate: req.query.start_date,
    endDate: req.query.end_date,
    limit: parseLimit(req.query.limit),
  });

  res.json(successResponse(data.asistencias));
}));

export default router;