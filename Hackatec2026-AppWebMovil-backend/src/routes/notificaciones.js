import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
import { sendIncidentNotification } from '../service/emailService.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('id_notificacion', req.params.id)
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

// Crear notificación e intentar enviar correo si vienen emails
router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['id_usuario', 'titulo']);

  const { emailsTo, incidentDetails, ...notificationData } = req.body;

  const { data, error } = await supabase
    .from('notificaciones')
    .insert([notificationData])
    .select()
    .single();

  if (error) throw error;

  // Si la petición incluye destinatarios y detalles, se dispara el correo
  if (emailsTo && emailsTo.length > 0) {
    try {
      await sendIncidentNotification({
        emailsTo,
        subject: data.titulo || 'Nueva Notificación de Incidencia',
        incidentDetails: incidentDetails || data,
      });
    } catch (emailErr) {
      console.error('Error al enviar el correo automático:', emailErr);
    }
  }

  res.status(201).json(successResponse(data));
}));

// Endpoint exclusivo para envío directo de correos
router.post('/enviar-correo', asyncHandler(async (req, res) => {
  const { emailsTo, subject, incidentDetails } = req.body;

  if (!emailsTo || !incidentDetails) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios (emailsTo, incidentDetails)',
    });
  }

  const result = await sendIncidentNotification({
    emailsTo,
    subject: subject || 'Notificación de Incidencia',
    incidentDetails,
  });

  res.json(successResponse({ sent: true, info: result.response }));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('notificaciones')
    .update(req.body)
    .eq('id_notificacion', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('notificaciones')
    .delete()
    .eq('id_notificacion', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;