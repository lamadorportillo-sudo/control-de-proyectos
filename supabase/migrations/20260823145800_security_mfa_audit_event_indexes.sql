create index if not exists security_events_user_type_created_idx
  on public.security_events(user_id, event_type, created_at desc)
  where user_id is not null;
