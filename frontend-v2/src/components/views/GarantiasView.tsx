import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, Plus, AlertTriangle, ArrowRight, X, Save, Pencil, History, RefreshCw } from 'lucide-react';
import type { Guarantee, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';
import { dataRepository } from '../../services/backendAdapter.ts';
import { matchesSearch, normalizeSearch } from '../../services/searchService.ts';
import { getGuaranteeAttention } from '../../services/guaranteeLifecycleService.ts';

interface GarantiasViewProps {
  guarantees: Guarantee[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenProjectTab?: (projectId: string, tab: string) => void;
  onSaved?: () => Promise<void> | void;
  initialAction?: string | null;
  initialProjectId?: string | null;
}

const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-amber-500';
const LOCAL_CACHE_KEY = 'control-contractual:guarantees-cache:v2';

type ProjectFormStatus = 'EN_EJECUCION' | 'FINALIZADO' | 'AMPLIACION_GARANTIAS' | 'SUSPENDIDO';
type FormState = {
  projectId: string;
  type: Guarantee['type'];
  policyNumber: string;
  issuer: string;
  amount: string;
  issueDate: string;
  expiryDate: string;
  status: Guarantee['status'];
  observations: string;
  projectStatus: ProjectFormStatus;
  projectObservations: string;
  replacesId: string;
};

const emptyForm: FormState = {
  projectId: '',
  type: 'CUMPLIMIENTO',
  policyNumber: '',
  issuer: '',
  amount: '',
  issueDate: '',
  expiryDate: '',
  status: 'VIGENTE',
  observations: '',
  projectStatus: 'EN_EJECUCION',
  projectObservations: '',
  replacesId: '',
};

const projectStatusOptions: Array<{ value: ProjectFormStatus; label: string }> = [
  { value: 'EN_EJECUCION', label: 'En ejecución' },
  { value: 'FINALIZADO', label: 'Terminado' },
  { value: 'AMPLIACION_GARANTIAS', label: 'Ampliación de garantías' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
];

const guaranteeStatusOptions: Array<{ value: Guarantee['status']; label: string }> = [
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'POR_VENCER', label: 'Por vencer' },
  { value: 'VENCIDA', label: 'Vencida — alerta' },
  { value: 'LIBERADA', label: 'Liberada' },
  { value: 'EJECUTADA', label: 'Ejecutada' },
  { value: 'REEMPLAZADA', label: 'Reemplazada — historial' },
];

const typeLabel = (type: Guarantee['type']) =>
  type === 'ANTICIPO' ? 'Anticipo' :
  type === 'CALIDAD_OBRA' ? 'Calidad de obra' :
  type === 'MANTENIMIENTO_OFERTA' ? 'Mantenimiento de oferta' :
  'Cumplimiento';

const projectStatusLabel = (status: ProjectFormStatus | Project['status']) =>
  status === 'FINALIZADO' ? 'Terminado' :
  status === 'AMPLIACION_GARANTIAS' ? 'Ampliación de garantías' :
  status === 'SUSPENDIDO' ? 'Suspendido' :
  status === 'EN_EJECUCION' ? 'En ejecución' :
  'Planificación';

const readLocalCache = (): Guarantee[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalCache = (items: Guarantee[]) => {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(items.slice(0, 250)));
  } catch {
    // El navegador puede bloquear localStorage; la persistencia principal sigue en el repositorio.
  }
};

export const GarantiasView: React.FC<GarantiasViewProps> = ({
  guarantees,
  projects,
  onOpenProject,
  onOpenProjectTab,
  onSaved,
  initialAction = null,
  initialProjectId = null,
}) => {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [localCache, setLocalCache] = useState<Guarantee[]>(() => readLocalCache());
  const [form, setForm] = useState<FormState>(emptyForm);

  const allGuarantees = useMemo(() => {
    const byId = new Map<string, Guarantee>();
    [...guarantees, ...localCache].forEach((item) => byId.set(item.id, item));
    return [...byId.values()];
  }, [guarantees, localCache]);

  useEffect(() => {
    if (initialProjectId) {
      const project = projects.find((item) => item.id === initialProjectId);
      setForm((current) => ({
        ...current,
        projectId: initialProjectId,
        projectStatus: project?.status === 'SUSPENDIDO' ? 'SUSPENDIDO' : project?.status === 'FINALIZADO' ? 'FINALIZADO' : 'EN_EJECUCION',
        projectObservations: project?.observations || '',
      }));
    }
    if (initialAction === 'NEW_GUARANTEE') openNew(initialProjectId || '');
  }, [initialAction, initialProjectId, projects]);

  const q = normalizeSearch(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return allGuarantees.filter((guarantee) => {
      const project = projects.find((p) => p.id === guarantee.projectId);
      return matchesSearch(q, [
        project?.code,
        project?.name,
        project?.location,
        project?.statusLabel,
        guarantee.typeLabel,
        guarantee.policyNumber,
        guarantee.issuer,
        guarantee.statusLabel,
        guarantee.observations,
      ]);
    }).slice(0, 80);
  }, [allGuarantees, projects, q]);

  const totalGuaranteed = useMemo(() => allGuarantees.reduce((sum, guarantee) => sum + Number(guarantee.amount || 0), 0), [allGuarantees]);
  const attentionCount = useMemo(() => allGuarantees.filter((guarantee) => {
    const project = projects.find((item) => item.id === guarantee.projectId);
    const attention = getGuaranteeAttention(guarantee, project);
    return guarantee.status === 'VENCIDA' || guarantee.status === 'POR_VENCER' || attention.isClosureCandidate;
  }).length, [allGuarantees, projects]);

  function openNew(projectId = '') {
    const project = projects.find((item) => item.id === projectId);
    setEditingId(null);
    setForm({
      ...emptyForm,
      projectId,
      projectStatus: project?.status === 'FINALIZADO' ? 'FINALIZADO' : project?.status === 'SUSPENDIDO' ? 'SUSPENDIDO' : 'EN_EJECUCION',
      projectObservations: project?.observations || '',
    });
    setMessage('');
    setShowForm(true);
  }

  function openEdit(guarantee: Guarantee) {
    const project = projects.find((item) => item.id === guarantee.projectId);
    setEditingId(guarantee.id);
    setForm({
      projectId: guarantee.projectId,
      type: guarantee.type,
      policyNumber: guarantee.policyNumber || '',
      issuer: guarantee.issuer || '',
      amount: String(guarantee.amount ?? ''),
      issueDate: guarantee.issueDate || '',
      expiryDate: guarantee.expiryDate || '',
      status: guarantee.status,
      observations: guarantee.observations || '',
      projectStatus: project?.status === 'FINALIZADO' ? 'FINALIZADO' : project?.status === 'SUSPENDIDO' ? 'SUSPENDIDO' : project?.status === 'AMPLIACION_GARANTIAS' ? 'AMPLIACION_GARANTIAS' : 'EN_EJECUCION',
      projectObservations: project?.observations || '',
      replacesId: '',
    });
    setMessage('');
    setShowForm(true);
  }

  function openExtension(guarantee: Guarantee) {
    const project = projects.find((item) => item.id === guarantee.projectId);
    setEditingId(null);
    setForm({
      ...emptyForm,
      projectId: guarantee.projectId,
      type: guarantee.type,
      issuer: guarantee.issuer || '',
      projectStatus: 'AMPLIACION_GARANTIAS',
      projectObservations: project?.observations || '',
      replacesId: guarantee.id,
    });
    setMessage('');
    setShowForm(true);
  }

  const saveGuarantee = async () => {
    const amount = Number(form.amount) || 0;
    if (!form.projectId || !form.issueDate || !form.expiryDate || amount <= 0 || !form.policyNumber.trim()) {
      setMessage('Completa proyecto, número de póliza, monto y fechas.');
      return;
    }
    if (form.expiryDate < form.issueDate) {
      setMessage('La fecha de vencimiento no puede ser anterior a la fecha de inicio.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const existing = form.replacesId ? allGuarantees.find((item) => item.id === form.replacesId) : undefined;
      if (existing) {
        const replaced: Guarantee = {
          ...existing,
          status: 'REEMPLAZADA',
          statusLabel: 'Reemplazada — historial',
          observations: [existing.observations, 'Reemplazada por una nueva póliza de ampliación.'].filter(Boolean).join(' '),
        };
        await dataRepository.saveGuarantee(replaced);
      }

      const end = new Date(form.expiryDate + 'T12:00:00');
      const daysToExpiry = Math.ceil((end.getTime() - Date.now()) / 86400000);
      const record: Guarantee = {
        id: editingId || crypto.randomUUID(),
        projectId: form.projectId,
        type: form.type,
        typeLabel: typeLabel(form.type),
        issuer: form.issuer.trim(),
        policyNumber: form.policyNumber.trim(),
        amount,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        daysToExpiry,
        status: form.status,
        statusLabel: guaranteeStatusOptions.find((item) => item.value === form.status)?.label || form.status,
        observations: form.observations.trim(),
      };

      const project = projects.find((item) => item.id === form.projectId);
      if (project) {
        await dataRepository.saveProject({
          ...project,
          status: form.projectStatus as Project['status'],
          statusLabel: projectStatusLabel(form.projectStatus),
          observations: form.projectObservations.trim(),
        });
      }

      await dataRepository.saveGuarantee(record);
      const nextCache = [record, ...(existing ? [{
        ...existing,
        status: 'REEMPLAZADA' as Guarantee['status'],
        statusLabel: 'Reemplazada — historial',
        observations: [existing.observations, 'Reemplazada por una nueva póliza de ampliación.'].filter(Boolean).join(' '),
      }] : [])].concat(localCache.filter((item) => item.id !== record.id && item.id !== existing?.id));
      writeLocalCache(nextCache);
      setLocalCache(nextCache);
      await onSaved?.();
      setMessage(editingId ? 'Garantía actualizada correctamente.' : existing ? 'Ampliación registrada. La póliza anterior quedó en el historial.' : 'Garantía guardada correctamente.');
      setShowForm(false);
    } catch (error: any) {
      setMessage('No se pudo guardar: ' + String(error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><ShieldCheck className="h-5 w-5 text-amber-400" />Garantías y pólizas</h2>
          <p className="mt-1 text-xs text-slate-400">Registra pólizas, ampliaciones y estados sin confundir una garantía vencida con el cierre del proyecto.</p>
        </div>
        <button type="button" onClick={() => openNew()} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500"><Plus className="h-4 w-4" />Nueva garantía</button>
      </div>

      {message && <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">{message}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Garantías registradas" value={String(allGuarantees.length)} detail="Pólizas e historial" />
        <Kpi label="Requieren atención" value={String(attentionCount)} detail="Alertas sin cerrar proyecto" />
        <Kpi label="Monto garantizado" value={formatLempiras(totalGuaranteed)} detail="Suma de pólizas registradas" />
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Proyecto, póliza, tipo, emisor, estado u observación…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500" /></div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length} coincidencia(s).`}</div>
      </div>

      {q.length < 2 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center">
          <div className="text-sm font-semibold text-white">{allGuarantees.length === 0 ? 'Aún no hay garantías registradas' : 'Busca una garantía cuando la necesites'}</div>
          <div className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{allGuarantees.length === 0 ? 'Usa “Nueva garantía” para registrar una póliza o una ampliación.' : 'La búsqueda muestra la póliza actual y el historial de reemplazos.'}</div>
        </div>
      )}

      {q.length >= 2 && results.length === 0 && <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center text-xs text-slate-500">No encontramos garantías con esa búsqueda.</div>}

      <div className="space-y-3">
        {results.map((guarantee) => {
          const project = projects.find((p) => p.id === guarantee.projectId);
          const attention = getGuaranteeAttention(guarantee, project);
          const alert = guarantee.status === 'VENCIDA' || guarantee.status === 'POR_VENCER';
          const history = guarantee.status === 'REEMPLAZADA';
          return (
            <div key={guarantee.id} className={`rounded-xl border p-4 ${history ? 'border-slate-700 bg-[#0d1623]' : alert ? 'border-amber-800/60 bg-amber-950/20' : 'border-[#1f2e45] bg-[#111827]'}`}>
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => (onOpenProjectTab ? onOpenProjectTab(guarantee.projectId, 'garantias') : onOpenProject(guarantee.projectId))} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-[#172235] px-2 py-0.5 text-xs font-bold text-white">{guarantee.typeLabel}</span><span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${history ? 'bg-slate-800 text-slate-300' : alert ? 'bg-amber-900/60 text-amber-200' : 'bg-emerald-950 text-emerald-300'}`}>{guarantee.statusLabel}</span>{alert && <AlertTriangle className="h-4 w-4 text-amber-400" />}</div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{project?.code} · {project?.name || 'Proyecto'}</h3>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => openEdit(guarantee)} className="inline-flex items-center gap-1 rounded-lg border border-[#334155] px-2 py-1 text-[11px] font-semibold text-blue-300 hover:bg-[#172235]"><Pencil className="h-3 w-3" />Editar garantía</button>
                  {guarantee.status !== 'REEMPLAZADA' && <button type="button" onClick={() => openExtension(guarantee)} className="inline-flex items-center gap-1 rounded-lg border border-amber-700/60 px-2 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-950/50"><RefreshCw className="h-3 w-3" />Nueva garantía</button>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Póliza" value={guarantee.policyNumber || 'No registrada'} /><Metric label="Emisor" value={guarantee.issuer || 'No registrado'} /><Metric label="Monto" value={formatLempiras(guarantee.amount)} /><Metric label="Vence" value={formatDateSpanish(guarantee.expiryDate)} /></div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2 text-[11px] text-slate-300"><span className="font-semibold text-slate-500">Proyecto: </span>{projectStatusLabel((project?.status || 'EN_EJECUCION') as Project['status'])}</div>
                <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2 text-[11px] text-slate-300"><span className="font-semibold text-slate-500">Observaciones: </span>{guarantee.observations || project?.observations || 'Sin observaciones registradas.'}</div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#243247] pt-3">
                <span className={alert ? 'text-[11px] font-semibold text-amber-300' : 'text-[11px] text-slate-400'}>{alert ? `${attention.label}: ${attention.detail}` : history ? 'Póliza conservada como historial.' : attention.label}</span>
                <button type="button" onClick={() => (onOpenProjectTab ? onOpenProjectTab(guarantee.projectId, 'garantias') : onOpenProject(guarantee.projectId))} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 hover:text-white">Abrir seguimiento <ArrowRight className="h-3 w-3" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar garantía' : 'Nueva garantía'}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#243247] bg-[#111827] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#243247] bg-[#111827] px-4 py-3">
              <div><div className="text-sm font-bold text-white">{editingId ? 'Editar garantía' : form.replacesId ? 'Registrar ampliación de garantía' : 'Registrar garantía'}</div><div className="text-[10px] text-slate-500">La póliza anterior se conserva como historial cuando hay ampliación.</div></div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <Field label="Proyecto" wide><select value={form.projectId} onChange={(e) => {
                const id = e.target.value;
                const project = projects.find((item) => item.id === id);
                setForm((current) => ({ ...current, projectId: id, projectStatus: project?.status === 'FINALIZADO' ? 'FINALIZADO' : project?.status === 'SUSPENDIDO' ? 'SUSPENDIDO' : 'EN_EJECUCION', projectObservations: project?.observations || '' }));
              }} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
              <Field label="Estado del proyecto"><select value={form.projectStatus} onChange={(e) => setForm({ ...form, projectStatus: e.target.value as ProjectFormStatus })} className={inputClass}>{projectStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Observaciones del proyecto" wide><textarea rows={3} value={form.projectObservations} onChange={(e) => setForm({ ...form, projectObservations: e.target.value })} className={inputClass} placeholder="Anota si está en ampliación, suspendido, terminado o requiere revisión." /></Field>
              <Field label="Tipo de garantía"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Guarantee['type'] })} className={inputClass}><option value="CUMPLIMIENTO">Cumplimiento</option><option value="ANTICIPO">Anticipo</option><option value="CALIDAD_OBRA">Calidad de obra</option><option value="MANTENIMIENTO_OFERTA">Mantenimiento de oferta</option></select></Field>
              <Field label="Estado de la garantía"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Guarantee['status'] })} className={inputClass}>{guaranteeStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Número de póliza"><input value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} className={inputClass} /></Field>
              <Field label="Emisor"><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} className={inputClass} /></Field>
              <Field label="Monto"><input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} /></Field>
              <Field label="Fecha de inicio"><input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className={inputClass} /></Field>
              <Field label="Fecha de vencimiento"><input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className={inputClass} /></Field>
              <Field label="Observaciones de la garantía" wide><textarea rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className={inputClass} placeholder="Condiciones, ampliación, revisión o cierre." /></Field>
            </div>

            {form.status === 'VENCIDA' && <div className="mx-4 mb-3 rounded-lg border border-amber-800/60 bg-amber-950/25 p-3 text-xs text-amber-200"><AlertTriangle className="mr-1 inline h-4 w-4" />La póliza está vencida y queda como alerta. Esto no cambia automáticamente el proyecto a terminado.</div>}

            <div className="flex justify-end gap-2 border-t border-[#243247] p-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button type="button" onClick={() => void saveGuarantee()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Guardando…' : editingId ? 'Actualizar garantía' : 'Guardar garantía'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => (
  <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3.5">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-base font-bold text-white tabular-nums">{value}</div>
    <div className="mt-0.5 text-[11px] text-slate-500">{detail}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; wide?: boolean }> = ({ label, children, wide }) => <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2"><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-[11px] font-semibold text-slate-200 tabular-nums">{value}</div></div>;
