defmodule Rtls.Application do
  @moduledoc false
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: Rtls.PubSub},
      RtlsWeb.Presence,
      Rtls.LocationBuffer,
      RtlsWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Rtls.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
