import express from 'express';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequired, successResponse } from '../utils/validation.js';
import { renewEmployeeQr } from '../utils/qrScheduler.js';

const router = express.Router();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida. Configúrala en las variables de entorno antes de arrancar el servidor.');
}
const JWT_SECRET = process.env.JWT_SECRET;

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const emailLower = String(email ?? '').trim().toLowerCase();

  validateRequired({ email: emailLower, password }, ['email', 'password']);

  // Buscar usuario en tabla usuarios
  const { data: user, error: dbError } = await supabase
    .from('usuarios')
    .select('id_usuario, email, "Password", activo, id_rol')
    .eq('email', emailLower)
    .maybeSingle();

  if (dbError) {
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Error en la base de datos',
      timestamp: new Date().toISOString(),
    });
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Email o contraseña inválidos',
      timestamp: new Date().toISOString(),
    });
  }

  if (!user.activo) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Usuario inactivo',
      timestamp: new Date().toISOString(),
    });
  }

  // Comparar password en texto plano (pendiente: migrar a hash con bcrypt)
  const passwordMatch = password === (user.Password ?? '');

  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Email o contraseña inválidos',
      timestamp: new Date().toISOString(),
    });
  }

  // Actualizar último acceso
  await supabase
    .from('usuarios')
    .update({ ultimo_acceso: new Date().toISOString() })
    .eq('id_usuario', user.id_usuario);

  // Generar JWT token
  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.cookie('auth_token', token, AUTH_COOKIE_OPTIONS);

  return res.json(successResponse({
    token,
    user: {
      id_usuario: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
    },
  }));
}));

// Login para la App Móvil (Expo) por ID de empleado o código externo
router.post('/employee-login', asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  validateRequired(req.body, ['identifier']);

  const cleanId = String(identifier).trim();
  const isNumeric = /^\d+$/.test(cleanId);

  let query = supabase
    .from('empleados')
    .select(`
      id_empleado,
      nombre,
      apellido_paterno,
      apellido_materno,
      id_externo,
      qr_code,
      Is_active,
      roles ( nombre ),
      plantas!empleados_id_planta_destino_fkey ( id_planta, nombre_planta, latitud, longitud, radio_metros )
    `);

  if (isNumeric) {
    query = query.eq('id_empleado', Number(cleanId));
  } else {
    query = query.eq('id_externo', cleanId);
  }

  const { data: empleado, error } = await query.maybeSingle();

  if (error) throw error;
  if (!empleado) {
    return res.status(404).json({
      success: false,
      error: 'Empleado no encontrado. Verifica tu ID de empleado o código externo.',
    });
  }

  if (empleado.Is_active !== 'Activo') {
    return res.status(403).json({
      success: false,
      error: 'El empleado no se encuentra activo.',
    });
  }

  // Asegurar que tenga un QR válido del día actual
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  let currentQr = empleado.qr_code;
  if (!currentQr || !currentQr.endsWith(today)) {
    const renewed = await renewEmployeeQr(empleado.id_empleado);
    if (renewed?.qr_code) currentQr = renewed.qr_code;
  }

  const qrImage = currentQr ? await QRCode.toDataURL(currentQr, { width: 512, margin: 2 }) : null;
  const fullName = [empleado.nombre, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean).join(' ');
  const roleName = empleado.roles?.nombre || 'Empleado';

  const token = jwt.sign(
    {
      id_empleado: empleado.id_empleado,
      name: fullName,
      role: roleName,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json(successResponse({
    token,
    employee: {
      id_empleado: empleado.id_empleado,
      id_externo: empleado.id_externo || `EMP-${empleado.id_empleado}`,
      name: fullName,
      role: roleName,
      plant: empleado.plantas?.nombre_planta || 'Planta Central',
      plant_coords: empleado.plantas
        ? {
            lat: empleado.plantas.latitud,
            lng: empleado.plantas.longitud,
            radius: empleado.plantas.radio_metros || 150,
          }
        : null,
      qr_code: currentQr,
      qr_image: qrImage,
    },
  }));
}));

router.get('/session', authenticateJWT, asyncHandler(async (req, res) => {
  return res.json(successResponse({
    user: {
      id_usuario: req.user.id_usuario,
      email: req.user.email,
      id_rol: req.user.id_rol,
    },
  }));
}));

router.post('/logout', asyncHandler(async (req, res) => {
  res.clearCookie('auth_token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.json(successResponse({
    message: 'Sesión cerrada correctamente',
  }));
}));

export default router;
