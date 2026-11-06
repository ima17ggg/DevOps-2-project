defmodule Rtls.Geofence do
  @moduledoc """
  Cálculo de distancia Haversine y verificación de geocercas en memoria para el RTLS.
  """

  @earth_radius_m 6_371_000.0
  @default_plant_lat 25.442251
  @default_plant_lng -100.993114
  @default_radius_m 150.0

  def distance_meters(lat1, lon1, lat2, lon2) do
    d_lat = deg_to_rad(lat2 - lat1)
    d_lon = deg_to_rad(lon2 - lon1)

    a =
      :math.sin(d_lat / 2) * :math.sin(d_lat / 2) +
        :math.cos(deg_to_rad(lat1)) * :math.cos(deg_to_rad(lat2)) *
          :math.sin(d_lon / 2) * :math.sin(d_lon / 2)

    c = 2 * :math.atan2(:math.sqrt(a), :math.sqrt(1 - a))
    Float.round(@earth_radius_m * c, 2)
  end

  def evaluate(lat, lng, plant_lat \\ @default_plant_lat, plant_lng \\ @default_plant_lng, radius_m \\ @default_radius_m) do
    dist = distance_meters(lat, lng, plant_lat, plant_lng)

    %{
      inside_geofence: dist <= radius_m,
      distance_meters: dist,
      allowed_radius_meters: radius_m
    }
  end

  defp deg_to_rad(deg), do: deg * :math.pi() / 180.0
end
