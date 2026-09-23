-- Vista liviana para listados de visitas.
-- Evita transferir fotografías/base64 incrustadas en visits.raw_data al frontend.

create or replace view public.visit_list_v1
with (security_invoker = true)
as
select
  v.id,
  v.workspace_id,
  v.project_id,
  v.visit_number,
  v.visit_date,
  v.inspector,
  v.summary,
  v.raw_data ->> 'progressReported' as raw_progress_reported,
  v.raw_data ->> 'physicalProgress' as raw_physical_progress,
  coalesce(v.raw_data ->> 'weatherCondition', v.raw_data ->> 'weather', '') as raw_weather_condition,
  coalesce(v.raw_data ->> 'staffCount', v.raw_data ->> 'personnel', '0') as raw_staff_count,
  coalesce(v.raw_data ->> 'equipmentOnSite', '') as raw_equipment_on_site,
  v.raw_data -> 'gpsCoords' as raw_gps_coords,
  nullif(v.raw_data ->> 'audioNotes', '') as raw_audio_notes,
  case
    when jsonb_typeof(v.raw_data -> 'deficienciesCreated') = 'array'
      then v.raw_data -> 'deficienciesCreated'
    else '[]'::jsonb
  end as raw_deficiencies_created,
  coalesce(
    nullif(v.raw_data ->> 'photoCount', ''),
    nullif(v.raw_data ->> 'reportPhotoCount', ''),
    '0'
  ) as raw_photo_count,
  v.created_at,
  v.updated_at,
  v.voided_at
from public.visits v;

grant select on public.visit_list_v1 to authenticated;

comment on view public.visit_list_v1 is
'Vista liviana para listados de visitas. Excluye fotografías/base64 incrustadas en raw_data para evitar cargas excesivas en frontend.';
