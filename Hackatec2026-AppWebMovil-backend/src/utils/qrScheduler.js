import cron from 'node-cron';
import crypto from 'crypto';
import { supabase } from './supabase.js';

/**
 * Renueva los códigos QR de todos los empleados activos.
 * Formato: EMP-{uuid}-YYYY-MM-DD
 */
export async function renewAllQrCodes() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

  const { data: empleados, error: fetchError } = await supabase
    .from('empleados')
    .select('id_empleado')
    .eq('Is_active', 'Activo');

  if (fetchError) {
    console.error('[QR-Scheduler] Error al consultar empleados:', fetchError.message);
    return;
  }

  if (!empleados || empleados.length === 0) {
    console.log('[QR-Scheduler] No hay empleados activos para renovar QR.');
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const emp of empleados) {
    const newQr = `EMP-${crypto.randomUUID()}-${today}`;

    const { error: updateError } = await supabase
      .from('empleados')
      .update({ qr_code: newQr })
      .eq('id_empleado', emp.id_empleado);

    if (updateError) {
      console.error(`[QR-Scheduler] Error renovando QR para empleado ${emp.id_empleado}:`, updateError.message);
      failed++;
    } else {
      updated++;
    }
  }

  console.log(`[QR-Scheduler] Renovación completada: ${updated} actualizados, ${failed} fallidos.`);
}

/**
 * Inicia el cron job que renueva QR a medianoche (00:00) hora de México.
 */
export function startQrScheduler() {
  // Ejecutar a las 00:00 todos los días, zona horaria America/Mexico_City
  cron.schedule('0 0 * * *', async () => {
    console.log(`[QR-Scheduler] Iniciando renovación diaria de QR - ${new Date().toISOString()}`);
    await renewAllQrCodes();
  }, {
    timezone: 'America/Mexico_City',
  });

  console.log('[QR-Scheduler] ⏰ Cron programado: renovación de QR a las 00:00 (America/Mexico_City)');
}

export async function renewEmployeeQr(id_empleado) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const newQr = `EMP-${crypto.randomUUID()}-${today}`;
 
  const { data, error } = await supabase
    .from('empleados')
    .update({ qr_code: newQr })
    .eq('id_empleado', id_empleado)
    .eq('Is_active', 'Activo')
    .select('id_empleado, qr_code')
    .maybeSingle();
 
  if (error) throw error;
  return data;
}
 