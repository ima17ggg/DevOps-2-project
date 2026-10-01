// routes/locationRoute.js
import express from "express";
import asyncHandler from "express-async-handler";
import { rateLimit } from "express-rate-limit";
import { validateRequired, validateCoordinates, successResponse } from "../utils/validation.js";
import * as locationService from "../service/LocationService.js";

const router = express.Router();

import { authenticateJWT } from '../middleware/auth.js';

const locationReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', asyncHandler(async (req, res) => {
  const { employeeId, lat, lng } = req.body;
  validateRequired(req.body, ['employeeId', 'lat', 'lng']);
  validateCoordinates(lat, lng);

  const location = await locationService.saveLocation(employeeId, lat, lng);
  res.json(successResponse(location));
}));

router.get('/', authenticateJWT, locationReadLimiter, asyncHandler(async (req, res) => {
  const locations = await locationService.getLocations();
  res.json(successResponse(locations));
}));

export default router;