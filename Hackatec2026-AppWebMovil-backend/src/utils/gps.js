const EARTH_RADIUS_M = 6371000; // Earth's radius in meters

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c; // Distance in meters
}

export function isWithinRadius(empLat, empLon, plantLat, plantLon, radiusMeters) {
  const distance = calculateDistance(empLat, empLon, plantLat, plantLon);
  return distance <= radiusMeters;
}
