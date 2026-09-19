create table if not exists public.deficiencies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  source_visit_id uuid null references public.visits(id) on delete set null,
  title text not null,
  specific_location text not null default '',
  description text not null default '',
  severity text not null default 'MODERADA'
    check (severity in ('LEVE','MODERADA','GRAVE','BLOQUEANTE')),
  supervisor_instruction text not null default '',
  responsible text not null default '',
  reported_by uuid null default auth.uid(),
  reported_at timestamptz not null default now(),
  due_date date null,
  status text not null default 'ABIERTA'
    check (status in ('ABIERTA','EN_CORRECCION','VERIFICADA','CERRADA')),
  verified_at timestamptz null,
  verified_by uuid null,
  verification_observation text null,
  closed_at timestamptz null,
  closed_by uuid null,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'CERRADA' or verified_at is not null)
);

create table if not exists public.deficiency_followups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  deficiency_id uuid not null references public.deficiencies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  action text not null,
  comment text not null default '',
  instruction text not null default '',
  responsible text not null default '',
  due_date date null,
  created_by uuid null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.project_evidence
  add column if not exists deficiency_id uuid null references public.deficiencies(id) on delete set null;

create index if not exists deficiencies_workspace_idx on public.deficiencies(workspace_id);
create index if not exists deficiencies_project_idx on public.deficiencies(project_id);
create index if not exists deficiencies_status_idx on public.deficiencies(workspace_id,status);
create index if not exists deficiencies_due_idx on public.deficiencies(workspace_id,due_date) where status <> 'CERRADA';
create index if not exists deficiency_followups_deficiency_idx on public.deficiency_followups(deficiency_id,created_at);
create index if not exists deficiency_followups_workspace_idx on public.deficiency_followups(workspace_id);
create index if not exists project_evidence_deficiency_idx on public.project_evidence(deficiency_id) where deficiency_id is not null;

alter table public.deficiencies enable row level security;
alter table public.deficiency_followups enable row level security;

drop policy if exists deficiencies_select_member on public.deficiencies;
create policy deficiencies_select_member
on public.deficiencies for select
to authenticated
using (private.is_workspace_member(workspace_id));

drop policy if exists deficiencies_insert_editor on public.deficiencies;
create policy deficiencies_insert_editor
on public.deficiencies for insert
to authenticated
with check (private.can_edit_workspace(workspace_id));

drop policy if exists deficiencies_update_editor on public.deficiencies;
create policy deficiencies_update_editor
on public.deficiencies for update
to authenticated
using (private.can_edit_workspace(workspace_id))
with check (private.can_edit_workspace(workspace_id));

drop policy if exists deficiency_followups_select_member on public.deficiency_followups;
create policy deficiency_followups_select_member
on public.deficiency_followups for select
to authenticated
using (private.is_workspace_member(workspace_id));

drop policy if exists deficiency_followups_insert_editor on public.deficiency_followups;
create policy deficiency_followups_insert_editor
on public.deficiency_followups for insert
to authenticated
with check (private.can_edit_workspace(workspace_id));

grant select, insert, update on public.deficiencies to authenticated;
grant select, insert on public.deficiency_followups to authenticated;

drop trigger if exists trg_deficiencies_updated_at on public.deficiencies;
create trigger trg_deficiencies_updated_at
before update on public.deficiencies
for each row execute function private.touch_updated_at();

drop trigger if exists audit_deficiencies on public.deficiencies;
create trigger audit_deficiencies
after insert or update or delete on public.deficiencies
for each row execute function private.audit_row_change();

drop trigger if exists audit_deficiency_followups on public.deficiency_followups;
create trigger audit_deficiency_followups
after insert or update or delete on public.deficiency_followups
for each row execute function private.audit_row_change();
