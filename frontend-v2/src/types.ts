export type UserRole =
  | 'SUPERVISOR'
  | 'INGENIERO_RESIDENTE'
  | 'ADMIN_MUNICIPAL'
  | 'AUDITOR'
  | 'CONTRATISTA';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  municipalEntity: string;
}

export type SyncStatus =
  | 'EN_LINEA'
  | 'GUARDADO_LOCAL'
  | 'PENDIENTE_SYNC'
  | 'SINCRONIZADO';

export type ProjectStatus =
  | 'PLANIFICACION'
  | 'EN_EJECUCION'
  | 'SUSPENDIDO'
  | 'RECEPCION_PROVISIONAL'
  | 'FINALIZADO';

export interface Project {
  id: string;
  code: string;
  planningCode?: string;
  executionCode?: string;
  name: string;
  shortName: string;
  location: string;
  community: string;
  status: ProjectStatus;
  statusLabel: string;
  physicalProgress: number; // 0-100
  financialProgress: number; // 0-100
  responsibleUnit: string;
  responsiblePerson: string;
  assignedBudget: number;
  revisedBudget: number;
  fundingSource: string;
  startDate: string;
  expectedEndDate: string;
  description: string;
  contractId?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
}

export type ContractStatus =
  | 'PENDIENTE_FIRMA'
  | 'VIGENTE'
  | 'MODIFICADO'
  | 'LIQUIDADO';

export interface Contract {
  id: string;
  projectId: string;
  contractNumber: string;
  contractorName: string;
  contractorRTN: string;
  contractorRep: string;
  amount: number;
  signedDate: string;
  executionTermDays: number;
  advancePercentage: number;
  advanceAmount: number;
  advanceAmortizationRule: string;
  isDraft: boolean;
  status: ContractStatus;
  statusLabel: string;
  sourceDocumentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAmendment {
  id: string;
  projectId: string;
  type: 'INCREMENTO' | 'REDUCCION' | 'TRANSFERENCIA';
  amount: number;
  reason: string;
  approvalDate: string;
  approvingAuthority: string;
  agreementNumber: string;
  documentId?: string;
}

export type PaymentStatus =
  | 'PENDIENTE_REVISION'
  | 'APROBADA'
  | 'ORDEN_PAGO'
  | 'PAGADA'
  | 'RECHAZADA';

export interface Estimate {
  id: string;
  projectId: string;
  estimateNumber: number;
  periodStart: string;
  periodEnd: string;
  physicalProgressPeriod: number;
  physicalProgressCumulative: number;
  grossAmount: number; // Monto bruto
  advanceAmortization: number; // Anticipo amortizado
  isrDeduction: number; // ISR 12.5%
  complianceRetention: number; // Retención cumplimiento 15%
  qualityRetention: number; // Retención calidad 5%
  otherDeductions: number;
  netPayable: number; // Monto neto
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  paymentDate?: string;
  paymentReference?: string;
  documentId?: string;
  remarks?: string;
  createdAt: string;
}

export type GuaranteeType =
  | 'CUMPLIMIENTO'
  | 'ANTICIPO'
  | 'CALIDAD_OBRA'
  | 'MANTENIMIENTO_OFERTA';

export type GuaranteeStatus =
  | 'VIGENTE'
  | 'POR_VENCER'
  | 'VENCIDA'
  | 'LIBERADA'
  | 'EJECUTADA';

export interface Guarantee {
  id: string;
  projectId: string;
  contractId?: string;
  type: GuaranteeType;
  typeLabel: string;
  issuer: string;
  policyNumber: string;
  amount: number;
  issueDate: string;
  expiryDate: string;
  daysToExpiry: number;
  status: GuaranteeStatus;
  statusLabel: string;
  sourceDocumentId?: string;
}

export type DeficiencySeverity =
  | 'LEVE'
  | 'MODERADA'
  | 'GRAVE'
  | 'BLOQUEANTE';

export type DeficiencyStatus =
  | 'ABIERTA'
  | 'EN_CORRECCION'
  | 'VERIFICADA'
  | 'CERRADA';

export interface DeficiencyHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  comment?: string;
}

export interface Deficiency {
  id: string;
  projectId: string;
  title: string;
  specificLocation: string;
  description: string;
  severity: DeficiencySeverity;
  reportedDate: string;
  reportedBy: string;
  responsibleContractor: string;
  deadline: string;
  status: DeficiencyStatus;
  statusLabel: string;
  isVerified: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
  closedDate?: string;
  closedBy?: string;
  evidenceUrls: string[];
  audioUrl?: string;
  linkedVisitId?: string;
  history: DeficiencyHistoryItem[];
}

export type DocumentType =
  | 'CONTRATO'
  | 'ESTIMACION'
  | 'ORDEN_PAGO'
  | 'POLIZA'
  | 'BITACORA'
  | 'FOTOGRAFIA'
  | 'PLANO'
  | 'INFORME'
  | 'ACTA'
  | 'AUDIO'
  | 'CONVENIO'
  | 'ADENDA'
  | 'OTRO';

export interface DocumentEvidence {
  id: string;
  projectId: string;
  contractId?: string;
  estimateId?: string;
  paymentId?: string;
  guaranteeId?: string;
  visitId?: string;
  deficiencyId?: string;
  type: DocumentType;
  typeLabel: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  version: number;
  url?: string;
}

export interface FieldVisit {
  id: string;
  projectId: string;
  visitDate: string;
  inspectorName: string;
  progressReported: number;
  workCompleted: string;
  weatherCondition: string;
  staffCount: number;
  equipmentOnSite: string;
  gpsCoords?: {
    lat: number;
    lng: number;
    accuracy?: number;
    description?: string;
  };
  photoUrls: string[];
  audioNotes?: string;
  deficienciesCreated?: string[];
  syncStatus: SyncStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  entityCode?: string;
  details: string;
}

export interface TransparencyCategoryItem {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  available: boolean;
}

export interface TransparencyPublication {
  id: string;
  monthYear: string; // e.g. "Septiembre 2026"
  monthCode: string; // "2026-09"
  selectedCategoryIds: string[];
  generatedAt?: string;
  publishedBy?: string;
  status: 'BORRADOR' | 'GENERADO' | 'PUBLICADO';
  fileFormat: 'PORTAL_WEB' | 'PDF' | 'ZIP';
}

export type AppModule =
  | 'inicio'
  | 'proyectos'
  | 'contratos'
  | 'contratistas'
  | 'convenios'
  | 'presupuestos'
  | 'estimaciones'
  | 'garantias'
  | 'visitas'
  | 'compras'
  | 'deficiencias'
  | 'documentos'
  | 'reportes'
  | 'transparencia'
  | 'portal_publico'
  | 'auditoria'
  | 'configuracion'
  | 'modo_campo'
  | 'registrar_visita'
  | 'busqueda';
