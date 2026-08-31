alter table public.quality_tests
  add column if not exists estimate_id uuid references public.estimates(id) on delete set null,
  add column if not exists financial_hold boolean not null default false;

create index if not exists idx_quality_tests_estimate on public.quality_tests(estimate_id) where estimate_id is not null;
