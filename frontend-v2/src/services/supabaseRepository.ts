import type { IDataRepository } from './backendAdapter.ts';
import { supabase } from './supabaseClient.ts';
import type {
  Project,
  Contract,
  Estimate,
  Guarantee,
  Deficiency,
  DocumentEvidence,
  FieldVisit,
  AuditLog,
} from '../types.ts';

type Row = Record<string, any>;

const n = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const s = (value: unknown, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value);
const dateOnly = (value: unknown): string => s(value).slice(0, 10);

function projectStatus(row: Row): Project['status'] {
  const raw = s(row.raw_data?.status ?? row.status).toLowerCase();
  if (/final|cerr|termin/.test(raw)) return 'FINALIZADO';
  if (/suspend/.test(raw)) return 'SUSPENDIDO';
  if (/recep/.test(raw)) return 'RECEPCION_PROVISIONAL';
  if (/ejec|consolid/.test(raw)) return 'EN_EJECUCION';
  return 'PLANIFICACION';
}

function mapProject(row: Row): Project {
  const raw = row.raw_data || {};
  const budgetControl = raw.budgetControl || {};
  const assigned = n(
    budgetControl.assigned,
    n(row.budget_estimate, n(raw.budget, 0)),
  );
  const expansion = n(budgetControl.expansion, 0);
  const decrease = n(budgetControl.decrease, 0);
  const transferPositive = n(budgetControl.transferPositive, 0);
  const transferNegative = n(budgetControl.transferNegative, 0);
  const revised =
    assigned + expansion - decrease + transferPositive - transferNegative;

  return {
    id: s(row.id),
    code: s(row.code),
    planningCode: s(raw.planningCode || ''),
    executionCode: s(raw.executionCode || ''),
    name: s(row.name),
    shortName: s(raw.shortName || row.name),
    location: s(row.location || raw.location),
    community: s(raw.community || row.location || ''),
    status: projectStatus(row),
    statusLabel: s(raw.status || row.status || 'Planificación'),
    physicalProgress: n(raw.physicalProgress, 0),
    financialProgress: n(raw.financialProgress ?? raw.paidProgress, 0),
    responsibleUnit: s(raw.responsibleUnit || 'Unidad de Proyectos'),
    responsiblePerson: s(raw.responsiblePerson || ''),
    assignedBudget: assigned,
    revisedBudget: revised || n(row.budget_estimate, 0),
    fundingSource: s(
      raw.fundingSource || budgetControl.source || 'Por registrar',
    ),
    startDate: dateOnly(row.start_date || raw.start),
    expectedEndDate: dateOnly(row.end_date || raw.end),
    description: s(row.description || raw.description),
    contractId: s(raw.contractId || '') || undefined,
    createdAt: dateOnly(row.created_at || raw.createdAt),
    updatedAt: dateOnly(row.updated_at || raw.updatedAt),
    syncStatus: 'SINCRONIZADO',
  };
}

function contractStatus(value: unknown): Contract['status'] {
  const v = s(value).toLowerCase();
  if (/liquid|cerr|final/.test(v)) return 'LIQUIDADO';
  if (/modif|adenda|cambio/.test(v)) return 'MODIFICADO';
  if (/pend|borr|firma/.test(v)) return 'PENDIENTE_FIRMA';
  return 'VIGENTE';
}

