import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
 
const router = express.Router();
 
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .limit(100);
 
  if (error) throw error;
  res.json(successResponse(data));
}));
 
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id_rol', req.params.id)
    .single();
 
  if (error) throw error;
  res.json(successResponse(data));
}));
 
router.post('/', asyncHandler(async (req, res) => {
  // Ajusta este arreglo si tu tabla roles tiene más columnas NOT NULL
  validateRequired(req.body, ['nombre']);
 
  const { data, error } = await supabase
    .from('roles')
    .insert([req.body])
    .select()
    .single();
 
  if (error) throw error;
  res.status(201).json(successResponse(data));
}));
 
router.put('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('roles')
    .update(req.body)
    .eq('id_rol', req.params.id)
    .select()
    .single();
 
  if (error) throw error;
  res.json(successResponse(data));
}));
 
router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id_rol', req.params.id);
 
  if (error) throw error;
  res.json(successResponse({ deleted: true }));
}));
 
export default router;