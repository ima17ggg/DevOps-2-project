import crypto from 'node:crypto';
import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

const ALLOWED_PRIORITIES = new Set(['Normal', 'Alta', 'Crítica']);

function cleanText(value, maxLength = 1000) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function createFolio() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `INC-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function getEmployeeForUser(userId) {
  const { data, error } = await supabase
    .from('empleados')
    .select('id_empleado, nombre, apellido_paterno, apellido_materno')
    .eq('id_usuario', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getOwnIncident(incidentId, userId) {
  const { data, error } = await supabase
    .from('incidencias')
    .select('*')
    .eq('id_incidencia', incidentId)
    .eq('id_usuario', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw { statusCode: 404, message: 'Incidencia no encontrada' };
  }
  return data;
}

async function loadFollowUps(incidentId) {
  const { data, error } = await supabase
    .from('incidencia_seguimientos')
    .select('*')
    .eq('id_incidencia', String(incidentId))
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Lista únicamente las incidencias del usuario autenticado.
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('incidencias')
    .select('*')
    .eq('id_usuario', req.user.id_usuario)
    .order('fecha_reporte', { ascending: false })
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data || []));
}));

// La verificación de propietario evita consultar una incidencia ajena
// cambiando manualmente el ID en la URL.
router.get('/:id', asyncHandler(async (req, res) => {
  const incident = await getOwnIncident(req.params.id, req.user.id_usuario);
  const followUps = await loadFollowUps(incident.id_incidencia);
  res.json(successResponse({ ...incident, seguimientos: followUps }));
}));

router.post('/', asyncHandler(async (req, res) => {
  const asunto = cleanText(req.body.asunto, 160);
  const tipo = cleanText(req.body.tipo, 80);
  const descripcion = cleanText(req.body.descripcion, 4000);
  const prioridad = cleanText(req.body.prioridad || 'Normal', 20);

  validateRequired({ asunto, tipo, descripcion }, ['asunto', 'tipo', 'descripcion']);

  if (!ALLOWED_PRIORITIES.has(prioridad)) {
    throw { statusCode: 400, message: 'La prioridad seleccionada no es válida' };
  }

  const employee = await getEmployeeForUser(req.user.id_usuario);
  if (!employee) {
    throw {
      statusCode: 400,
      message: 'El usuario autenticado no está vinculado con un empleado',
    };
  }

  const now = new Date().toISOString();
  const payload = {
    id_usuario: req.user.id_usuario,
    id_empleado: employee.id_empleado,
    folio: createFolio(),
    asunto,
    tipo,
    descripcion,
    prioridad,
    ubicacion: cleanText(req.body.ubicacion, 200) || null,
    evidencia_url: cleanText(req.body.evidencia_url, 1000) || null,
    estatus: 'Abierta',
    fecha_reporte: now,
    updated_at: now,
  };

  const { data: incident, error } = await supabase
    .from('incidencias')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  res.status(201).json(successResponse({ ...incident, seguimientos: [] }));
}));

router.post('/:id/seguimientos', asyncHandler(async (req, res) => {
  const comentario = cleanText(req.body.comentario, 3000);
  validateRequired({ comentario }, ['comentario']);

  const incident = await getOwnIncident(req.params.id, req.user.id_usuario);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('incidencia_seguimientos')
    .insert([{
      id_incidencia: String(incident.id_incidencia),
      id_usuario: req.user.id_usuario,
      autor_email: req.user.email,
      comentario,
      estado: incident.estatus || incident.estado || 'Abierta',
    }])
    .select()
    .single();

  if (error) throw error;

  const { error: updateError } = await supabase
    .from('incidencias')
    .update({ updated_at: now })
    .eq('id_incidencia', incident.id_incidencia)
    .eq('id_usuario', req.user.id_usuario);

  if (updateError) throw updateError;
  res.status(201).json(successResponse(data));
}));

export default router;
