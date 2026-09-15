import express from 'express';
import multer from 'multer';
import exceljs from 'exceljs';
import { asyncHandler } from '../middleware/errors.js';
import { validateRequired, successResponse } from '../utils/validation.js';
import { importEmployeesFromRows } from '../utils/excel-import.js';

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

// Upload and import Excel file
router.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'No file provided',
      timestamp: new Date().toISOString(),
    });
  }

  const dryRun = req.query.dryRun === 'true';

  // Parse Excel
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const worksheet = workbook.worksheets[0];
  const filas = worksheet.getRows().map(row => row.values.slice(1)); // Remove the first element (row number)

  if (filas.length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Excel file is empty',
      timestamp: new Date().toISOString(),
    });
  }

  // Import rows
  const results = await importEmployeesFromRows(filas, dryRun);

  res.json(successResponse({
    ...results,
    mode: dryRun ? 'dry-run' : 'production',
  }));
}));

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
  const results = await importEmployeesFromRows(filas, true);

  res.json(successResponse({
    ...results,
    rows_in_file: filas.length,
    first_rows_preview: filas.slice(0, 5),
  }));
}));

export default router;
