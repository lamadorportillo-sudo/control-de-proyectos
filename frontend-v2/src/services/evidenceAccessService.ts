import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface EvidenceAccess {
  url: string;
  fileName: string;
}

async function resolveEvidenceAccess(evidenceId: string): Promise<EvidenceAccess> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated) throw new Error('Sesión requerida para acceder a la evidencia.');

  const { data, error } = await supabase
    .from('project_evidence')
    .select('storage_path,source_kind,file_name')
    .eq('id', evidenceId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.storage_path) throw new Error('Esta evidencia no tiene archivo almacenado.');

  const path = String(data.storage_path);
  if (path.startsWith('chatgpt-library:')) {
    throw new Error('Este archivo pertenece a una fuente externa y no tiene descarga web directa.');
  }

  const bucket = String(data.source_kind || '').toLowerCase() === 'telegram'
    ? 'telegram-evidence'
    : 'project-files';

  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 300);

  if (signedError) throw signedError;
  if (!signed?.signedUrl) throw new Error('No fue posible generar acceso temporal al archivo.');

  return {
    url: signed.signedUrl,
    fileName: String(data.file_name || path.split('/').pop() || 'evidencia'),
  };
}

export async function getEvidenceAccessUrl(evidenceId: string): Promise<string> {
  const access = await resolveEvidenceAccess(evidenceId);
  return access.url;
}

export async function downloadEvidenceFile(evidenceId: string): Promise<void> {
  const access = await resolveEvidenceAccess(evidenceId);
  const response = await fetch(access.url);
  if (!response.ok) {
    throw new Error(`El servidor no pudo entregar el archivo (HTTP ${response.status}).`);
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error('El archivo recibido está vacío.');

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = access.fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
