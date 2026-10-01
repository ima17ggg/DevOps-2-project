import ExcelJS from 'exceljs';
import { supabase } from './supabase.js';

const ID_ROL_DEFAULT = 1;

const ALIASES = {
  nombre: ['nombre', 'nombres', 'nombre_s'],
  apellido_paterno: ['apellido_paterno', 'ap_paterno', 'apellido_p'],
  apellido_materno: ['apellido_materno', 'ap_materno', 'apellido_m'],
  telefono: ['telefono', 'tel', 'telefono_movil', 'celular'],
  rfc: ['rfc'],
  fecha_ingreso: ['fecha_ingreso', 'fecha_de_ingreso', 'ingreso'],
  id_rol: ['id_rol', 'rol'],
  id_planta_destino: ['id_planta_destino', 'planta', 'id_planta'],
  codigo_empleado: [
    'codigo_empleado',
    'codigo',
    'id_externo',
    'no_empleado',
    'numero_empleado'
  ],
};

const normalize = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toField = (header) => {
  const key = normalize(header);

  return (
    Object.keys(ALIASES).find((field) =>
      ALIASES[field].includes(key)
    ) || key
  );
};

// Convierte el valor de una celda de Excel a un valor simple
const cellValue = (v) => {
  if (v && typeof v === 'object') {
    if (v.richText) {
      return v.richText.map((r) => r.text).join('');
    }

    if ('result' in v) {
      return v.result;
    }

    if ('text' in v) {
      return typeof v.text === 'object'
        ? cellValue(v.text)
        : v.text;
    }

    if (v instanceof Date) {
      return v;
    }

    return '';
  }

  return v;
};

// Convierte una fecha de Excel a YYYY-MM-DD
const formatDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
};

export async function parseExcelBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer);

  // Busca la primera hoja que tenga encabezados reconocibles
  for (const worksheet of workbook.worksheets) {
    let headerRowNumber = null;

    worksheet.eachRow((row, n) => {
      if (headerRowNumber) return;

      const keys = [];

      row.eachCell(
        { includeEmpty: false },
        (cell) => {
          keys.push(toField(cellValue(cell.value)));
        }
      );

      if (
        keys.includes('nombre') ||
        keys.includes('rfc')
      ) {
        headerRowNumber = n;
      }
    });

    if (!headerRowNumber) continue;

    const headers = [];

    worksheet
      .getRow(headerRowNumber)
      .eachCell(
        { includeEmpty: false },
        (cell, col) => {
          headers[col] = toField(
            cellValue(cell.value)
          );
        }
      );

    const rows = [];

    worksheet.eachRow((row, n) => {
      if (n <= headerRowNumber) return;

      const rowData = {};
      let hasValue = false;

      row.eachCell(
        { includeEmpty: true },
        (cell, col) => {
          const key = headers[col];

          if (!key) return;

          const value = cellValue(cell.value);

          if (
            value !== null &&
            value !== undefined &&
            value !== ''
          ) {
            hasValue = true;
          }

          rowData[key] =
            typeof value === 'string'
              ? value.trim()
              : value;
        }
      );

      if (hasValue) {
        rows.push(rowData);
      }
    });

    return rows;
  }

  return [];
}

export async function importEmployeesFromRows(
  rows,
  dryRun = false
) {
  const results = {
    success: [],
    failed: [],
    total: rows.length,
  };

  for (let i = 0; i < rows.length; i++) {
    const fila = rows[i];

    try {
      // Campos obligatorios
      if (!fila.nombre || !fila.rfc) {
        throw new Error(
          'Missing required fields: nombre, rfc'
        );
      }

      const fechaIngreso =
        formatDate(fila.fecha_ingreso);

      if (!fechaIngreso) {
        throw new Error(
          'Missing or invalid field: fecha_ingreso'
        );
      }

      // Solo validación
      if (dryRun) {
        results.success.push({
          row: i + 1,
          nombre: fila.nombre,
          rfc: fila.rfc,
          status: 'valid (dry run)',
        });

        continue;
      }

      // Insertar empleado
      const empleadoData = {
        nombre: fila.nombre,
        apellido_paterno:
          fila.apellido_paterno || '',
        apellido_materno:
          fila.apellido_materno || '',
        telefono:
          fila.telefono || '',
        rfc: fila.rfc,
        fecha_ingreso: fechaIngreso,
        id_rol:
          fila.id_rol || ID_ROL_DEFAULT,
        id_planta_destino:
          fila.id_planta_destino || null,
        id_externo:
          fila.codigo_empleado || null,
      };

      const {
        data: empleado,
        error: errEmp,
      } = await supabase
        .from('empleados')
        .insert([empleadoData])
        .select()
        .single();

      if (errEmp) {
        throw new Error(
          `Empleado: ${errEmp.message}`
        );
      }

      results.success.push({
        row: i + 1,
        id: empleado.id_empleado,
        nombre: empleado.nombre,
        rfc: empleado.rfc,
        status: 'imported',
      });
    } catch (error) {
      results.failed.push({
        row: i + 1,
        nombre: fila.nombre || '',
        rfc: fila.rfc || '',
        error: error.message,
      });
    }
  }

  return results;
}

