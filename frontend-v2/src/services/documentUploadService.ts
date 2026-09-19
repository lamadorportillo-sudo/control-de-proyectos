import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface UploadProjectDocumentInput {
  projectId: string;
  type: string;
  title: string;
  file: File;
  deficiencyId?: string;
  visitId?: string;
}

const safeFileName = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 140) || 'documento';

function evidenceType(type: string, mime: string): string {
  const t = type.toLowerCase();
  if (/foto|fotograf|image/.test(t) || mime.startsWith('image/')) return 'photo';
  if (/audio|voz/.test(t) || mime.startsWith('audio/')) return 'voice';
  if (/plano/.test(t)) return 'plan';
  if (/contrato/.test(t)) return 'contract';
  if (/estimaci/.test(t)) return 'estimate';
  if (/garant|p[oó]liza|fianza/.test(t)) return 'guarantee';
  if (/acta/.test(t)) return 'act';
  if (/informe|reporte/.test(t)) return 'report';
  if (/convenio/.test(t)) return 'agreement';
  if (/adenda|addendum|modificatorio/.test(t)) return 'contract_amendment';
  if (/orden.*pago/.test(t)) return 'payment_order';
  return 'document';
}

export async function uploadProjectDocument(input: UploadProjectDocumentInput): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated || !auth.user) throw new Error('Sesión requerida para subir documentos.');

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('workspace_id,code')
    .eq('id', input.projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

  const workspaceId = String(project.workspace_id);
  const evidenceId = crypto.randomUUID();
  const fileName = safeFileName(input.file.name);
  const path = `${workspaceId}/${input.projectId}/documents/${evidenceId}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(path, input.file, {
      upsert: false,
      contentType: input.file.type || undefined,
    });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase
    .from('project_evidence')
    .insert({
      id: evidenceId,
      workspace_id: workspaceId,
      project_id: input.projectId,
      evidence_type: evidenceType(input.type, input.file.type || ''),
      storage_path: path,
      mime_type: input.file.type || null,
      file_name: input.file.name,
      size_bytes: input.file.size,
      analysis: {
        source: 'frontend-v2',
        title: input.title.trim() || input.file.name,
        documentType: input.type,
        projectCode: project.code || null,
      },
      created_by: auth.user.id,
      verification_status: 'unreviewed',
      source_kind: 'web',
      deficiency_id: input.deficiencyId || null,
      visit_id: input.visitId || null,
    });

  if (insertError) {
    await supabase.storage.from('project-files').remove([path]).catch(() => undefined);
    throw insertError;
  }

  return evidenceId;
}
