FROM elixir:1.18-alpine

# Instalar herramientas de compilación necesarias en Alpine
RUN apk add --no-cache build-base git curl

WORKDIR /app

# Instalar Hex y Rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Copiar definición de dependencias primero para cachear capas
COPY mix.exs ./
RUN mix deps.get && mix deps.compile

# Copiar configuración y código fuente
COPY config ./config
COPY lib ./lib

EXPOSE 4000

CMD ["mix", "phx.server"]
