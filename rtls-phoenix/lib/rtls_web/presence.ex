defmodule RtlsWeb.Presence do
  use Phoenix.Presence,
    otp_app: :rtls,
    pubsub_server: Rtls.PubSub
end
