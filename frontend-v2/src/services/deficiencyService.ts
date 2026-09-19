import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface DeficiencyFollowupInput {
  deficiencyId: string;
  projectId: string;
  action: string;
  comment?: string;
  instruction?: string;
  responsible?: string;
  dueDate?: string;
}

async function requireContext(projectId: string) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated || !auth.user) throw new Error('Sesión requerida.');

  const { data: project, error } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!project?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo.');
  return { auth, workspaceId: String(project.workspace_id) };
}

export async function addDeficiencyFollowup(input: DeficiencyFollowupInput): Promise<void> {
  const { auth, workspaceId } = await requireContext(input.projectId);
  const { error } = await supabase!.from('deficiency_followups').insert({
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    deficiency_id: input.deficiencyId,
    project_id: input.projectId,
    action: input.action.trim() || 'Seguimiento',
    comment: input.comment?.trim() || '',
    instruction: input.instruction?.trim() || '',
    responsible: input.responsible?.trim() || '',
    due_date: input.dueDate || null,
    created_by: auth.user!.id,
  });
  if (error) throw error;
}

export async function markDeficiencyInCorrection(
  deficiencyId: string,
  projectId: string,
  comment?: string,
): Promise<void> {
  await requireContext(projectId);
  const { error } = await supabase!
    .from('deficiencies')
    .update({ status: 'EN_CORRECCION' })
    .eq('id', deficiencyId);
  if (error) throw error;

  await addDeficiencyFollowup({
    deficiencyId,
    projectId,
    action: 'En corrección',
    comment,
  });
}

export async function verifyDeficiency(
  deficiencyId: string,
  projectId: string,
  observation: string,
): Promise<void> {
  const { auth } = await requireContext(projectId);
  const { error } = await supabase!
    .from('deficiencies')
    .update({
      status: 'VERIFICADA',
      verified_at: new Date().toISOString(),
      verified_by: auth.user!.id,
      verification_observation: observation.trim() || null,
    })
    .eq('id', deficiencyId);
  if (error) throw error;
}

export async function rejectDeficiencyCorrection(
  deficiencyId: string,
  projectId: string,
  reason: string,
  instruction: string,
  responsible: string,
  dueDate?: string,
): Promise<void> {
  await requireContext(projectId);
  const { error } = await supabase!
    .from('deficiencies')
    .update({
      status: 'EN_CORRECCION',
      verified_at: null,
      verified_by: null,
      verification_observation: null,
      responsible,
      due_date: dueDate || null,
    })
    .eq('id', deficiencyId);
  if (error) throw error;

  await addDeficiencyFollowup({
    deficiencyId,
    projectId,
    action: 'Corrección rechazada',
    comment: reason,
    instruction,
    responsible,
    dueDate,
  });
}

export async function closeDeficiency(deficiencyId: string, projectId: string): Promise<void> {
  const { auth } = await requireContext(projectId);

  const { data: current, error: readError } = await supabase!
    .from('deficiencies')
    .select('status,verified_at')
    .eq('id', deficiencyId)
    .maybeSingle();
  if (readError) throw readError;
  if (!current?.verified_at || current.status !== 'VERIFICADA') {
    throw new Error('La deficiencia debe estar verificada antes de cerrarse.');
  }

  const { error } = await supabase!
    .from('deficiencies')
    .update({
      status: 'CERRADA',
      closed_at: new Date().toISOString(),
      closed_by: auth.user!.id,
    })
    .eq('id', deficiencyId);
  if (error) throw error;
}
