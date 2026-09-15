import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, validateEmail, successResponse } from '../utils/validation.js';

const router = express.Router();

// GET all users
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .limit(100);

  if (error) throw error;

  res.json(successResponse(data));
}));

// GET user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id_usuario', req.params.id)
    .single();

  if (error) throw error;

  res.json(successResponse(data));
}));

// CREATE user
router.post('/', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['correo', 'id_rol']);
  validateEmail(req.body.correo);

  const { data, error } = await supabase
    .from('usuarios')
    .insert([req.body])
    .select()
    .single();

  if (error) throw error;

  res.status(201).json(successResponse(data));
}));

// UPDATE user
router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(req.body)
    .eq('id_usuario', req.params.id)
    .select()
    .single();

  if (error) throw error;

  res.json(successResponse(data));
}));

// DELETE user
router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id_usuario', req.params.id);

  if (error) throw error;

  res.json(successResponse({ deleted: true }));
}));

export default router;
