import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export async function getEvidenceAccessUrl(evidenceId: string): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated) throw new Error('Sesión requerida para abrir evidencia.');

  const { data, error } = await supabase
    .from('project_evidence')
    .select('storage_path,source_kind,file_name')
    .eq('id', evidenceId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.storage_path) throw new Error('Esta evidencia no tiene archivo almacenado.');

  const path = String(data.storage_path);
  if (path.startsWith('chatgpt-library:')) {
    throw new Error('Este archivo pertenece a una fuente externa y no tiene enlace web directo en Supabase.');
  }

  const bucket = String(data.source_kind || '').toLowerCase() === 'telegram'
    ? 'telegram-evidence'
    : 'project-files';

  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 120);

  if (signedError) throw signedError;
  if (!signed?.signedUrl) throw new Error('No fue posible generar acceso temporal al archivo.');
  return signed.signedUrl;
}
