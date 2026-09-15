import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authenticateJWT } from './middleware/auth.js';
import { errorHandler, asyncHandler } from './middleware/errors.js';

// Route imports
import usuariosRouter from './routes/usuarios.js';
import empleadosRouter from './routes/empleados.js';
import asignacionesRouter from './routes/asignaciones.js';
import plantasRouter from './routes/plantas.js';
import asistenciasRouter from './routes/asistencias.js';
import actividadesRouter from './routes/actividades.js';
import codigosQrRouter from './routes/codigos_qr.js';
import incidenciasRouter from './routes/incidencias.js';
import notificacionesRouter from './routes/notificaciones.js';
import clientesRouter from './routes/clientes.js';
import authRouter from './routes/auth.js';
import qrRouter from './routes/qr.js';
import gpsRouter from './routes/gps.js';
import excelRouter from './routes/excel.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy' },
    error: null,
    timestamp: new Date().toISOString(),
  });
}));

// Authentication Routes (public)
app.use('/api/auth', authRouter);

// CRUD Routes (all protected)
app.use('/api/usuarios', authenticateJWT, usuariosRouter);
app.use('/api/empleados', authenticateJWT, empleadosRouter);
app.use('/api/asignaciones', authenticateJWT, asignacionesRouter);
app.use('/api/plantas', authenticateJWT, plantasRouter);
app.use('/api/asistencias', authenticateJWT, asistenciasRouter);
app.use('/api/actividades', authenticateJWT, actividadesRouter);
app.use('/api/codigos-qr', authenticateJWT, codigosQrRouter);
app.use('/api/incidencias', authenticateJWT, incidenciasRouter);
app.use('/api/notificaciones', authenticateJWT, notificacionesRouter);
app.use('/api/clientes', authenticateJWT, clientesRouter);

// Feature Routes
app.use('/api/qr', qrRouter); // May have public endpoints
app.use('/api/gps', authenticateJWT, gpsRouter);
app.use('/api/excel', authenticateJWT, excelRouter);
app.use('/api/dashboard', authenticateJWT, dashboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
