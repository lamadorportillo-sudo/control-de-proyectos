import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface TransparencySourceCounts {
  agreements: number;
  procurement: number;
}

export async function getTransparencySourceCounts(): Promise<TransparencySourceCounts> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated) throw new Error('Sesión requerida para consultar fuentes de transparencia.');

  const [procurement, convenioEvidence] = await Promise.all([
    supabase.from('project_procurement_audit').select('*', { count: 'exact', head: true }),
    supabase
      .from('project_evidence')
      .select('id,file_name,analysis')
      .limit(500),
  ]);

  if (procurement.error) throw procurement.error;

  let agreements = 0;
  if (!convenioEvidence.error) {
    agreements = (convenioEvidence.data || []).filter((row: any) =>
      `${row.file_name || ''} ${JSON.stringify(row.analysis || {})}`.toLowerCase().includes('convenio')
    ).length;
  }

  return {
    agreements,
    procurement: procurement.count || 0,
  };
}
