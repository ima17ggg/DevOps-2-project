export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const timestamp = new Date().toISOString();
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Supabase-specific errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      data: null,
      error: 'Duplicate entry - this record already exists',
      timestamp,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Invalid reference - related record not found',
      timestamp,
    });
  }

  return res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
    timestamp,
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