function mapContract(row: Row): Contract {
  const raw = row.raw_data || {};
  const advancePct = n(row.advance_requested_pct ?? raw.advancePercentage, 0);
  const advanceAmount = n(
    row.advance_approved ?? row.advance_paid ?? raw.advanceAmount,
    0,
  );
  return {
    id: s(row.id),
    projectId: s(row.project_id),
    contractNumber: s(row.number),
    contractorName: s(row.contractor),
    contractorRTN: s(raw.contractorRTN || raw.rtn || ''),
    contractorRep: s(raw.contractorRep || raw.representative || ''),
    amount: n(row.original_amount),
    signedDate: dateOnly(row.signature_date),
    executionTermDays: n(row.execution_days),
    advancePercentage: advancePct,
    advanceAmount,
    advanceAmortizationRule: s(
      row.advance_recovery_basis ||
        raw.advanceAmortizationRule ||
        'Amortización conforme al contrato vigente',
    ),
    isDraft: /draft|borrador/i.test(s(row.status)),
    status: contractStatus(row.status),
    statusLabel: s(row.status || 'Vigente'),
    sourceDocumentId: s(row.document_ref || raw.sourceDocumentId || '') || undefined,
    notes: s(row.notes || raw.notes || '') || undefined,
    createdAt: dateOnly(row.created_at),
    updatedAt: dateOnly(row.updated_at),
  };
}

function estimateStatus(value: unknown): Estimate['paymentStatus'] {
  const v = s(value).toLowerCase();
  if (/pagad/.test(v)) return 'PAGADA';
  if (/orden/.test(v)) return 'ORDEN_PAGO';
  if (/aproba/.test(v)) return 'APROBADA';
  if (/rechaz/.test(v)) return 'RECHAZADA';
  return 'PENDIENTE_REVISION';
}

function mapEstimate(row: Row): Estimate {
  const raw = row.raw_data || {};
  return {
    id: s(row.id),
    projectId: s(row.project_id),
    estimateNumber: n(row.number),
    periodStart: dateOnly(row.period_start),
    periodEnd: dateOnly(row.period_end),
    physicalProgressPeriod: n(raw.physicalProgressPeriod, 0),
    physicalProgressCumulative: n(
      raw.physicalProgressCumulative ?? raw.physicalProgress,
      0,
    ),
    grossAmount: n(row.gross),
    advanceAmortization: n(row.advance_applied),
    isrDeduction: n(row.isr_applied),
    complianceRetention: n(
      raw.complianceRetention ?? raw.retentionCompliance,
      0,
    ),
    qualityRetention: n(row.quality_applied),
    otherDeductions: n(row.other_deductions),
    netPayable: n(row.net),
    paymentStatus: estimateStatus(row.status),
    paymentStatusLabel: s(row.status || 'Pendiente de revisión'),
    paymentDate: dateOnly(row.payment_date) || undefined,
    paymentReference: s(row.payment_order || row.receipt || '') || undefined,
    documentId: s(raw.documentId || '') || undefined,
    remarks: s(row.notes || row.payment_notes || raw.remarks || '') || undefined,
    createdAt: dateOnly(row.created_at),
  };
}

function guaranteeType(value: unknown): Guarantee['type'] {
  const v = s(value).toLowerCase();
  if (/anticipo/.test(v)) return 'ANTICIPO';
  if (/calidad/.test(v)) return 'CALIDAD_OBRA';
  if (/oferta|mantenimiento/.test(v)) return 'MANTENIMIENTO_OFERTA';
  return 'CUMPLIMIENTO';
}

function guaranteeStatus(row: Row): Guarantee['status'] {
  const raw = s(row.raw_data?.status || '').toLowerCase();
  if (row.voided_at) return 'EJECUTADA';
  if (/liber/.test(raw)) return 'LIBERADA';
  const end = row.end_date ? new Date(row.end_date) : null;
  if (end && !Number.isNaN(end.getTime())) {
    const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
    if (days < 0) return 'VENCIDA';
    if (days <= 30) return 'POR_VENCER';
  }
  return 'VIGENTE';
}

