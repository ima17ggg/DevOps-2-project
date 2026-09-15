import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase.js';
import { asyncHandler } from '../middleware/errors.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateRequired, successResponse } from '../utils/validation.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
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

  // Comparar password con hash
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
    user: {
      id_usuario: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
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
  res.clearCookie('auth_token', { path: '/' });

  return res.json(successResponse({
    message: 'Sesión cerrada correctamente',
  }));
}));

export default router;