defmodule RtlsWeb.UserSocket do
  use Phoenix.Socket

  channel "rtls:*", RtlsWeb.LocationChannel

  @impl true
  def connect(params, socket, _connect_info) do
    token = Map.get(params, "token")
    secret = Application.get_env(:rtls, :jwt_secret) || "produccion"

    case verify_jwt(token, secret) do
      {:ok, claims} ->
        {:ok, assign(socket, :current_user, claims)}

      :allow_guest ->
        {:ok, assign(socket, :current_user, %{"role" => "guest"})}
    end
  end

  @impl true
  def id(_socket), do: nil

  defp verify_jwt(nil, _secret), do: :allow_guest
  defp verify_jwt("", _secret), do: :allow_guest

  defp verify_jwt(token, secret) do
    signer = Joken.Signer.create("HS256", secret)

    case Joken.verify(token, signer) do
      {:ok, claims} -> {:ok, claims}
      {:error, _reason} -> :allow_guest
    end
  end
end
