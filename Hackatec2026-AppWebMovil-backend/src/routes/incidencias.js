import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('incidencias')
    .select('*')
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('incidencias')
    .select('*')
    .eq('id_incidencia', req.params.id)
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['id_empleado', 'tipo']);

  const { data, error } = await supabase
    .from('incidencias')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(successResponse(data));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('incidencias')
    .update(req.body)
    .eq('id_incidencia', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('incidencias')
    .delete()
    .eq('id_incidencia', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;
