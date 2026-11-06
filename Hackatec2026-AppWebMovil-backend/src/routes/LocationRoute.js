// routes/locationRoute.js
import express from "express";
import asyncHandler from "express-async-handler";
import { rateLimit } from "express-rate-limit";
import { validateRequired, validateCoordinates, successResponse } from "../utils/validation.js";
import * as locationService from "../service/LocationService.js";

const router = express.Router();

import { authenticateJWT } from '../middleware/auth.js';

router.post('/', asyncHandler(async (req, res) => {
  const { employeeId, id_externo, id_empleado, lat, lng, name, role, inside_geofence, nombre_planta } = req.body;
  const resolvedId = id_externo ?? employeeId ?? id_empleado;
  validateRequired({ employeeId: resolvedId, lat, lng }, ['employeeId', 'lat', 'lng']);
  validateCoordinates(lat, lng);

  const location = await locationService.saveLocation(resolvedId, lat, lng, {
    name,
    role,
    inside_geofence,
    nombre_planta,
  });
  res.json(successResponse(location));
}));

router.get('/', rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}), authenticateJWT, asyncHandler(async (req, res) => {
  const locations = await locationService.getLocations();
  res.json(successResponse(locations));
}));

export default router;