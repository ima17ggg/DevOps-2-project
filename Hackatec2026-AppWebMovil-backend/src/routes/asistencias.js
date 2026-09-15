import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('id_asistencia', req.params.id)
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/employee/:employeeId/today', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('id_empleado', req.params.employeeId)
    .eq('fecha', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  res.json(successResponse(data || null));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['id_empleado', 'fecha']);

  const { data, error } = await supabase
    .from('asistencias')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(successResponse(data));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('asistencias')
    .update(req.body)
    .eq('id_asistencia', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('asistencias')
    .delete()
    .eq('id_asistencia', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;