function mapGuarantee(row: Row): Guarantee {
  const end = row.end_date ? new Date(row.end_date) : null;
  const days =
    end && !Number.isNaN(end.getTime())
      ? Math.ceil((end.getTime() - Date.now()) / 86400000)
      : 0;
  const type = guaranteeType(row.guarantee_type);
  return {
    id: s(row.id),
    projectId: s(row.project_id),
    contractId: s(row.contract_id || '') || undefined,
    type,
    typeLabel:
      type === 'ANTICIPO'
        ? 'Anticipo'
        : type === 'CALIDAD_OBRA'
          ? 'Calidad de obra'
          : type === 'MANTENIMIENTO_OFERTA'
            ? 'Mantenimiento de oferta'
            : 'Cumplimiento',
    issuer: s(row.issuer || ''),
    policyNumber: s(row.number || ''),
    amount: n(row.applied_amount || row.calculated_amount),
    issueDate: dateOnly(row.start_date),
    expiryDate: dateOnly(row.end_date),
    daysToExpiry: days,
    status: guaranteeStatus(row),
    statusLabel: guaranteeStatus(row).replaceAll('_', ' '),
    sourceDocumentId: s(row.document_ref || '') || undefined,
  };
}

function mapVisit(row: Row): FieldVisit {
  const raw = row.raw_data || {};
  return {
    id: s(row.id),
    projectId: s(row.project_id),
    visitDate: dateOnly(row.visit_date),
    inspectorName: s(row.inspector || raw.inspectorName || ''),
    progressReported: n(raw.progressReported ?? raw.physicalProgress, 0),
    workCompleted: s(row.summary || raw.workCompleted || ''),
    weatherCondition: s(raw.weatherCondition || ''),
    staffCount: n(raw.staffCount, 0),
    equipmentOnSite: s(raw.equipmentOnSite || ''),
    gpsCoords: raw.gpsCoords || undefined,
    photoUrls: Array.isArray(raw.photoUrls) ? raw.photoUrls : [],
    audioNotes: s(raw.audioNotes || '') || undefined,
    deficienciesCreated: Array.isArray(raw.deficienciesCreated)
      ? raw.deficienciesCreated
      : [],
    syncStatus: 'SINCRONIZADO',
    createdAt: dateOnly(row.created_at),
  };
}

function mapDocument(row: Row): DocumentEvidence {
  const raw = row.analysis || {};
  return {
    id: s(row.id),
    projectId: s(row.project_id || ''),
    visitId: s(row.visit_id || '') || undefined,
    type: /image|photo/i.test(s(row.evidence_type))
      ? 'FOTOGRAFIA'
      : /audio/i.test(s(row.evidence_type))
        ? 'AUDIO'
        : 'OTRO',
    typeLabel: s(row.evidence_type || 'Evidencia'),
    title: s(raw.title || row.file_name || 'Evidencia'),
    fileName: s(row.file_name || ''),
    fileSize: row.size_bytes ? `${row.size_bytes} bytes` : '',
    uploadDate: dateOnly(row.created_at),
    uploadedBy: s(raw.uploadedBy || ''),
    version: n(raw.version, 1),
    url: s(row.storage_path || '') || undefined,
  };
}

function mapAlertToDeficiency(row: Row): Deficiency {
  const severity = s(row.severity).toUpperCase();
  const sev: Deficiency['severity'] =
    severity === 'CRITICAL'
      ? 'BLOQUEANTE'
      : severity === 'HIGH'
        ? 'GRAVE'
        : severity === 'MEDIUM'
          ? 'MODERADA'
          : 'LEVE';
  const closed = Boolean(row.resolved_at);
  return {
    id: s(row.id),
    projectId: s(row.project_id || ''),
    title: s(row.title),
    specificLocation: '',
    description: s(row.message),
    severity: sev,
    reportedDate: dateOnly(row.first_detected_at),
    reportedBy: '',
    responsibleContractor: '',
    deadline: dateOnly(row.due_date),
    status: closed ? 'CERRADA' : 'ABIERTA',
    statusLabel: closed ? 'Cerrada' : 'Abierta',
    isVerified: closed,
    verifiedDate: closed ? dateOnly(row.resolved_at) : undefined,
    closedDate: closed ? dateOnly(row.resolved_at) : undefined,
    evidenceUrls: [],
    history: [],
  };
}

