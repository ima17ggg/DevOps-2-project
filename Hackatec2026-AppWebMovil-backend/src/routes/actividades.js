import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('id_actividad', req.params.id)
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['id_asistencia', 'descripcion']);

  const { data, error } = await supabase
    .from('actividades')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(successResponse(data));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('actividades')
    .update(req.body)
    .eq('id_actividad', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('actividades')
    .delete()
    .eq('id_actividad', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;
