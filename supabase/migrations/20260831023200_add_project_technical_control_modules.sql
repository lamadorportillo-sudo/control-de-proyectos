create table if not exists public.quality_tests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  visit_id uuid references public.visits(id) on delete set null,
  test_code text not null,
  material_type text not null check (material_type in ('CONCRETO','SUELOS','ACERO','ASFALTO','AGREGADOS','OTROS')),
  structural_element text not null,
  location_text text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  sampling_date date not null,
  planned_testing_date date,
  actual_testing_date date,
  laboratory_name text,
  required_value numeric(14,4),
  obtained_value numeric(14,4),
  unit_measure text,
  is_compliant boolean generated always as (
    case when obtained_value is null or required_value is null then null else obtained_value >= required_value end
  ) stored,
  status text not null default 'PENDIENTE' check (status in ('PENDIENTE','EN_PROCESO','CONFORME','NO_CONFORME','SUBSANADO','ANULADO')),
  certificate_path text,
  nonconformity_action text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, test_code)
);

create table if not exists public.project_admin_acts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  act_number text not null,
  act_type text not null check (act_type in ('INICIO','SUSPENSION','REINICIO','PRORROGA','ORDEN_SERVICIO','ENTREGA_SITIO','OTRA')),
  act_date date not null,
  effective_date date,
  reason text,
  days_effect integer not null default 0,
  status text not null default 'VIGENTE' check (status in ('BORRADOR','VIGENTE','SUPERADA','ANULADA')),
  document_path text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, project_id, act_number)
);

create table if not exists public.site_daily_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  log_date date not null,
  shift text,
  weather text,
  work_summary text not null,
  physical_progress numeric(6,2) check (physical_progress is null or (physical_progress >= 0 and physical_progress <= 100)),
  equipment jsonb not null default '[]'::jsonb,
  personnel jsonb not null default '[]'::jsonb,
  quantities jsonb not null default '[]'::jsonb,
  downtime_hours numeric(8,2) not null default 0 check (downtime_hours >= 0),
  downtime_reason text,
  observations text,
  evidence_refs jsonb not null default '[]'::jsonb,
  status text not null default 'ABIERTO' check (status in ('ABIERTO','REVISADO','CERRADO','ANULADO')),
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safety_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  record_date date not null,
  record_type text not null check (record_type in ('INSPECCION','INCIDENTE','ACCIDENTE','CAPACITACION','EPP','PERMISO_TRABAJO','CONDICION_INSEGURA')),
  severity text not null default 'BAJA' check (severity in ('BAJA','MEDIA','ALTA','CRITICA')),
  description text not null,
  corrective_action text,
  responsible text,
  due_date date,
  status text not null default 'ABIERTO' check (status in ('ABIERTO','EN_SEGUIMIENTO','CERRADO','ANULADO')),
  evidence_refs jsonb not null default '[]'::jsonb,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.environmental_social_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  record_date date not null,
  category text not null check (category in ('AMBIENTAL','SOCIAL','QUEJA','COMPENSACION','PERMISO','MONITOREO','COMUNIDAD')),
  requirement text,
  finding text not null,
  impact_level text not null default 'BAJO' check (impact_level in ('BAJO','MEDIO','ALTO','CRITICO')),
  action_required text,
  responsible text,
  due_date date,
  beneficiary_or_affected text,
  status text not null default 'ABIERTO' check (status in ('ABIERTO','EN_SEGUIMIENTO','CERRADO','ANULADO')),
  evidence_refs jsonb not null default '[]'::jsonb,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technical_queries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  code text not null,
  query_type text not null check (query_type in ('RFI','SUBMITTAL','MATERIAL','PLANO','ACLARACION','CAMBIO_PROPUESTO')),
  subject text not null,
  question text not null,
  raised_by text,
  raised_at date not null default current_date,
  due_date date,
  answer text,
  answered_by text,
  answered_at date,
  status text not null default 'ABIERTA' check (status in ('ABIERTA','EN_REVISION','RESPONDIDA','CERRADA','ANULADA')),
  impact_cost numeric(14,2) not null default 0,
  impact_days integer not null default 0,
  document_path text,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, project_id, code)
);

