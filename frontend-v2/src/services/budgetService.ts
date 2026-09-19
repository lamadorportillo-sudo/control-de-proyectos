import type { BudgetAmendment } from '../types.ts';
import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

const s = (v: unknown, fallback = '') => v === null || v === undefined ? fallback : String(v);
const n = (v: unknown, fallback = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
};

function mapType(value: unknown): BudgetAmendment['type'] {
  const v = s(value).toLowerCase();
  if (/reduc|dismin|decrease|egreso/.test(v)) return 'REDUCCION';
  if (/transf/.test(v)) return 'TRANSFERENCIA';
  return 'INCREMENTO';
}

export async function getBudgetAmendments(): Promise<BudgetAmendment[]> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated) throw new Error('Sesión requerida para consultar movimientos presupuestarios.');

  const { data, error } = await supabase
    .from('budget_movements')
    .select('*')
    .is('voided_at', null)
    .order('movement_date', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: Record<string, any>) => {
    const raw = row.raw_data || {};
    return {
      id: s(row.id),
      projectId: s(row.project_id),
      type: mapType(row.movement_type),
      amount: Math.abs(n(row.amount)),
      reason: s(row.note || raw.reason || row.movement_type || 'Movimiento presupuestario'),
      approvalDate: s(row.movement_date).slice(0, 10),
      approvingAuthority: s(raw.approvingAuthority || raw.authority || 'Por registrar'),
      agreementNumber: s(row.document_ref || raw.agreementNumber || 'Sin referencia'),
      documentId: s(raw.documentId || '') || undefined,
    };
  });
}
