// routes/locationRoute.js
import express from "express";
import asyncHandler from "express-async-handler";
import { validateRequired, validateCoordinates } from "../utils/validation.js";
import { successResponse } from "../utils/response.js";
import * as locationService from "../services/locationService.js";

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { employeeId, lat, lng } = req.body;
  validateRequired(req.body, ['employeeId', 'lat', 'lng']);
  validateCoordinates(lat, lng);

  const location = await locationService.saveLocation(employeeId, lat, lng);
  res.json(successResponse(location));
}));

router.get('/', asyncHandler(async (req, res) => {
  const locations = await locationService.getLocations();
  res.json(successResponse(locations));
}));

export default router;