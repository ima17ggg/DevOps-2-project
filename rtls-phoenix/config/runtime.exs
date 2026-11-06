import Config

port = String.to_integer(System.get_env("PORT") || "4000")

secret_key_base =
  System.get_env("SECRET_KEY_BASE") ||
    "rtls_phoenix_super_secret_key_base_for_signing_tokens_at_least_64_bytes_long_2026"

config :rtls, RtlsWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: port],
  secret_key_base: secret_key_base,
  check_origin: false,
  server: true

config :rtls,
  jwt_secret: System.get_env("JWT_SECRET") || "produccion",
  supabase_url: System.get_env("SUPABASE_URL"),
  supabase_key: System.get_env("SUPABASE_KEY")
