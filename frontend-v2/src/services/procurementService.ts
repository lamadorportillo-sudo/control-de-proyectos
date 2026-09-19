import { ensureSupabaseSession, getV2AuthState, supabase } from './supabaseClient.ts';

export interface ProcurementAuditRecord {
  workspaceId: string;
  projectId: string;
  code: string;
  name: string;
  status: string;
  projectType: string;
  fiscalYear: number;
  referenceAmount: number;
  thresholdId?: string;
  gacetaNumber?: string;
  decreeReference?: string;
  thresholdStatus?: string;
  procurementModeOriginal?: string;
  procurementModeLabel?: string;
  lockedAt?: string;
  snapshotIntegrity?: string;
  auditStatus?: string;
}

const s = (value: unknown, fallback = '') =>
  value === null || value === undefined ? fallback : String(value);

const n = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function getProcurementAudit(): Promise<ProcurementAuditRecord[]> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  await ensureSupabaseSession();
  const auth = await getV2AuthState();
  if (!auth.authenticated) {
    throw new Error('Sesión requerida para consultar compras y procesos de contratación.');
  }

  const { data, error } = await supabase
    .from('project_procurement_audit')
    .select('*')
    .order('code', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: Record<string, any>) => ({
    workspaceId: s(row.workspace_id),
    projectId: s(row.project_id),
    code: s(row.code),
    name: s(row.name),
    status: s(row.status),
    projectType: s(row.project_type),
    fiscalYear: n(row.fiscal_year),
    referenceAmount: n(row.procurement_reference_amount),
    thresholdId: s(row.procurement_threshold_id) || undefined,
    gacetaNumber: s(row.gaceta_number) || undefined,
    decreeReference: s(row.decree_reference) || undefined,
    thresholdStatus: s(row.threshold_status) || undefined,
    procurementModeOriginal: s(row.procurement_mode_original) || undefined,
    procurementModeLabel: s(row.procurement_mode_label) || undefined,
    lockedAt: s(row.procurement_locked_at) || undefined,
    snapshotIntegrity: s(row.snapshot_integrity) || undefined,
    auditStatus: s(row.procurement_audit_status) || undefined,
  }));
}
