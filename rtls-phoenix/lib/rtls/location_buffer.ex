defmodule Rtls.LocationBuffer do
  @moduledoc """
  GenServer que mantiene la última posición de cada empleado en memoria (acceso O(1))
  y sincroniza en lote con Supabase cada 10 segundos para no saturar PostgreSQL.
  """
  use GenServer
  require Logger

  @flush_interval_ms 10_000
  @offline_timeout_ms 15_000

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def record(payload) do
    GenServer.cast(__MODULE__, {:record, payload})
  end

  def mark_offline(emp_id) do
    GenServer.call(__MODULE__, {:mark_offline, emp_id})
  end

  def get_all do
    GenServer.call(__MODULE__, :get_all)
  end

  @impl true
  def init(_opts) do
    schedule_flush()
    {:ok, %{latest: %{}, dirty: MapSet.new()}}
  end

  @impl true
  def handle_cast({:record, %{employee_id: emp_id} = payload}, state) do
    emp_key = to_string(emp_id)
    now_ms = System.system_time(:millisecond)

    enriched =
      payload
      |> Map.put(:online, true)
      |> Map.put(:last_seen_ms, now_ms)

    new_latest = Map.put(state.latest, emp_key, enriched)
    new_dirty = MapSet.put(state.dirty, emp_key)
    {:noreply, %{state | latest: new_latest, dirty: new_dirty}}
  end

  @impl true
  def handle_call({:mark_offline, emp_id}, _from, state) do
    emp_key = to_string(emp_id)

    case Map.get(state.latest, emp_key) do
      nil ->
        {:reply, nil, state}

      existing ->
        updated = Map.put(existing, :online, false)
        new_latest = Map.put(state.latest, emp_key, updated)
        {:reply, updated, %{state | latest: new_latest}}
    end
  end

  @impl true
  def handle_call(:get_all, _from, state) do
    now_ms = System.system_time(:millisecond)

    items =
      state.latest
      |> Map.values()
      |> Enum.map(fn item ->
        last_seen = Map.get(item, :last_seen_ms, 0)
        is_online = Map.get(item, :online, false) and (now_ms - last_seen) <= @offline_timeout_ms
        Map.put(item, :online, is_online)
      end)

    {:reply, items, state}
  end

  @impl true
  def handle_info(:flush, state) do
    if MapSet.size(state.dirty) > 0 do
      rows =
        state.dirty
        |> Enum.map(fn emp_key -> Map.get(state.latest, emp_key) end)
        |> Enum.reject(&is_nil/1)
        |> Enum.map(fn item ->
          %{
            id_externo: to_string(item.employee_id),
            name: Map.get(item, :name, "Empleado"),
            role: Map.get(item, :role, "Empleado"),
            lat: item.lat,
            lng: item.lng,
            inside_geofence: Map.get(item, :inside_geofence, true),
            updated_at: item.updated_at
          }
        end)

      Task.start(fn -> flush_to_supabase(rows) end)
    end

    schedule_flush()
    {:noreply, %{state | dirty: MapSet.new()}}
  end

  defp schedule_flush do
    Process.send_after(self(), :flush, @flush_interval_ms)
  end

  defp flush_to_supabase(rows) do
    supabase_url = Application.get_env(:rtls, :supabase_url)
    supabase_key = Application.get_env(:rtls, :supabase_key)

    if is_binary(supabase_url) and is_binary(supabase_key) do
      url = "#{supabase_url}/rest/v1/locations?on_conflict=id_externo"

      case Req.post(url,
             json: rows,
             headers: [
               {"apikey", supabase_key},
               {"Authorization", "Bearer #{supabase_key}"},
               {"Prefer", "resolution=merge-duplicates"}
             ]
           ) do
        {:ok, %{status: status}} when status in 200..299 ->
          Logger.debug("[RTLS Buffer] #{length(rows)} ubicaciones sincronizadas en Supabase")

        {:ok, resp} ->
          Logger.warning("[RTLS Buffer] Respuesta inesperada de Supabase (#{resp.status}): #{inspect(resp.body)}")

        {:error, reason} ->
          Logger.error("[RTLS Buffer] Error al sincronizar con Supabase: #{inspect(reason)}")
      end
    end
  end
end
