defmodule RtlsWeb.Router do
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api/rtls", RtlsWeb do
    pipe_through :api

    get "/health", LocationController, :health
    get "/locations", LocationController, :index
    post "/locations", LocationController, :create
    post "/locations/stop", LocationController, :stop
  end
end
