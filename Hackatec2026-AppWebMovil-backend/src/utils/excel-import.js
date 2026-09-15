import { v4 as uuidv4 } from 'uuid';
import ExcelJS from 'exceljs';
import { supabase } from './supabase.js';

const ID_ROL_DEFAULT = 1;

// Convierte el buffer de un .xlsx/.xls en un arreglo de objetos usando la
// primera fila como encabezados (correo, nombre, apellido_paterno, rfc,
// codigo_empleado, etc.). Los encabezados se normalizan a minúsculas y sin
// espacios extra para que no importe cómo los capturaron en el Excel.
export async function parseExcelBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) return [];

  const headers = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim().toLowerCase();
  });

  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // encabezado

    const rowData = {};
    let hasValue = false;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (!key) return;

      let value = cell.value;

      // exceljs puede regresar objetos para rich text o hipervínculos
      if (value && typeof value === 'object') {
        value = value.text ?? value.result ?? '';
      }

      if (value !== null && value !== undefined && value !== '') hasValue = true;

      rowData[key] = typeof value === 'string' ? value.trim() : value;
    });

    if (hasValue) rows.push(rowData);
  });

  return rows;
}

export async function importEmployeesFromRows(rows, dryRun = false) {
  const results = {
    success: [],
    failed: [],
    total: rows.length,
  };

  for (let i = 0; i < rows.length; i++) {
    const fila = rows[i];
    try {
      if (!fila.correo || !fila.nombre || !fila.rfc) {
        throw new Error('Missing required fields: correo, nombre, rfc');
      }

      if (dryRun) {
        results.success.push({
          row: i + 1,
          email: fila.correo,
          status: 'valid (dry run)',
        });
        continue;
      }

      const nuevoIdUsuario = uuidv4();

      // Insert usuario
      const { data: usuario, error: errUsu } = await supabase
        .from('usuarios')
        .insert([{
          id_usuario: nuevoIdUsuario,
          correo: fila.correo,
          id_rol: ID_ROL_DEFAULT,
        }])
        .select()
        .single();

      if (errUsu) throw new Error(`Usuario: ${errUsu.message}`);

      // Insert empleado
      const { data: empleado, error: errEmp } = await supabase
        .from('empleados')
        .insert([{
          id_usuario: nuevoIdUsuario,
          nombre: fila.nombre,
          apellido_paterno: fila.apellido_paterno || '',
          rfc: fila.rfc,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          id_externo: fila.codigo_empleado || '',
        }])
        .select()
        .single();

      if (errEmp) throw new Error(`Empleado: ${errEmp.message}`);

      results.success.push({
        row: i + 1,
        email: fila.correo,
        id: empleado.id_empleado,
        status: 'imported',
      });
    } catch (error) {
      results.failed.push({
        row: i + 1,
        email: fila.correo || 'unknown',
        error: error.message,
      });
    }
  }

  return results;
}