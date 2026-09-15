import express from 'express';
import multer from 'multer';
<<<<<<< HEAD
import exceljs from 'exceljs';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
import { importEmployeesFromRows } from '../utils/excel-import.js';
=======
import { asyncHandler } from '../middleware/errors.js';
import { successResponse } from '../utils/validation.js';
import { importEmployeesFromRows, parseExcelBuffer } from '../utils/excel-import.js';
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(new Error('Only Excel files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

<<<<<<< HEAD
// Upload and import Excel file
router.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
=======
function requireFile(req, res) {
  if (!req.file) {
    res.status(400).json({
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
      success: false,
      data: null,
      error: 'No file provided',
      timestamp: new Date().toISOString(),
    });
<<<<<<< HEAD
  }

  const dryRun = req.query.dryRun === 'true';

  // Parse Excel
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const worksheet = workbook.worksheets[0];
  const filas = worksheet.getRows().map(row => row.values.slice(1)); // Remove the first element (row number)
=======
    return false;
  }
  return true;
}

// Upload and import Excel file
router.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  if (!requireFile(req, res)) return;

  const dryRun = req.query.dryRun === 'true';
  const filas = await parseExcelBuffer(req.file.buffer);
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

  if (filas.length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Excel file is empty',
      timestamp: new Date().toISOString(),
    });
  }

<<<<<<< HEAD
  // Import rows
=======
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  const results = await importEmployeesFromRows(filas, dryRun);

  res.json(successResponse({
    ...results,
    mode: dryRun ? 'dry-run' : 'production',
  }));
}));

<<<<<<< HEAD
// Validate Excel file before import
router.post('/validate', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'No file provided',
      timestamp: new Date().toISOString(),
    });
  }

  const libro = xlsx.read(req.file.buffer, { type: 'buffer' });
  const nombreHoja = libro.SheetNames[0];
  const hoja = libro.Sheets[nombreHoja];
  const filas = xlsx.utils.sheet_to_json(hoja);

  // Run dry import to validate
=======
// Validate Excel file before import (siempre corre en dry run)
router.post('/validate', upload.single('file'), asyncHandler(async (req, res) => {
  if (!requireFile(req, res)) return;

  const filas = await parseExcelBuffer(req.file.buffer);
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
  const results = await importEmployeesFromRows(filas, true);

  res.json(successResponse({
    ...results,
    rows_in_file: filas.length,
    first_rows_preview: filas.slice(0, 5),
  }));
}));

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
