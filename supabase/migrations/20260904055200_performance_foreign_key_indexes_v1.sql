-- Índices de cobertura para llaves foráneas reportadas por el asesor de rendimiento.
-- Se usan nombres deterministas y IF NOT EXISTS para que la migración sea idempotente.

create index if not exists environmental_social_records_created_by_idx on public.environmental_social_records(created_by);
create index if not exists environmental_social_records_project_id_idx on public.environmental_social_records(project_id);
create index if not exists environmental_social_records_updated_by_idx on public.environmental_social_records(updated_by);
create index if not exists environmental_social_records_visit_id_idx on public.environmental_social_records(visit_id);

create index if not exists project_admin_acts_contract_id_idx on public.project_admin_acts(contract_id);
create index if not exists project_admin_acts_created_by_idx on public.project_admin_acts(created_by);
create index if not exists project_admin_acts_project_id_idx on public.project_admin_acts(project_id);
create index if not exists project_admin_acts_updated_by_idx on public.project_admin_acts(updated_by);

create index if not exists project_receptions_contract_id_idx on public.project_receptions(contract_id);
create index if not exists project_receptions_created_by_idx on public.project_receptions(created_by);
create index if not exists project_receptions_project_id_idx on public.project_receptions(project_id);
create index if not exists project_receptions_updated_by_idx on public.project_receptions(updated_by);

create index if not exists quality_tests_contract_id_idx on public.quality_tests(contract_id);
create index if not exists quality_tests_created_by_idx on public.quality_tests(created_by);
create index if not exists quality_tests_project_id_idx on public.quality_tests(project_id);
create index if not exists quality_tests_updated_by_idx on public.quality_tests(updated_by);
create index if not exists quality_tests_visit_id_idx on public.quality_tests(visit_id);

create index if not exists risk_claims_contract_id_idx on public.risk_claims(contract_id);
create index if not exists risk_claims_created_by_idx on public.risk_claims(created_by);
create index if not exists risk_claims_project_id_idx on public.risk_claims(project_id);
create index if not exists risk_claims_updated_by_idx on public.risk_claims(updated_by);

create index if not exists safety_records_created_by_idx on public.safety_records(created_by);
create index if not exists safety_records_project_id_idx on public.safety_records(project_id);
create index if not exists safety_records_updated_by_idx on public.safety_records(updated_by);
create index if not exists safety_records_visit_id_idx on public.safety_records(visit_id);

create index if not exists site_daily_logs_created_by_idx on public.site_daily_logs(created_by);
create index if not exists site_daily_logs_project_id_idx on public.site_daily_logs(project_id);
create index if not exists site_daily_logs_updated_by_idx on public.site_daily_logs(updated_by);
create index if not exists site_daily_logs_visit_id_idx on public.site_daily_logs(visit_id);

create index if not exists technical_queries_contract_id_idx on public.technical_queries(contract_id);
create index if not exists technical_queries_created_by_idx on public.technical_queries(created_by);
create index if not exists technical_queries_project_id_idx on public.technical_queries(project_id);
create index if not exists technical_queries_updated_by_idx on public.technical_queries(updated_by);

create index if not exists telegram_visit_photo_reload_items_evidence_id_idx on public.telegram_visit_photo_reload_items(evidence_id);
create index if not exists telegram_visit_photo_reloads_project_id_idx on public.telegram_visit_photo_reloads(project_id);
