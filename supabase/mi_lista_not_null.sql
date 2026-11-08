-- Pedido del profe tras P3: user_id y estado NOT NULL.
-- Ejecutar una vez en el SQL Editor del proyecto de esta cartelera.

alter table public.mi_lista
  alter column user_id set not null;

alter table public.mi_lista
  alter column estado set default 'por_ver';

alter table public.mi_lista
  alter column estado set not null;
