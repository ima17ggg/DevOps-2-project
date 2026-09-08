export async function saveLocation(employeeId, lat, lng) {
    if (!employeeId || typeof lat !== 'number' || typeof lng !== 'number') return

    try {
  const location = await locationService.saveLocation(
      employeeId,
      lat,
      lng
    )

    res.json({
      success: true,
      data: location
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}