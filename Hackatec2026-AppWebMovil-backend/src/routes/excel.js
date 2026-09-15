import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/errors.js';
import { successResponse } from '../utils/validation.js';
import { importEmployeesFromRows, parseExcelBuffer } from '../utils/excel-import.js';

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

function requireFile(req, res) {
  if (!req.file) {
    res.status(400).json({
      success: false,
      data: null,
      error: 'No file provided',
      timestamp: new Date().toISOString(),
    });
    return false;
  }
  return true;
}

// Upload and import Excel file
router.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  if (!requireFile(req, res)) return;

  const dryRun = req.query.dryRun === 'true';
  const filas = await parseExcelBuffer(req.file.buffer);

  if (filas.length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Excel file is empty',
      timestamp: new Date().toISOString(),
    });
  }

  const results = await importEmployeesFromRows(filas, dryRun);

  res.json(successResponse({
    ...results,
    mode: dryRun ? 'dry-run' : 'production',
  }));
}));

// Validate Excel file before import (siempre corre en dry run)
router.post('/validate', upload.single('file'), asyncHandler(async (req, res) => {
  if (!requireFile(req, res)) return;

  const filas = await parseExcelBuffer(req.file.buffer);
  const results = await importEmployeesFromRows(filas, true);

  res.json(successResponse({
    ...results,
    rows_in_file: filas.length,
    first_rows_preview: filas.slice(0, 5),
  }));
}));

export default router;