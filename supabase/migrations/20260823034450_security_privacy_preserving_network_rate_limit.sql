alter table public.security_events
  add column if not exists network_fingerprint text;

create index if not exists security_events_network_created_idx
  on public.security_events(network_fingerprint, created_at desc)
  where network_fingerprint is not null;

comment on column public.security_events.network_fingerprint is
  'Hash irreversible y truncado de la red de origen, usado solo para limitar intentos. No almacena la IP sin procesar.';
