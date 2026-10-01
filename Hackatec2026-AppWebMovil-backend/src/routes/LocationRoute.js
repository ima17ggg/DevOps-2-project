// routes/locationRoute.js
import express from "express";
import asyncHandler from "express-async-handler";
import { validateRequired, validateCoordinates, successResponse } from "../utils/validation.js";
import * as locationService from "../service/LocationService.js";

const router = express.Router();

import { authenticateJWT } from '../middleware/auth.js';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const requestLogByIp = new Map();

function rateLimitByIp(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const timestamps = requestLogByIp.get(ip) ?? [];
  const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ success: false, error: 'Too many requests' });
  }

  recent.push(now);
  requestLogByIp.set(ip, recent);
  next();
}

router.post('/', asyncHandler(async (req, res) => {
  const { employeeId, lat, lng } = req.body;
  validateRequired(req.body, ['employeeId', 'lat', 'lng']);
  validateCoordinates(lat, lng);

  const location = await locationService.saveLocation(employeeId, lat, lng);
  res.json(successResponse(location));
}));

router.get('/', authenticateJWT, rateLimitByIp, asyncHandler(async (req, res) => {
  const locations = await locationService.getLocations();
  res.json(successResponse(locations));
}));

export default router;