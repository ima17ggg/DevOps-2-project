import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('codigos_qr')
    .select('*')
    .limit(100);

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('codigos_qr')
    .select('*')
    .eq('id_qr', req.params.id)
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.get('/validate/:code', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('codigos_qr')
    .select('*')
    .eq('codigo', req.params.code)
    .eq('activo', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  res.json(successResponse({
    valid: !!data,
    data,
  }));
}));

router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['id_planta', 'codigo']);

  const { data, error } = await supabase
    .from('codigos_qr')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(successResponse(data));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('codigos_qr')
    .update(req.body)
    .eq('id_qr', req.params.id)
    .select()
    .single();

  if (error) throw error;
  res.json(successResponse(data));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('codigos_qr')
    .delete()
    .eq('id_qr', req.params.id);

  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));

export default router;
