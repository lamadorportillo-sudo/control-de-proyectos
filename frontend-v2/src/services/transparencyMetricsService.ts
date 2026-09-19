import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';
import { classifyDocumentType } from './documentClassification.ts';

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
      .select('id,file_name,mime_type,evidence_type,extracted_text,analysis')
      .limit(500),
  ]);

  if (procurement.error) throw procurement.error;

  let agreements = 0;
  if (!convenioEvidence.error) {
    agreements = (convenioEvidence.data || []).filter((row: any) => {
      const analysis = row.analysis || {};
      return classifyDocumentType({
        evidenceType: row.evidence_type,
        fileName: row.file_name,
        mimeType: row.mime_type,
        title: analysis.title || row.file_name,
        documentType: analysis.documentType,
        document_type: analysis.document_type,
        type: analysis.type,
        category: analysis.category,
        extractedText: row.extracted_text,
      }).type === 'CONVENIO';
    }).length;
  }

  return {
    agreements,
    procurement: procurement.count || 0,
  };
}
