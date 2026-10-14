-- Ejecutar en Supabase > SQL Editor
create table cards (
  code text primary key,          -- '001', '002'... (el número impreso en la calcomanía)
  url text,                       -- link de reseñas de Google del negocio (null = sin activar)
  business text,                  -- nombre del negocio
  scans int not null default 0,
  last_scan timestamptz,
  created_at timestamptz default now()
);

-- Sin políticas: nadie con la anon key puede leer/escribir. Solo la service key (servidor).
-- EXCEPTO el panel /admin, que usa la anon key + Supabase Auth (rol authenticated):
alter table cards enable row level security;

create policy "Panel puede leer tarjetas" on cards
  for select to authenticated using (true);

create policy "Panel puede actualizar tarjetas" on cards
  for update to authenticated using (true) with check (true);

-- Las 24 calcomanías
insert into cards (code)
select lpad(n::text, 3, '0') from generate_series(1, 24) n;

-- Al vender la tarjeta 007 (o edítalo en Table Editor):
-- update cards set url = 'https://g.page/r/XXXX/review', business = 'Café Ejemplo' where code = '007';
