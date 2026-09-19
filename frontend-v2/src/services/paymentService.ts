import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface PaymentRecord {
  id: string;
  projectId: string;
  contractId: string;
  estimateId?: string;
  movementType: string;
  amount: number;
  paymentDate: string;
  paymentOrder?: string;
  receipt?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentWriteInput {
  projectId: string;
  estimateId?: string;
  movementType: string;
  amount: number;
  paymentDate: string;
  paymentOrder?: string;
  receipt?: string;
  status?: string;
  notes?: string;
}

const s = (value: unknown, fallback = '') =>
  value === null || value === undefined ? fallback : String(value);

const n = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

async function requireAuth() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated || !auth.user) throw new Error('Sesión requerida para registrar pagos.');
  return auth;
}

export async function getPayments(projectId?: string): Promise<PaymentRecord[]> {
  await requireAuth();
  let query = supabase!
    .from('payments')
    .select('*')
    .is('voided_at', null)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row: Record<string, any>) => ({
    id: s(row.id),
    projectId: s(row.project_id),
    contractId: s(row.contract_id),
    estimateId: s(row.estimate_id || '') || undefined,
    movementType: s(row.movement_type || 'Pago'),
    amount: n(row.amount),
    paymentDate: s(row.payment_date).slice(0, 10),
    paymentOrder: s(row.payment_order || '') || undefined,
    receipt: s(row.receipt || '') || undefined,
    status: s(row.status || 'Pendiente'),
    notes: s(row.notes || '') || undefined,
    createdAt: s(row.created_at),
  }));
}

export async function savePayment(input: PaymentWriteInput): Promise<string> {
  const auth = await requireAuth();

  const { data: project, error: projectError } = await supabase!
    .from('projects')
    .select('workspace_id')
    .eq('id', input.projectId)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

  let contractId = '';
  if (input.estimateId) {
    const { data: estimate, error: estimateError } = await supabase!
      .from('estimates')
      .select('contract_id')
      .eq('id', input.estimateId)
      .is('voided_at', null)
      .maybeSingle();
    if (estimateError) throw estimateError;
    contractId = s(estimate?.contract_id);
  }

  if (!contractId) {
    const { data: contract, error: contractError } = await supabase!
      .from('contracts')
      .select('id')
      .eq('project_id', input.projectId)
      .is('voided_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (contractError) throw contractError;
    contractId = s(contract?.id);
  }

  if (!contractId) throw new Error('El proyecto no tiene contrato vigente para asociar el pago.');

  const id = crypto.randomUUID();
  const { error } = await supabase!
    .from('payments')
    .insert({
      id,
      workspace_id: project.workspace_id,
      project_id: input.projectId,
      contract_id: contractId,
      estimate_id: input.estimateId || null,
      movement_type: input.movementType.trim() || 'Pago de estimación',
      amount: input.amount,
      payment_date: input.paymentDate,
      payment_order: input.paymentOrder?.trim() || null,
      receipt: input.receipt?.trim() || null,
      status: input.status || 'Pagado',
      notes: input.notes?.trim() || null,
      raw_data: {
        source: 'frontend-v2',
        registered_by: auth.user!.id,
      },
    });

  if (error) throw error;
  return id;
}