create table if not exists public.risk_claims (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  code text not null,
  record_type text not null check (record_type in ('RIESGO','RECLAMO','CONTROVERSIA','FUERZA_MAYOR')),
  title text not null,
  description text not null,
  probability text check (probability is null or probability in ('BAJA','MEDIA','ALTA')),
  impact text check (impact is null or impact in ('BAJO','MEDIO','ALTO','CRITICO')),
  amount_exposure numeric(14,2) not null default 0,
  days_exposure integer not null default 0,
  mitigation text,
  owner_name text,
  status text not null default 'ABIERTO' check (status in ('ABIERTO','EN_ANALISIS','MITIGADO','RESUELTO','CERRADO','ANULADO')),
  opened_at date not null default current_date,
  closed_at date,
  resolution text,
  document_path text,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, project_id, code)
);

create table if not exists public.project_receptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  act_number text not null,
  reception_type text not null check (reception_type in ('PROVISIONAL','FINAL','LIQUIDACION')),
  reception_date date not null,
  physical_completion_pct numeric(6,2) not null default 0 check (physical_completion_pct >= 0 and physical_completion_pct <= 100),
  contract_amount numeric(14,2) not null default 0,
  estimated_total numeric(14,2) not null default 0,
  paid_total numeric(14,2) not null default 0,
  advance_pending numeric(14,2) not null default 0,
  retention_pending numeric(14,2) not null default 0,
  final_balance numeric(14,2) not null default 0,
  punch_list jsonb not null default '[]'::jsonb,
  claims_pending text,
  signed_by jsonb not null default '[]'::jsonb,
  status text not null default 'BORRADOR' check (status in ('BORRADOR','EN_REVISION','APROBADA','CERRADA','ANULADA')),
  document_path text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, project_id, act_number)
);

create index if not exists idx_quality_tests_project on public.quality_tests(workspace_id, project_id);
create index if not exists idx_quality_tests_status on public.quality_tests(workspace_id, status);
create index if not exists idx_admin_acts_project on public.project_admin_acts(workspace_id, project_id, act_date desc);
create index if not exists idx_daily_logs_project on public.site_daily_logs(workspace_id, project_id, log_date desc);
create index if not exists idx_safety_project on public.safety_records(workspace_id, project_id, record_date desc);
create index if not exists idx_env_social_project on public.environmental_social_records(workspace_id, project_id, record_date desc);
create index if not exists idx_technical_queries_project on public.technical_queries(workspace_id, project_id, status);
create index if not exists idx_risk_claims_project on public.risk_claims(workspace_id, project_id, status);
create index if not exists idx_receptions_project on public.project_receptions(workspace_id, project_id, reception_date desc);

alter table public.quality_tests enable row level security;
alter table public.project_admin_acts enable row level security;
alter table public.site_daily_logs enable row level security;
alter table public.safety_records enable row level security;
alter table public.environmental_social_records enable row level security;
alter table public.technical_queries enable row level security;
alter table public.risk_claims enable row level security;
alter table public.project_receptions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['quality_tests','project_admin_acts','site_daily_logs','safety_records','environmental_social_records','technical_queries','risk_claims','project_receptions'] loop
    execute format('create policy %I on public.%I for select using (private.is_workspace_member(workspace_id))', t||'_select_member', t);
    execute format('create policy %I on public.%I for insert with check (private.can_edit_workspace(workspace_id))', t||'_insert_editor', t);
    execute format('create policy %I on public.%I for update using (private.can_edit_workspace(workspace_id)) with check (private.can_edit_workspace(workspace_id))', t||'_update_editor', t);
    execute format('create trigger %I before update on public.%I for each row execute function private.touch_updated_at()', 'trg_'||t||'_updated_at', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.audit_row_change()', 'audit_'||t, t);
  end loop;
end $$;
