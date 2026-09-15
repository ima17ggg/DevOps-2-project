<<<<<<< HEAD
import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
=======
// routes/plantas.js
import express from 'express';
import { supabase } from '../utils/supabase.js'; // usa el mismo import que ya tengas en empleados.js
import { asyncHandler } from '../middleware/errors.js';
import { successResponse } from '../utils/validation.js';
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('plantas')
<<<<<<< HEAD
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
=======
    .select('id_planta, nombre, nombre_planta, ubicacion, latitud, longitud, radio_metros')
    .eq('activa', true);

  if (error) throw error;

  const plants = data
    .filter((p) => p.latitud != null && p.longitud != null)
    .map((p) => ({
      id_planta: p.id_planta,
      nombre: p.nombre_planta || p.nombre,   // tu tabla trae ambas columnas
      ubicacion: p.ubicacion,
      lat: Number(p.latitud),
      lng: Number(p.longitud),
      radio_metros: p.radio_metros ?? 100,
    }));

  res.json(successResponse(plants));
}));

export default router;
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
