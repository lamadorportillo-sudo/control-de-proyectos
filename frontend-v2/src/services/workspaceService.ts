import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface WorkspaceContext {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  await ensureSupabaseSession();

  const auth = await getV2AuthState();
  if (!auth.authenticated || !auth.user) {
    throw new Error('Sesión requerida para consultar la configuración.');
  }

  const userId = auth.user.id;

  const [{ data: membership, error: membershipError }, { data: profile, error: profileError }] = await Promise.all([
    supabase
      .from('workspace_members')
      .select('workspace_id,role,active')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name,active')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (membershipError) throw membershipError;
  if (profileError) throw profileError;
  if (!membership?.workspace_id) {
    throw new Error('La cuenta no tiene un espacio de trabajo activo.');
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id,name')
    .eq('id', membership.workspace_id)
    .maybeSingle();

  if (workspaceError) throw workspaceError;
  if (!workspace) throw new Error('No se pudo resolver el espacio de trabajo.');

  return {
    workspaceId: String(workspace.id),
    workspaceName: String(workspace.name || 'Control de proyectos'),
    userId,
    fullName: String(profile?.full_name || auth.user.user_metadata?.full_name || auth.user.email || 'Usuario'),
    email: String(auth.user.email || ''),
    role: String(membership.role || 'consulta'),
    active: Boolean(profile?.active ?? true),
  };
}
