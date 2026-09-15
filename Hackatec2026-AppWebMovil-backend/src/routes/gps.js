import express from 'express';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, validateCoordinates, successResponse } from '../utils/validation.js';
import { calculateDistance, isWithinRadius } from '../utils/gps.js';

const router = express.Router();

// Validate if employee location is within plant radius
router.post('/validate-location', asyncHandler(async (req, res) => {
  const { employee_lat, employee_lon, id_planta } = req.body;

  validateRequired(req.body, ['employee_lat', 'employee_lon', 'id_planta']);
  validateCoordinates(employee_lat, employee_lon);

  // Get plant location and radius
  const { data: plant, error: plantError } = await supabase
    .from('plantas')
    .select('latitud, longitud, radio_metros')
    .eq('id_planta', id_planta)
    .single();

  if (plantError || !plant) {
    return res.status(404).json({
      success: false,
      data: null,
      error: 'Plant not found',
      timestamp: new Date().toISOString(),
    });
  }

  const isValid = isWithinRadius(
    employee_lat,
    employee_lon,
    plant.latitud,
    plant.longitud,
    plant.radio_metros
  );

  const distance = calculateDistance(
    employee_lat,
    employee_lon,
    plant.latitud,
    plant.longitud
  );

  res.json(successResponse({
    valid: isValid,
    distance_meters: Math.round(distance),
    allowed_radius_meters: plant.radio_metros,
    plant_id: id_planta,
  }));
}));

// Calculate distance between two points
router.get('/distance', asyncHandler(async (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.query;

  validateRequired(
    { lat1, lon1, lat2, lon2 },
    ['lat1', 'lon1', 'lat2', 'lon2']
  );

  validateCoordinates(parseFloat(lat1), parseFloat(lon1));
  validateCoordinates(parseFloat(lat2), parseFloat(lon2));

  const distance = calculateDistance(
    parseFloat(lat1),
    parseFloat(lon1),
    parseFloat(lat2),
    parseFloat(lon2)
  );

  res.json(successResponse({
    distance_meters: Math.round(distance),
    distance_km: (distance / 1000).toFixed(2),
  }));
}));

export default router;
