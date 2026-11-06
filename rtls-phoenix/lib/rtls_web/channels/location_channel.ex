defmodule RtlsWeb.LocationChannel do
  use Phoenix.Channel

  alias Rtls.{Geofence, LocationBuffer}
  alias RtlsWeb.Presence

  @impl true
  def join("rtls:locations", payload, socket) do
    emp_id = Map.get(payload, "employeeId")
    socket = if emp_id, do: assign(socket, :employee_id, emp_id), else: socket
    send(self(), {:after_join, payload})
    {:ok, %{locations: LocationBuffer.get_all()}, socket}
  end

  @impl true
  def handle_info({:after_join, payload}, socket) do
    if emp_id = Map.get(payload, "employeeId") do
      {:ok, _} =
        Presence.track(socket, to_string(emp_id), %{
          name: Map.get(payload, "name", "Empleado"),
          role: Map.get(payload, "role", "Empleado"),
          online_at: System.system_time(:millisecond)
        })
    end

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_in("location:push", %{"employeeId" => emp_id, "lat" => lat, "lng" => lng} = params, socket)
      when is_number(lat) and is_number(lng) do
    socket = assign(socket, :employee_id, emp_id)
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
    broadcast!(socket, "location:update", event_payload)

    {:reply, {:ok, event_payload}, socket}
  end

  @impl true
  def handle_in("location:stop", params, socket) do
    emp_id = Map.get(params, "employeeId") || socket.assigns[:employee_id]

    if emp_id do
      updated = LocationBuffer.mark_offline(emp_id)
      broadcast!(socket, "location:offline", %{
        employee_id: emp_id,
        online: false,
        location: updated
      })
    end

    {:reply, {:ok, %{stopped: true}}, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    if emp_id = socket.assigns[:employee_id] do
      updated = LocationBuffer.mark_offline(emp_id)
      RtlsWeb.Endpoint.broadcast("rtls:locations", "location:offline", %{
        employee_id: emp_id,
        online: false,
        location: updated
      })
    end

    :ok
  end
end
