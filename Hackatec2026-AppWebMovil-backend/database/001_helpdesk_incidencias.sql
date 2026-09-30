-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- Amplía la tabla existente de incidencias y crea su historial de seguimiento.

create extension if not exists pgcrypto;

alter table public.incidencias
  add column if not exists id_usuario uuid,
  add column if not exists folio text,
  add column if not exists asunto text,
  add column if not exists descripcion text,
  add column if not exists prioridad text default 'Normal',
  add column if not exists ubicacion text,
  add column if not exists evidencia_url text,
  add column if not exists estatus text default 'Abierta',
  add column if not exists fecha_reporte timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists incidencias_folio_unique
  on public.incidencias (folio)
  where folio is not null;

create index if not exists incidencias_id_usuario_idx
  on public.incidencias (id_usuario);

create table if not exists public.incidencia_seguimientos (
  id_seguimiento uuid primary key default gen_random_uuid(),
  -- Texto permite convivir con IDs numéricos o UUID de versiones previas.
  id_incidencia text not null,
  id_usuario uuid not null,
  autor_email text not null,
  comentario text not null check (char_length(trim(comentario)) > 0),
  estado text not null default 'Abierta',
  created_at timestamptz not null default now()
);

create index if not exists incidencia_seguimientos_incidencia_idx
  on public.incidencia_seguimientos (id_incidencia, created_at);

comment on table public.incidencia_seguimientos is
  'Historial cronológico de comentarios y cambios de una incidencia HelpDesk.';
