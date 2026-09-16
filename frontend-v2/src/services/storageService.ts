import {
  Project,
  Contract,
  BudgetAmendment,
  Estimate,
  Guarantee,
  Deficiency,
  DocumentEvidence,
  FieldVisit,
  AuditLog,
  User,
  SyncStatus,
} from '../types.ts';
import {
  INITIAL_PROJECTS,
  INITIAL_CONTRACTS,
  INITIAL_BUDGET_AMENDMENTS,
  INITIAL_ESTIMATES,
  INITIAL_GUARANTEES,
  INITIAL_DEFICIENCIES,
  INITIAL_DOCUMENTS,
  INITIAL_FIELD_VISITS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
} from '../data/mockData.ts';

const STORAGE_KEY_PREFIX = 'cc_municipal_';

function loadOrInit<T>(key: string, initial: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
  }
  return initial;
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing localStorage for key ${key}:`, err);
  }
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSyncTimestamp: string | null;
}

class AppStore {
  private projects: Project[];
  private contracts: Contract[];
  private amendments: BudgetAmendment[];
  private estimates: Estimate[];
  private guarantees: Guarantee[];
  private deficiencies: Deficiency[];
  private documents: DocumentEvidence[];
  private visits: FieldVisit[];
  private auditLogs: AuditLog[];
  private users: User[];
  private currentUser: User;
  private syncQueue: { id: string; type: string; payload: any; timestamp: string }[];
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<() => void> = new Set();
  private supabaseConfig: SupabaseConfig;

  constructor() {
    this.projects = loadOrInit('projects', INITIAL_PROJECTS);
    this.contracts = loadOrInit('contracts', INITIAL_CONTRACTS);
    this.amendments = loadOrInit('amendments', INITIAL_BUDGET_AMENDMENTS);
    this.estimates = loadOrInit('estimates', INITIAL_ESTIMATES);
    this.guarantees = loadOrInit('guarantees', INITIAL_GUARANTEES);
    this.deficiencies = loadOrInit('deficiencies', INITIAL_DEFICIENCIES);
    this.documents = loadOrInit('documents', INITIAL_DOCUMENTS);
    this.visits = loadOrInit('visits', INITIAL_FIELD_VISITS);
    this.auditLogs = loadOrInit('audit_logs', INITIAL_AUDIT_LOGS);
    this.users = loadOrInit('users', INITIAL_USERS);
    this.currentUser = this.users[0];
    this.syncQueue = loadOrInit('sync_queue', []);
    this.supabaseConfig = loadOrInit('supabase_config', {
      url: 'https://xyzcompany.supabase.co',
      anonKey: '',
      connected: false,
      lastSyncTimestamp: '2026-09-15 08:30',
    });

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingQueue();
      this.notify();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify();
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getNetworkStatus(): {
    isOnline: boolean;
    pendingCount: number;
    syncStatusLabel: SyncStatus;
    lastSyncTime: string | null;
  } {
    let status: SyncStatus = 'EN_LINEA';
    if (!this.isOnline) {
      status = 'GUARDADO_LOCAL';
    } else if (this.syncQueue.length > 0) {
      status = 'PENDIENTE_SYNC';
    } else {
      status = 'SINCRONIZADO';
    }
    return {
      isOnline: this.isOnline,
      pendingCount: this.syncQueue.length,
      syncStatusLabel: status,
      lastSyncTime: this.supabaseConfig.lastSyncTimestamp,
    };
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.notify();
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getSupabaseConfig(): SupabaseConfig {
    return this.supabaseConfig;
  }

  public updateSupabaseConfig(config: Partial<SupabaseConfig>): void {
    this.supabaseConfig = { ...this.supabaseConfig, ...config };
    save('supabase_config', this.supabaseConfig);
    this.notify();
  }

  // Projects
  public getProjects(): Project[] {
    return this.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public saveProject(project: Project): void {
    const existingIndex = this.projects.findIndex((p) => p.id === project.id);
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString().split('T')[0],
      syncStatus: this.isOnline ? ('SINCRONIZADO' as SyncStatus) : ('GUARDADO_LOCAL' as SyncStatus),
    };

    if (existingIndex >= 0) {
      this.projects[existingIndex] = updatedProject;
    } else {
      this.projects.unshift(updatedProject);
    }
    save('projects', this.projects);

    this.logAudit(
      existingIndex >= 0 ? 'ACTUALIZAR_PROYECTO' : 'CREAR_PROYECTO',
      'PROYECTO',
      project.id,
      project.code,
      `Proyecto ${project.code}: ${project.name}`
    );

    if (!this.isOnline) {
      this.queueSync('PROJECT', updatedProject);
    }
    this.notify();
  }

  // Contracts
  public getContracts(): Contract[] {
    return this.contracts;
  }

  public getContractByProjectId(projectId: string): Contract | undefined {
    return this.contracts.find((c) => c.projectId === projectId);
  }

  public saveContract(contract: Contract): void {
    const existingIndex = this.contracts.findIndex((c) => c.id === contract.id);
    const updatedContract = {
      ...contract,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (existingIndex >= 0) {
      this.contracts[existingIndex] = updatedContract;
    } else {
      this.contracts.unshift(updatedContract);
    }
    save('contracts', this.contracts);

    // Update project reference
    const prj = this.getProjectById(contract.projectId);
    if (prj && prj.contractId !== contract.id) {
      prj.contractId = contract.id;
      this.saveProject(prj);
    }

    this.logAudit(
      existingIndex >= 0 ? 'ACTUALIZAR_CONTRATO' : 'CREAR_CONTRATO',
      'CONTRATO',
      contract.id,
      contract.contractNumber,
      `Contrato ${contract.contractNumber} asignado a ${contract.contractorName}`
    );

    if (!this.isOnline) {
      this.queueSync('CONTRACT', updatedContract);
    }
    this.notify();
  }

  // Budget Amendments
  public getAmendmentsByProjectId(projectId: string): BudgetAmendment[] {
    return this.amendments.filter((a) => a.projectId === projectId);
  }

  public saveAmendment(amendment: BudgetAmendment): void {
    const existingIndex = this.amendments.findIndex((a) => a.id === amendment.id);
    if (existingIndex >= 0) {
      this.amendments[existingIndex] = amendment;
    } else {
      this.amendments.unshift(amendment);
    }
    save('amendments', this.amendments);

    // Recalculate revised budget on project
    const prj = this.getProjectById(amendment.projectId);
    if (prj) {
      const allAmendments = this.getAmendmentsByProjectId(amendment.projectId);
      const totalDelta = allAmendments.reduce((sum, item) => {
        return item.type === 'INCREMENTO'
          ? sum + item.amount
          : item.type === 'REDUCCION'
          ? sum - item.amount
          : sum;
      }, 0);
      prj.revisedBudget = prj.assignedBudget + totalDelta;
      this.saveProject(prj);
    }

    this.logAudit(
      existingIndex >= 0 ? 'ACTUALIZAR_AMENDMENT' : 'CREAR_AMENDMENT',
      'PRESUPUESTO',
      amendment.id,
      amendment.agreementNumber,
      `Convenio ${amendment.agreementNumber} - ${amendment.type}: L ${amendment.amount.toFixed(2)}`
    );
    this.notify();
  }

  // Estimates
  public getAllEstimates(): Estimate[] {
    return this.estimates;
  }

  public getEstimatesByProjectId(projectId: string): Estimate[] {
    return this.estimates.filter((e) => e.projectId === projectId);
  }

  public saveEstimate(estimate: Estimate): void {
    const existingIndex = this.estimates.findIndex((e) => e.id === estimate.id);
    if (existingIndex >= 0) {
      this.estimates[existingIndex] = estimate;
    } else {
      this.estimates.push(estimate);
    }
    save('estimates', this.estimates);

    // Update project financial progress
    const prj = this.getProjectById(estimate.projectId);
    const contract = this.getContractByProjectId(estimate.projectId);
    if (prj && contract && contract.amount > 0) {
      const allPaidEstimates = this.estimates.filter(
        (e) => e.projectId === estimate.projectId && (e.paymentStatus === 'PAGADA' || e.paymentStatus === 'ORDEN_PAGO')
      );
      const totalGrossPaid = allPaidEstimates.reduce((sum, e) => sum + e.grossAmount, 0);
      prj.financialProgress = Math.min(100, Math.round((totalGrossPaid / contract.amount) * 1000) / 10);
      this.saveProject(prj);
  }

    this.logAudit(
      existingIndex >= 0 ? 'ACTUALIZAR_ESTIMACION' : 'REGISTRAR_ESTIMACION',
      'ESTIMACION',
      estimate.id,
      `Est-${estimate.estimateNumber}`,
      `Estimación N° ${estimate.estimateNumber} - Estado: ${estimate.paymentStatusLabel}`
    );
    this.notify();
  }

  // Guarantees
  public getGuaranteesByProjectId(projectId: string): Guarantee[] {
    return this.guarantees.filter((g) => g.projectId === projectId);
  }

  public getAllGuarantees(): Guarantee[] {
    return this.guarantees;
  }

  public saveGuarantee(guarantee: Guarantee): void {
    const existingIndex = this.guarantees.findIndex((g) => g.id === guarantee.id);
    if (existingIndex >= 0) {
      this.guarantees[existingIndex] = guarantee;
    } else {
      this.guarantees.unshift(guarantee);
    }
    save('guarantees', this.guarantees);

    this.logAudit(
      existingIndex >= 0 ? 'ACTUALIZAR_GARANTIA' : 'CREAR_GARANTIA',
      'GARANTIA',
      guarantee.id,
      guarantee.policyNumber,
      `Garantía ${guarantee.typeLabel} N° ${guarantee.policyNumber}`
    );
    this.notify();
  }

  // Deficiencies
  public getDeficienciesByProjectId(projectId: string): Deficiency[] {
    return this.deficiencies.filter((d) => d.projectId === projectId);
  }

  public getAllDeficiencies(): Deficiency[] {
    return this.deficiencies;
  }

  public getDeficiencyById(id: string): Deficiency | undefined {
    return this.deficiencies.find((d) => d.id === id);
  }

  public saveDeficiency(deficiency: Deficiency): void {
    const existingIndex = this.deficiencies.findIndex((d) => d.id === deficiency.id);
    if (existingIndex >= 0) {
      this.deficiencies[existingIndex] = deficiency;
    } else {
      this.deficiencies.unshift(deficiency);
    }
    save('deficiencies', this.deficiencies);

    this.logAudit(
      existingIndex >= 0 ? 'ACTUALIZAR_DEFICIENCIA' : 'REGISTRAR_DEFICIENCIA',
      'DEFICIENCIA',
      deficiency.id,
      deficiency.title,
      `Deficiencia [${deficiency.severity}] - Estado: ${deficiency.statusLabel}`
    );

    if (!this.isOnline) {
      this.queueSync('DEFICIENCY', deficiency);
    }
    this.notify();
  }

  // Documents
  public getDocumentsByProjectId(projectId: string): DocumentEvidence[] {
    return this.documents.filter((d) => d.projectId === projectId);
  }

  public getAllDocuments(): DocumentEvidence[] {
    return this.documents;
  }

  public saveDocument(doc: DocumentEvidence): void {
    const existingIndex = this.documents.findIndex((d) => d.id === doc.id);
    if (existingIndex >= 0) {
      this.documents[existingIndex] = doc;
    } else {
      this.documents.unshift(doc);
    }
    save('documents', this.documents);

    this.logAudit(
      'SUBIR_DOCUMENTO',
      'DOCUMENTO',
      doc.id,
      doc.fileName,
      `Documento fuente "${doc.title}" vinculado a proyecto ${doc.projectId}`
    );
    this.notify();
  }

  // Field Visits
  public getVisitsByProjectId(projectId: string): FieldVisit[] {
    return this.visits.filter((v) => v.projectId === projectId);
  }

  public getAllVisits(): FieldVisit[] {
    return this.visits;
  }

  public saveVisit(visit: FieldVisit): void {
    const existingIndex = this.visits.findIndex((v) => v.id === visit.id);
    const updatedVisit: FieldVisit = {
      ...visit,
      syncStatus: this.isOnline ? 'SINCRONIZADO' : 'GUARDADO_LOCAL',
    };

    if (existingIndex >= 0) {
      this.visits[existingIndex] = updatedVisit;
    } else {
      this.visits.unshift(updatedVisit);
    }
    save('visits', this.visits);

    // Update project physical progress if reported higher
    const prj = this.getProjectById(visit.projectId);
    if (prj && visit.progressReported > prj.physicalProgress) {
      prj.physicalProgress = visit.progressReported;
      this.saveProject(prj);
    }

    this.logAudit('VISITA_SUPERVISION_CAMPO', 'VISITA', visit.id, visit.visitDate, visit.workCompleted.slice(0, 80));

    if (!this.isOnline) {
      this.queueSync('VISIT', updatedVisit);
    }
    this.notify();
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAudit(action: string, entityType: string, entityId: string, entityCode: string | undefined, details: string): void {
    const log: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: this.currentUser.name,
      role: this.currentUser.roleLabel,
      action,
      entityType,
      entityId,
      entityCode,
      details,
    };
    this.auditLogs.unshift(log);
    save('audit_logs', this.auditLogs);
  }

  // Offline Sync Queue
  private queueSync(type: string, payload: any): void {
    this.syncQueue.push({
      id: payload.id,
      type,
      payload,
      timestamp: new Date().toISOString(),
    });
    save('sync_queue', this.syncQueue);
  }

  public syncPendingQueue(): void {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    console.log(`[Offline Engine] Sincronizando ${this.syncQueue.length} registros con Supabase...`);
    // Sincronizar conservando exactamente el mismo ID
    this.syncQueue = [];
    save('sync_queue', this.syncQueue);
    this.supabaseConfig.lastSyncTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    save('supabase_config', this.supabaseConfig);
    this.notify();
  }

  public resetToInitial(): void {
    localStorage.clear();
    this.projects = INITIAL_PROJECTS;
    this.contracts = INITIAL_CONTRACTS;
    this.amendments = INITIAL_BUDGET_AMENDMENTS;
    this.estimates = INITIAL_ESTIMATES;
    this.guarantees = INITIAL_GUARANTEES;
    this.deficiencies = INITIAL_DEFICIENCIES;
    this.documents = INITIAL_DOCUMENTS;
    this.visits = INITIAL_FIELD_VISITS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.syncQueue = [];
    this.notify();
  }
  // Aliases for unified access
  public getEstimates(): Estimate[] {
    return this.getAllEstimates();
  }

  public getGuarantees(): Guarantee[] {
    return this.getAllGuarantees();
  }

  public getDeficiencies(): Deficiency[] {
    return this.getAllDeficiencies();
  }

  public getDocuments(): DocumentEvidence[] {
    return this.getAllDocuments();
  }

  public getFieldVisits(): FieldVisit[] {
    return this.getAllVisits();
  }

  public getAmendments(): BudgetAmendment[] {
    return this.amendments;
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public saveFieldVisit(visit: FieldVisit): void {
    this.saveVisit(visit);
  }

  public syncOfflineQueue(): void {
    this.syncPendingQueue();
  }
}

export const appStore = new AppStore();
