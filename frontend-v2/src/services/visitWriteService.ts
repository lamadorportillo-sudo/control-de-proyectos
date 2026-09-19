import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface VisitWriteInput {
  id: string;
  projectId: string;
  date: string;
  time: string;
  location: string;
  observedProgress: number;
  previousProgress: number;
  workObserved: string;
  activities: string[];
  hasIncident: boolean;
  incidentDescription?: string;
  instruction?: string;
  responsible?: string;
  deadline?: string;
}

export interface VisitWriteResult {
  visitId: string;
  evidenceCount: number;
  deficiencyId?: string;
  warning?: string;
}

export const visitWritesEnabled =
  String(import.meta.env.VITE_ENABLE_VISIT_WRITES || '').toLowerCase() === 'true';

const safeFileName = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120) || 'archivo';

async function deterministicUuid(seed: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  const bytes = new Uint8Array(digest).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20,32)].join('-');
}

export async function saveVisitWithEvidence(
  input: VisitWriteInput,
  photoFiles: File[],
  audioFile: File | null,
): Promise<VisitWriteResult> {
  if (!visitWritesEnabled) throw new Error('La escritura productiva de visitas está desactivada en esta compilación.');
  if (!supabase) throw new Error('Supabase no está configurado.');

  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated || !auth.user) throw new Error('Sesión requerida para guardar la visita.');

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', input.projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

  const workspaceId = String(project.workspace_id);
  const inspector = String(
    auth.user.user_metadata?.full_name ||
    auth.user.user_metadata?.name ||
    auth.user.email ||
    'Usuario'
  );

  const rawData = {
    source: 'frontend-v2',
    visitTime: input.time,
    location: input.location,
    progressReported: input.observedProgress,
    previousProgress: input.previousProgress,
    variation: input.observedProgress - input.previousProgress,
    activities: input.activities,
    incident: input.hasIncident ? {
      state: 'Pendiente',
      description: input.incidentDescription || '',
      instruction: input.instruction || '',
      responsible: input.responsible || '',
      deadline: input.deadline || null,
      note: 'La incidencia queda vinculada a la visita; su alta estructurada en Deficiencias se realizará mediante el flujo backend autorizado.'
    } : null,
    syncStatus: 'SINCRONIZADO',
  };

  const uploads: Array<{ id: string; path: string; file: File; type: 'photo' | 'voice' }> = [];
  for (let i = 0; i < photoFiles.length; i++) {
    const file = photoFiles[i];
    const id = await deterministicUuid(input.id + ':photo:' + i);
    uploads.push({
      id,
      path: workspaceId + '/' + input.projectId + '/visits/' + input.id + '/photo-' + String(i + 1).padStart(2, '0') + '-' + safeFileName(file.name),
      file,
      type: 'photo',
    });
  }
  if (audioFile) {
    uploads.push({
      id: await deterministicUuid(input.id + ':voice:0'),
      path: workspaceId + '/' + input.projectId + '/visits/' + input.id + '/voice-' + safeFileName(audioFile.name),
      file: audioFile,
      type: 'voice',
    });
  }

  const uploadedPaths: string[] = [];
  let deficiencyId: string | undefined;
  try {
    for (const item of uploads) {
      const { error } = await supabase.storage.from('project-files').upload(item.path, item.file, {
        upsert: true,
        contentType: item.file.type || undefined,
      });
      if (error) throw error;
      uploadedPaths.push(item.path);
    }

    const { error: visitError } = await supabase.from('visits').upsert({
      id: input.id,
      workspace_id: workspaceId,
      project_id: input.projectId,
      visit_date: input.date,
      inspector,
      summary: input.workObserved,
      raw_data: rawData,
    }, { onConflict: 'id' });

    if (visitError) throw visitError;

    if (input.hasIncident) {
      deficiencyId = await deterministicUuid(input.id + ':deficiency:0');
      const description = (input.incidentDescription || '').trim();
      const title = description
        ? description.split(/\r?\n/)[0].slice(0, 140)
        : 'Deficiencia observada en visita';

      const { error: deficiencyError } = await supabase.from('deficiencies').upsert({
        id: deficiencyId,
        workspace_id: workspaceId,
        project_id: input.projectId,
        source_visit_id: input.id,
        title,
        specific_location: input.location || '',
        description: description || 'Deficiencia observada durante visita de obra.',
        severity: 'MODERADA',
        supervisor_instruction: input.instruction || '',
        responsible: input.responsible || '',
        due_date: input.deadline || null,
        status: 'ABIERTA',
        reported_by: auth.user.id,
        raw_data: {
          source: 'frontend-v2',
          visit_id: input.id,
        },
      }, { onConflict: 'id' });

      if (deficiencyError) throw deficiencyError;
    }

    if (uploads.length) {
      const rows = uploads.map((item) => ({
        id: item.id,
        workspace_id: workspaceId,
        project_id: input.projectId,
        evidence_type: item.type,
        storage_path: item.path,
        mime_type: item.file.type || null,
        file_name: item.file.name,
        size_bytes: item.file.size,
        analysis: {
          source: 'frontend-v2',
          visit_id: input.id,
          location: input.location,
        },
        created_by: auth.user!.id,
        verification_status: 'unreviewed',
        source_kind: 'web',
        visit_id: input.id,
        deficiency_id: deficiencyId || null,
      }));

      const { error: evidenceError } = await supabase
        .from('project_evidence')
        .upsert(rows, { onConflict: 'id' });

      if (evidenceError) throw evidenceError;
    }

    return {
      visitId: input.id,
      evidenceCount: uploads.length,
      deficiencyId,
      warning: deficiencyId
        ? 'Deficiencia registrada y vinculada automáticamente a la visita.'
        : undefined,
    };
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from('project-files').remove(uploadedPaths).catch(() => undefined);
    }
    throw error;
  }
}
