export function validateRequired(data, fields) {
  const missing = fields.filter(f => !data[f] && data[f] !== 0 && data[f] !== false);
  if (missing.length > 0) {
    throw {
      statusCode: 400,
      message: `Missing required fields: ${missing.join(', ')}`,
    };
  }
}

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw {
      statusCode: 400,
      message: 'Invalid email format',
    };
  }
}

export function validateDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw {
      statusCode: 400,
      message: 'Invalid date format',
    };
  }
  return date;
}

export function validateCoordinates(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw {
      statusCode: 400,
      message: 'Latitude and longitude must be numbers',
    };
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw {
      statusCode: 400,
      message: 'Invalid coordinates range',
    };
  }
}

export function successResponse(data = null, message = null) {
  return {
    success: true,
    data,
    error: message || null,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(message, code = 500) {
  return {
    success: false,
    data: null,
    error: message,
    timestamp: new Date().toISOString(),
  };
}
