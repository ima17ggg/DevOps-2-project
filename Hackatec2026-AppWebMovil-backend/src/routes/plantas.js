// routes/plantas.js
import express from 'express';
import { supabase } from '../utils/supabase.js'; // usa el mismo import que ya tengas en empleados.js
import { asyncHandler } from '../middleware/errors.js';
import { successResponse } from '../utils/validation.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('plantas')
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