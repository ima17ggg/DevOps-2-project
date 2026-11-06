import Config

config :rtls, RtlsWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: RtlsWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Rtls.PubSub,
  live_view: [signing_salt: "rtls_live_salt"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason
