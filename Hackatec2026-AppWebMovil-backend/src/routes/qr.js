import express from 'express';
import QRCode from 'qrcode';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Generate QR code for a plant
router.post('/generate', authenticateJWT, asyncHandler(async (req, res) => {
  const { id_planta } = req.body;
  validateRequired(req.body, ['id_planta']);

  // Create unique QR code
  const qrCode = `plant_${id_planta}_${Date.now()}`;

  // Save to database
  const { data, error } = await supabase
    .from('codigos_qr')
    .insert([{
      id_planta,
      codigo: qrCode,
      activo: true,
    }])
    .select()
    .single();

  if (error) throw error;

  // Generate QR image
  const qrImage = await QRCode.toDataURL(qrCode);

  res.json(successResponse({
    qr_id: data.id_qr,
    qr_code: qrCode,
    qr_image: qrImage,
    plant_id: id_planta,
  }));
}));

// Validate QR code
router.post('/validate', authenticateJWT, asyncHandler(async (req, res) => {
  const { code, id_planta } = req.body;
  validateRequired(req.body, ['code']);

  const { data, error } = await supabase
    .from('codigos_qr')
    .select('*')
    .eq('codigo', code)
    .eq('activo', true);

  if (error) throw error;

  const isValid = data.length > 0 && (!id_planta || data[0].id_planta === id_planta);

  res.json(successResponse({
    valid: isValid,
    qr_data: isValid ? data[0] : null,
  }));
}));

export default router;
