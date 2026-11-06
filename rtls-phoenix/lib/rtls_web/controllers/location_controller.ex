defmodule RtlsWeb.LocationController do
  @moduledoc """
  Controlador HTTP para recibir ubicaciones cuando la app móvil está en segundo plano
  (minimizada) y el sistema operativo suspende el WebSocket.
  """
  use Phoenix.Controller, formats: [:json]

  alias Rtls.{Geofence, LocationBuffer}

  def health(conn, _params) do
    json(conn, %{
      success: true,
      service: "rtls-phoenix",
      status: "healthy",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    })
  end

  def index(conn, _params) do
    json(conn, %{
      success: true,
      data: LocationBuffer.get_all()
    })
  end

  def create(conn, %{"employeeId" => emp_id, "lat" => lat, "lng" => lng} = params)
      when is_number(lat) and is_number(lng) do
    geofence = Geofence.evaluate(lat, lng)
    now_iso = DateTime.utc_now() |> DateTime.to_iso8601()

    event_payload = %{
      employee_id: emp_id,
      name: Map.get(params, "name", "Empleado"),
      role: Map.get(params, "role", "Empleado"),
      lat: lat,
      lng: lng,
      accuracy: Map.get(params, "accuracy"),
      inside_geofence: geofence.inside_geofence,
      distance_meters: geofence.distance_meters,
      online: true,
      updated_at: now_iso
    }

    LocationBuffer.record(event_payload)
    RtlsWeb.Endpoint.broadcast("rtls:locations", "location:update", event_payload)

    json(conn, %{success: true, data: event_payload})
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{success: false, error: "Se requieren employeeId, lat (numérico) y lng (numérico)"})
  end

  def stop(conn, %{"employeeId" => emp_id}) do
    updated = LocationBuffer.mark_offline(emp_id)

    RtlsWeb.Endpoint.broadcast("rtls:locations", "location:offline", %{
      employee_id: emp_id,
      online: false,
      location: updated
    })

    json(conn, %{success: true, data: %{employee_id: emp_id, online: false}})
  end

  def stop(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{success: false, error: "Se requiere employeeId"})
  end
end
