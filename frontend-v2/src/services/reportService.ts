import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface GeneratedReportRecord {
  id: string;
  projectId?: string;
  reportType: string;
  title: string;
  format: string;
  fileName: string;
  sizeBytes: number;
  evidenceCount: number;
  createdAt: string;
  version: number;
  lifecycleStatus: string;
  publicAccessEnabled: boolean;
  publicAccessExpiresAt?: string;
  publicViewCount: number;
}

const s = (value: unknown, fallback = '') =>
  value === null || value === undefined ? fallback : String(value);

const n = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function getGeneratedReports(): Promise<GeneratedReportRecord[]> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated) throw new Error('Sesión requerida para consultar reportes.');

  const { data, error } = await supabase
    .from('generated_reports')
    .select('id,project_id,report_type,title,format,file_name,size_bytes,evidence_count,created_at,version,lifecycle_status,public_access_enabled,public_access_expires_at,public_view_count')
    .order('created_at', { ascending: false })
    .limit(250);

  if (error) throw error;

  return (data || []).map((row: Record<string, any>) => ({
    id: s(row.id),
    projectId: s(row.project_id || '') || undefined,
    reportType: s(row.report_type || 'Reporte'),
    title: s(row.title || row.file_name || 'Reporte'),
    format: s(row.format || ''),
    fileName: s(row.file_name || ''),
    sizeBytes: n(row.size_bytes),
    evidenceCount: n(row.evidence_count),
    createdAt: s(row.created_at),
    version: n(row.version, 1),
    lifecycleStatus: s(row.lifecycle_status || 'GENERADO'),
    publicAccessEnabled: Boolean(row.public_access_enabled),
    publicAccessExpiresAt: s(row.public_access_expires_at || '') || undefined,
    publicViewCount: n(row.public_view_count),
  }));
}
