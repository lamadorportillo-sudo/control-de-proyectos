/**
 * ADAPTADOR DE INTEGRACIÓN PRODUCTIVA — CONTROL CONTRACTUAL
 * Desacopla la interfaz V2 del almacenamiento y reutiliza la sesión productiva existente.
 */

import {
  Project,
  Contract,
  Estimate,
  Guarantee,
  Deficiency,
  DocumentEvidence,
  FieldVisit,
  AuditLog,
  User,
} from '../types.ts';
import { appStore } from './storageService.ts';
import { hasSupabaseConfig, ensureSupabaseSession } from './supabaseClient.ts';
import { SupabaseDataRepository } from './supabaseRepository.ts';

export interface IDataRepository {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  saveProject(project: Project): Promise<void>;

  getContracts(): Promise<Contract[]>;
  getContractByProjectId(projectId: string): Promise<Contract | undefined>;
  saveContract(contract: Contract): Promise<void>;

  getEstimates(projectId?: string): Promise<Estimate[]>;
  saveEstimate(estimate: Estimate): Promise<void>;

  getGuarantees(contractId?: string): Promise<Guarantee[]>;
  saveGuarantee(guarantee: Guarantee): Promise<void>;

  getDeficiencies(projectId?: string): Promise<Deficiency[]>;
  saveDeficiency(deficiency: Deficiency): Promise<void>;

  getDocuments(projectId?: string): Promise<DocumentEvidence[]>;
  saveDocument(doc: DocumentEvidence): Promise<void>;

  getFieldVisits(projectId?: string): Promise<FieldVisit[]>;
  saveFieldVisit(visit: FieldVisit): Promise<void>;

  getAuditLogs(): Promise<AuditLog[]>;
  logAction(action: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;
}

export interface IAuthAdapter {
  getCurrentUser(): User;
  isAuthenticated(): boolean;
  getToken(): string | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

export interface ITelegramAdapter {
  isAvailable(): boolean;
  getInitData(): string | null;
  getTelegramUser(): { id: number; first_name: string; username?: string } | null;
  sendDataToBot(data: object): void;
  closeMiniApp(): void;
  expandMiniApp(): void;
}

export class LocalDataRepository implements IDataRepository {
  async getProjects(): Promise<Project[]> {
    return appStore.getProjects();
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return appStore.getProjectById(id);
  }

  async saveProject(project: Project): Promise<void> {
    appStore.saveProject(project);
  }

  async getContracts(): Promise<Contract[]> {
    return appStore.getContracts();
  }

  async getContractByProjectId(projectId: string): Promise<Contract | undefined> {
    return appStore.getContractByProjectId(projectId);
  }

  async saveContract(contract: Contract): Promise<void> {
    appStore.saveContract(contract);
  }

  async getEstimates(projectId?: string): Promise<Estimate[]> {
    const all = appStore.getAllEstimates();
    return projectId ? all.filter((e) => e.projectId === projectId) : all;
  }

  async saveEstimate(estimate: Estimate): Promise<void> {
    appStore.saveEstimate(estimate);
  }

  async getGuarantees(contractId?: string): Promise<Guarantee[]> {
    const all = appStore.getAllGuarantees();
    return contractId ? all.filter((g) => g.contractId === contractId) : all;
  }

  async saveGuarantee(guarantee: Guarantee): Promise<void> {
    appStore.saveGuarantee(guarantee);
  }

  async getDeficiencies(projectId?: string): Promise<Deficiency[]> {
    const all = appStore.getAllDeficiencies();
    return projectId ? all.filter((d) => d.projectId === projectId) : all;
  }

  async saveDeficiency(deficiency: Deficiency): Promise<void> {
    appStore.saveDeficiency(deficiency);
  }

  async getDocuments(projectId?: string): Promise<DocumentEvidence[]> {
    const all = appStore.getAllDocuments();
    return projectId ? all.filter((d) => d.projectId === projectId) : all;
  }

  async saveDocument(doc: DocumentEvidence): Promise<void> {
    appStore.saveDocument(doc);
  }

  async getFieldVisits(projectId?: string): Promise<FieldVisit[]> {
    const all = appStore.getAllVisits();
    return projectId ? all.filter((v) => v.projectId === projectId) : all;
  }

  async saveFieldVisit(visit: FieldVisit): Promise<void> {
    appStore.saveVisit(visit);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return appStore.getAuditLogs();
  }

  async logAction(action: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    appStore.logAudit(
      action.action,
      action.entityType,
      action.entityId,
      action.entityCode,
      action.details
    );
  }
}

export const telegramAdapter: ITelegramAdapter = {
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
  },

  getInitData(): string | null {
    if (!this.isAvailable()) return null;
    return (window as any).Telegram.WebApp.initData || null;
  },

  getTelegramUser() {
    if (!this.isAvailable()) return null;
    return (window as any).Telegram.WebApp.initDataUnsafe?.user || null;
  },

  sendDataToBot(data: object): void {
    if (this.isAvailable()) {
      (window as any).Telegram.WebApp.sendData(JSON.stringify(data));
    }
  },

  closeMiniApp(): void {
    if (this.isAvailable()) {
      (window as any).Telegram.WebApp.close();
    }
  },

  expandMiniApp(): void {
    if (this.isAvailable()) {
      (window as any).Telegram.WebApp.expand();
    }
  },
};

function sessionAwareRepository(repository: IDataRepository): IDataRepository {
  return new Proxy(repository, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value !== 'function') return value;
      return async (...args: unknown[]) => {
        await ensureSupabaseSession();
        return value.apply(target, args);
      };
    },
  }) as IDataRepository;
}

export const dataRepository: IDataRepository = hasSupabaseConfig
  ? sessionAwareRepository(new SupabaseDataRepository())
  : new LocalDataRepository();
