import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('plantas')
    .select('*')
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('plantas')
    .select('*')
    .eq('id_planta', req.params.id)
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['nombre_planta', 'id_cliente']);

  const { data, error } = await supabase
    .from('plantas')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(successResponse(data));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('plantas')
    .update(req.body)
    .eq('id_planta', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('plantas')
    .delete()
    .eq('id_planta', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;
