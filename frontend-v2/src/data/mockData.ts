/**
 * Datos temporales de arranque para la UI V2.
 * PRODUCCIÓN: la fuente de verdad es Supabase.
 * Estos arrays permanecen vacíos para evitar mezclar registros DEMO con datos reales.
 */
import type {
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
} from '../types.ts';

export const INITIAL_USERS: User[] = [
  {
    id: 'LOCAL-SESSION',
    name: 'Usuario autenticado',
    role: 'SUPERVISOR',
    roleLabel: 'Supervisor',
    email: '',
    municipalEntity: 'Control Contractual',
  },
];

export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_BUDGET_AMENDMENTS: BudgetAmendment[] = [];
export const INITIAL_ESTIMATES: Estimate[] = [];
export const INITIAL_GUARANTEES: Guarantee[] = [];
export const INITIAL_DEFICIENCIES: Deficiency[] = [];
export const INITIAL_DOCUMENTS: DocumentEvidence[] = [];
export const INITIAL_FIELD_VISITS: FieldVisit[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
