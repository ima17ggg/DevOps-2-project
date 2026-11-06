defmodule RtlsWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :rtls

  socket "/socket", RtlsWeb.UserSocket,
    websocket: [check_origin: false],
    longpoll: false

  plug CORSPlug, origin: ["*"]

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug RtlsWeb.Router
end