export class SupabaseDataRepository implements IDataRepository {
  private client() {
    if (!supabase) throw new Error('Supabase no está configurado en frontend-v2.');
    return supabase;
  }

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.client()
      .from('projects')
      .select('*')
      .is('archived_at', null)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProject);
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const { data, error } = await this.client()
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProject(data) : undefined;
  }

  async saveProject(_project: Project): Promise<void> {
    throw new Error('La escritura de proyectos se habilitará tras validar el contrato RLS/RPC productivo.');
  }

  async getContracts(): Promise<Contract[]> {
    const { data, error } = await this.client()
      .from('contracts')
      .select('*')
      .is('voided_at', null)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapContract);
  }

  async getContractByProjectId(projectId: string): Promise<Contract | undefined> {
    const { data, error } = await this.client()
      .from('contracts')
      .select('*')
      .eq('project_id', projectId)
      .is('voided_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapContract(data) : undefined;
  }

  async saveContract(_contract: Contract): Promise<void> {
    throw new Error('La escritura de contratos se habilitará tras validar el contrato RLS/RPC productivo.');
  }

  async getEstimates(projectId?: string): Promise<Estimate[]> {
    let query = this.client()
      .from('estimates')
      .select('*')
      .is('voided_at', null)
      .order('updated_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapEstimate);
  }

  async saveEstimate(_estimate: Estimate): Promise<void> {
    throw new Error('La escritura de estimaciones se habilitará tras validar el contrato RLS/RPC productivo.');
  }

  async getGuarantees(contractId?: string): Promise<Guarantee[]> {
    let query = this.client()
      .from('guarantees')
      .select('*')
      .is('voided_at', null)
      .order('updated_at', { ascending: false });
    if (contractId) query = query.eq('contract_id', contractId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapGuarantee);
  }

  async saveGuarantee(_guarantee: Guarantee): Promise<void> {
    throw new Error('La escritura de garantías se habilitará tras validar el contrato RLS/RPC productivo.');
  }

  async getDeficiencies(projectId?: string): Promise<Deficiency[]> {
    let query = this.client()
      .from('alert_events')
      .select('*')
      .order('last_evaluated_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapAlertToDeficiency);
  }

  async saveDeficiency(_deficiency: Deficiency): Promise<void> {
    throw new Error('La escritura de deficiencias se conectará al flujo productivo existente, no a alert_events directamente.');
  }

  async getDocuments(projectId?: string): Promise<DocumentEvidence[]> {
    let query = this.client()
      .from('project_evidence')
      .select('*')
      .order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapDocument);
  }

  async saveDocument(_doc: DocumentEvidence): Promise<void> {
    throw new Error('La carga de documentos utilizará el pipeline productivo de Storage/Edge Functions existente.');
  }

  async getFieldVisits(projectId?: string): Promise<FieldVisit[]> {
    let query = this.client()
      .from('visits')
      .select('*')
      .is('voided_at', null)
      .order('visit_date', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapVisit);
  }

  async saveFieldVisit(_visit: FieldVisit): Promise<void> {
    throw new Error('La escritura de visitas se conectará al flujo productivo existente para no duplicar IDs ni evidencias.');
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await this.client()
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(250);
    if (error) throw error;
    return (data || []).map((row: Row) => ({
      id: s(row.id),
      timestamp: s(row.created_at || row.timestamp),
      user: s(row.actor_name || row.user_name || row.user_id || ''),
      role: s(row.actor_role || row.role || ''),
      action: s(row.action || row.event_type || ''),
      entityType: s(row.entity_type || row.table_name || ''),
      entityId: s(row.entity_id || row.record_id || ''),
      entityCode: s(row.entity_code || '') || undefined,
      details: s(row.details || row.message || JSON.stringify(row.metadata || {})),
    }));
  }

  async logAction(_action: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    // La bitácora productiva ya se gestiona en backend; no insertar desde el cliente hasta validar RPC.
  }
}
