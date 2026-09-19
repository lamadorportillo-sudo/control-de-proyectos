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
import { classifyDocumentType } from './documentClassification.ts';

type Row = Record<string, any>;

const n = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const s = (value: unknown, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value);

function uniqueRows<T extends Row>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const id = s(row.id);
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function uniqueByBusinessKey<T extends Row>(rows: T[], keyOf: (row: T) => string): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const businessKey = keyOf(row).trim();
    const hasBusinessValue = businessKey.replace(/\|/g, '').trim().length > 0;
    const key = hasBusinessValue ? businessKey : `id:${s(row.id)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const dateOnly = (value: unknown): string => s(value).slice(0, 10);

function projectStatus(row: Row): Project['status'] {
  const raw = s(row.raw_data?.status ?? row.status).toLowerCase();
  if (/ampli/.test(raw)) return 'AMPLIACION_GARANTIAS';
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
    observations: s(raw.observations || row.observations || ''),
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
  const raw = s(row.raw_data?.status || row.status || '').toLowerCase();
  if (row.voided_at) return 'EJECUTADA';
  if (/reemplaz/.test(raw)) return 'REEMPLAZADA';
  if (/liber/.test(raw)) return 'LIBERADA';
  if (/ejecut/.test(raw)) return 'EJECUTADA';
  if (/por.?vencer/.test(raw)) return 'POR_VENCER';
  if (/vencid/.test(raw)) return 'VENCIDA';
  if (/vigen/.test(raw)) return 'VIGENTE';
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
    statusLabel: s(row.raw_data?.status || row.status || guaranteeStatus(row)).replaceAll('_', ' '),
    observations: s(row.raw_data?.observations || row.observations || ''),
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
  const title = s(raw.title || row.file_name || 'Evidencia');
  const classification = classifyDocumentType({
    evidenceType: row.evidence_type,
    fileName: row.file_name,
    mimeType: row.mime_type,
    title,
    documentType: raw.documentType,
    document_type: raw.document_type,
    type: raw.type,
    category: raw.category,
    extractedText: row.extracted_text,
  });

  return {
    id: s(row.id),
    projectId: s(row.project_id || ''),
    visitId: s(row.visit_id || '') || undefined,
    deficiencyId: s(row.deficiency_id || '') || undefined,
    type: classification.type,
    typeLabel: classification.label,
    title,
    fileName: s(row.file_name || ''),
    fileSize: row.size_bytes ? `${row.size_bytes} bytes` : '',
    uploadDate: dateOnly(row.created_at),
    uploadedBy: s(raw.uploadedBy || raw.uploaded_by || ''),
    version: n(raw.version, 1),
    url: undefined,
  };
}

function mapStructuredDeficiency(row: Row, followups: Row[] = []): Deficiency {
  const history: Deficiency['history'] = [
    {
      timestamp: s(row.reported_at || row.created_at),
      action: 'Registrada',
      user: s(row.reported_by || 'Usuario'),
      comment: s(row.description || ''),
    },
    ...followups.map((item) => ({
      timestamp: s(item.created_at),
      action: s(item.action || 'Seguimiento'),
      user: s(item.created_by || 'Usuario'),
      comment: [item.comment, item.instruction].filter(Boolean).join(' · ') || undefined,
    })),
  ];

  if (row.verified_at) {
    history.push({
      timestamp: s(row.verified_at),
      action: 'Verificada',
      user: s(row.verified_by || 'Usuario'),
      comment: s(row.verification_observation || '') || undefined,
    });
  }
  if (row.closed_at) {
    history.push({
      timestamp: s(row.closed_at),
      action: 'Cerrada',
      user: s(row.closed_by || 'Usuario'),
    });
  }

  return {
    id: s(row.id),
    projectId: s(row.project_id),
    title: s(row.title),
    specificLocation: s(row.specific_location || ''),
    description: s(row.description || ''),
    severity: (['LEVE','MODERADA','GRAVE','BLOQUEANTE'].includes(s(row.severity)) ? s(row.severity) : 'MODERADA') as Deficiency['severity'],
    reportedDate: dateOnly(row.reported_at || row.created_at),
    reportedBy: s(row.reported_by || ''),
    responsibleContractor: s(row.responsible || ''),
    deadline: dateOnly(row.due_date),
    status: (['ABIERTA','EN_CORRECCION','VERIFICADA','CERRADA'].includes(s(row.status)) ? s(row.status) : 'ABIERTA') as Deficiency['status'],
    statusLabel: row.status === 'EN_CORRECCION' ? 'En corrección' : row.status === 'VERIFICADA' ? 'Verificada' : row.status === 'CERRADA' ? 'Cerrada' : 'Abierta',
    isVerified: Boolean(row.verified_at),
    verifiedDate: row.verified_at ? dateOnly(row.verified_at) : undefined,
    verifiedBy: s(row.verified_by || '') || undefined,
    closedDate: row.closed_at ? dateOnly(row.closed_at) : undefined,
    closedBy: s(row.closed_by || '') || undefined,
    evidenceUrls: [],
    linkedVisitId: s(row.source_visit_id || '') || undefined,
    history: history.sort((a,b) => String(a.timestamp).localeCompare(String(b.timestamp))),
  };
}

function mapAlertToDeficiency(row: Row): Deficiency {
  const severity = s(row.severity).toUpperCase();
  const sev: Deficiency['severity'] =
    /BLOQUEANTE/.test(severity)
      ? 'BLOQUEANTE'
      : /CRITIC|URGENTE|VENCIDA|HIGH|ALTA/.test(severity)
        ? 'GRAVE'
        : /ADVERTENCIA|MEDIUM|MEDIA/.test(severity)
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
    linkedVisitId: /VISIT/i.test(s(row.source_type)) && row.source_id ? s(row.source_id) : undefined,
    history: [
      row.first_detected_at ? {
        timestamp: s(row.first_detected_at),
        action: 'Detectada',
        user: 'Sistema',
        comment: s(row.message || ''),
      } : null,
      row.acknowledged_at ? {
        timestamp: s(row.acknowledged_at),
        action: 'Reconocida',
        user: s(row.acknowledged_by || 'Usuario'),
      } : null,
      row.resolved_at ? {
        timestamp: s(row.resolved_at),
        action: 'Cerrada',
        user: 'Sistema',
      } : null,
    ].filter(Boolean) as Deficiency['history'],
  };
}

export class SupabaseDataRepository implements IDataRepository {
  private workspaceId: string | null | undefined;
  private workspaceUserId: string | null | undefined;

  private client() {
    if (!supabase) throw new Error('Supabase no está configurado en frontend-v2.');
    return supabase;
  }

  private async getWorkspaceId(): Promise<string | null> {
    if (this.workspaceId !== undefined) return this.workspaceId;
    const client = this.client();
    const { data: sessionData } = await client.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (this.workspaceUserId === userId && this.workspaceId !== undefined) {
      return this.workspaceId;
    }
    this.workspaceUserId = userId || null;
    if (!userId) {
      this.workspaceId = null;
      return null;
    }
    const { data, error } = await client
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    this.workspaceId = data?.workspace_id ? String(data.workspace_id) : null;
    return this.workspaceId;
  }

  async getProjects(): Promise<Project[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('projects')
      .select('id,workspace_id,code,name,description,location,project_type,budget_estimate,status,start_date,end_date,execution_days,archived_at,created_at,updated_at,raw_data')
      .is('archived_at', null)
      .limit(500);
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return uniqueByBusinessKey(uniqueRows(data || []), (row) => s(row.code) || [s(row.name), s(row.location)].join('|')).map(mapProject).sort((a, b) =>
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
    );
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('archived_at', null);
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapProject(data) : undefined;
  }

  async saveProject(project: Project): Promise<void> {
    const { data: membership, error: membershipError } = await this.client()
      .from('workspace_members')
      .select('workspace_id')
      .eq('active', true)
      .limit(1)
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo activo.');

    const statusLabel =
      project.status === 'EN_EJECUCION' ? 'En ejecución' :
      project.status === 'SUSPENDIDO' ? 'Suspendido' :
      project.status === 'RECEPCION_PROVISIONAL' ? 'Recepción provisional' :
      project.status === 'FINALIZADO' ? 'Finalizado' :
      'Planificación';

    const row = {
      id: project.id || crypto.randomUUID(),
      workspace_id: membership.workspace_id,
      code: project.code.trim(),
      name: project.name.trim(),
      description: project.description || null,
      location: project.location || null,
      project_type: 'Obra',
      budget_estimate: project.assignedBudget || project.revisedBudget || 0,
      status: statusLabel,
      start_date: project.startDate || null,
      end_date: project.expectedEndDate || null,
      raw_data: {
        source: 'frontend-v2',
        planningCode: project.planningCode || null,
        executionCode: project.executionCode || null,
        shortName: project.shortName || project.name,
        community: project.community || project.location || '',
        responsibleUnit: project.responsibleUnit || 'Unidad de Proyectos',
        responsiblePerson: project.responsiblePerson || '',
        fundingSource: project.fundingSource || 'Por registrar',
        physicalProgress: project.physicalProgress || 0,
        financialProgress: project.financialProgress || 0,
        status: statusLabel,
        observations: project.observations || null,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client()
      .from('projects')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async getContracts(): Promise<Contract[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('contracts')
      .select('*')
      .is('voided_at', null)
      .order('updated_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return uniqueByBusinessKey(uniqueRows(data || []), (row) => [s(row.project_id), s(row.number)].join('|')).map(mapContract);
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

  async saveContract(contract: Contract): Promise<void> {
    const project = await this.getProjectById(contract.projectId);
    if (!project) throw new Error('Proyecto no encontrado para guardar el contrato.');

    const { data: projectRow, error: projectError } = await this.client()
      .from('projects')
      .select('workspace_id')
      .eq('id', contract.projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!projectRow?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

    const row = {
      id: contract.id || crypto.randomUUID(),
      workspace_id: projectRow.workspace_id,
      project_id: contract.projectId,
      number: contract.contractNumber.trim(),
      contractor: contract.contractorName.trim(),
      original_amount: contract.amount,
      signature_date: contract.signedDate || null,
      execution_days: contract.executionTermDays || null,
      status: contract.statusLabel || 'Vigente',
      advance_requested_pct: contract.advancePercentage || 0,
      advance_approved: contract.advanceAmount || 0,
      advance_paid: 0,
      recovery_target_pct: 80,
      advance_recovery_basis: contract.advanceAmortizationRule || 'ORIGINAL',
      notes: contract.notes || null,
      raw_data: {
        source: 'frontend-v2',
        contractorRTN: contract.contractorRTN,
        contractorRep: contract.contractorRep,
        sourceDocumentId: contract.sourceDocumentId || null,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client()
      .from('contracts')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async getEstimates(projectId?: string): Promise<Estimate[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('estimates')
      .select('*')
      .is('voided_at', null)
      .order('updated_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return uniqueByBusinessKey(uniqueRows(data || []), (row) => [s(row.project_id), s(row.number)].join('|')).map(mapEstimate);
  }

  async saveEstimate(estimate: Estimate): Promise<void> {
    const { data: projectRow, error: projectError } = await this.client()
      .from('projects')
      .select('workspace_id')
      .eq('id', estimate.projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!projectRow?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

    const { data: contractRow, error: contractError } = await this.client()
      .from('contracts')
      .select('id')
      .eq('project_id', estimate.projectId)
      .is('voided_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (contractError) throw contractError;
    if (!contractRow?.id) throw new Error('Este proyecto no tiene un contrato vigente para registrar la estimación.');

    const totalDeductions =
      Number(estimate.advanceAmortization || 0) +
      Number(estimate.isrDeduction || 0) +
      Number(estimate.complianceRetention || 0) +
      Number(estimate.qualityRetention || 0) +
      Number(estimate.otherDeductions || 0);

    const row = {
      id: estimate.id || crypto.randomUUID(),
      workspace_id: projectRow.workspace_id,
      project_id: estimate.projectId,
      contract_id: contractRow.id,
      number: estimate.estimateNumber,
      period_start: estimate.periodStart || null,
      period_end: estimate.periodEnd || null,
      gross: estimate.grossAmount,
      advance_applied: estimate.advanceAmortization || 0,
      quality_applied: estimate.qualityRetention || 0,
      isr_applied: estimate.isrDeduction || 0,
      other_deductions: Number(estimate.otherDeductions || 0) + Number(estimate.complianceRetention || 0),
      total_deductions: totalDeductions,
      net: estimate.netPayable,
      status: estimate.paymentStatusLabel || 'Borrador',
      payment_date: estimate.paymentDate || null,
      payment_order: estimate.paymentReference || null,
      notes: estimate.remarks || null,
      raw_data: {
        source: 'frontend-v2',
        physicalProgressPeriod: estimate.physicalProgressPeriod,
        physicalProgressCumulative: estimate.physicalProgressCumulative,
        complianceRetention: estimate.complianceRetention,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client()
      .from('estimates')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async getGuarantees(contractId?: string): Promise<Guarantee[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('guarantees')
      .select('*')
      .is('voided_at', null)
      .order('updated_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    if (contractId) query = query.eq('contract_id', contractId);
    const { data, error } = await query;
    if (error) throw error;
    return uniqueByBusinessKey(uniqueRows(data || []), (row) => [s(row.project_id), s(row.guarantee_type), s(row.number)].join('|')).map(mapGuarantee);
  }

  async saveGuarantee(guarantee: Guarantee): Promise<void> {
    const { data: projectRow, error: projectError } = await this.client()
      .from('projects')
      .select('workspace_id')
      .eq('id', guarantee.projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!projectRow?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

    let contractId = guarantee.contractId || null;
    if (!contractId) {
      const { data: contractRow, error: contractError } = await this.client()
        .from('contracts')
        .select('id')
        .eq('project_id', guarantee.projectId)
        .is('voided_at', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (contractError) throw contractError;
      contractId = contractRow?.id || null;
    }

    const dbType =
      guarantee.type === 'ANTICIPO' ? 'Anticipo' :
      guarantee.type === 'CALIDAD_OBRA' ? 'Calidad de obra' :
      guarantee.type === 'MANTENIMIENTO_OFERTA' ? 'Mantenimiento de oferta' :
      'Cumplimiento';

    const row = {
      id: guarantee.id || crypto.randomUUID(),
      workspace_id: projectRow.workspace_id,
      project_id: guarantee.projectId,
      contract_id: contractId,
      guarantee_type: dbType,
      number: guarantee.policyNumber || null,
      issuer: guarantee.issuer || null,
      document_ref: guarantee.sourceDocumentId || null,
      calculation_base: guarantee.amount || 0,
      percentage: 0,
      calculated_amount: guarantee.amount || 0,
      applied_amount: guarantee.amount || 0,
      start_date: guarantee.issueDate,
      end_date: guarantee.expiryDate,
      raw_data: {
        source: 'frontend-v2',
        status: guarantee.status,
        observations: guarantee.observations || null,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client()
      .from('guarantees')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async getDeficiencies(projectId?: string): Promise<Deficiency[]> {
    const workspaceId = await this.getWorkspaceId();
    let deficiencyQuery = this.client()
      .from('deficiencies')
      .select('*')
      .order('reported_at', { ascending: false });
    if (workspaceId) deficiencyQuery = deficiencyQuery.eq('workspace_id', workspaceId);
    if (projectId) deficiencyQuery = deficiencyQuery.eq('project_id', projectId);

    let followupQuery = this.client()
      .from('deficiency_followups')
      .select('*')
      .order('created_at', { ascending: true });
    if (workspaceId) followupQuery = followupQuery.eq('workspace_id', workspaceId);
    if (projectId) followupQuery = followupQuery.eq('project_id', projectId);

    const [{ data, error }, { data: followups, error: followupError }] = await Promise.all([
      deficiencyQuery,
      followupQuery,
    ]);

    if (error) throw error;
    if (followupError) throw followupError;

    const byDeficiency = new Map<string, Row[]>();
    for (const item of uniqueRows(followups || [])) {
      const key = s(item.deficiency_id);
      const list = byDeficiency.get(key) || [];
      list.push(item);
      byDeficiency.set(key, list);
    }

    return uniqueByBusinessKey(uniqueRows(data || []), (row) => [s(row.project_id), s(row.title), s(row.reported_at || row.created_at)].join('|')).map((row: Row) => mapStructuredDeficiency(row, byDeficiency.get(s(row.id)) || []));
  }

  async saveDeficiency(deficiency: Deficiency): Promise<void> {
    const { data: projectRow, error: projectError } = await this.client()
      .from('projects')
      .select('workspace_id')
      .eq('id', deficiency.projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!projectRow?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

    const row = {
      id: deficiency.id || crypto.randomUUID(),
      workspace_id: projectRow.workspace_id,
      project_id: deficiency.projectId,
      source_visit_id: deficiency.linkedVisitId || null,
      title: deficiency.title.trim(),
      specific_location: deficiency.specificLocation || '',
      description: deficiency.description || '',
      severity: deficiency.severity,
      responsible: deficiency.responsibleContractor || '',
      due_date: deficiency.deadline || null,
      status: deficiency.status,
      verified_at: deficiency.verifiedDate ? new Date(deficiency.verifiedDate + 'T12:00:00Z').toISOString() : null,
      verified_by: deficiency.verifiedBy || null,
      closed_at: deficiency.closedDate ? new Date(deficiency.closedDate + 'T12:00:00Z').toISOString() : null,
      closed_by: deficiency.closedBy || null,
      raw_data: { source: 'frontend-v2' },
    };

    const { error } = await this.client()
      .from('deficiencies')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async getDocuments(projectId?: string): Promise<DocumentEvidence[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('project_evidence')
      .select('*')
      .order('created_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return uniqueByBusinessKey(uniqueRows(data || []), (row) => [s(row.project_id), s(row.visit_id), s(row.deficiency_id), s(row.file_name), s(row.created_at)].join('|')).map(mapDocument);
  }

  async saveDocument(_doc: DocumentEvidence): Promise<void> {
    throw new Error('La carga de documentos utilizará el pipeline productivo de Storage/Edge Functions existente.');
  }

  async getFieldVisits(projectId?: string): Promise<FieldVisit[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('visits')
      .select('*')
      .is('voided_at', null)
      .order('visit_date', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return uniqueByBusinessKey(uniqueRows(data || []), (row) => [s(row.project_id), s(row.visit_date), s(row.inspector)].join('|')).map(mapVisit);
  }

  async saveFieldVisit(visit: FieldVisit): Promise<void> {
    const { data: projectRow, error: projectError } = await this.client()
      .from('projects')
      .select('workspace_id')
      .eq('id', visit.projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!projectRow?.workspace_id) throw new Error('No se pudo resolver el espacio de trabajo del proyecto.');

    const row = {
      id: visit.id || crypto.randomUUID(),
      workspace_id: projectRow.workspace_id,
      project_id: visit.projectId,
      visit_date: visit.visitDate,
      inspector: visit.inspectorName || null,
      summary: visit.workCompleted || null,
      raw_data: {
        source: 'frontend-v2',
        progressReported: visit.progressReported,
        weatherCondition: visit.weatherCondition,
        staffCount: visit.staffCount,
        equipmentOnSite: visit.equipmentOnSite,
        gpsCoords: visit.gpsCoords || null,
        audioNotes: visit.audioNotes || null,
        deficienciesCreated: visit.deficienciesCreated || [],
        syncStatus: visit.syncStatus,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client()
      .from('visits')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const workspaceId = await this.getWorkspaceId();
    let query = this.client()
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(250);
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
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
