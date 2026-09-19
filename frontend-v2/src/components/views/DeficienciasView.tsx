import React, { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, Search, ArrowRight, Plus, MapPin, X, Save } from 'lucide-react';
import type { Deficiency, DeficiencySeverity, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';
import { dataRepository } from '../../services/backendAdapter.ts';

interface DeficienciasViewProps {
  deficiencies: Deficiency[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenDeficiency: (deficiencyId: string) => void;
  onSaved?: () => Promise<void> | void;
  initialAction?: string | null;
  initialProjectId?: string | null;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-red-500';

export const DeficienciasView: React.FC<DeficienciasViewProps> = ({
  deficiencies,
  projects,
  onOpenProject,
  onOpenDeficiency,
  onSaved,
  initialAction = null,
  initialProjectId = null,
}) => {
  const [query, setQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(initialAction === 'NEW_DEFICIENCY');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId: initialProjectId || '',
    title:'',
    location:'',
    description:'',
    severity:'MODERADA' as DeficiencySeverity,
    responsible:'',
    deadline:'',
  });

  useEffect(() => {
    if (initialAction === 'NEW_DEFICIENCY') setShowCreate(true);
    if (initialProjectId) setForm((current) => ({ ...current, projectId: initialProjectId }));
  }, [initialAction, initialProjectId]);

  const q = norm(query.trim());

  const results = useMemo(() => {
    return deficiencies
      .filter((d) => !onlyOpen || d.status !== 'CERRADA')
      .filter((d) => {
        if (!q) return true;
        const project = projects.find((p) => p.id === d.projectId);
        return norm([d.title, d.description, d.specificLocation, d.severity, d.statusLabel, project?.code, project?.name].filter(Boolean).join(' ')).includes(q);
      })
      .sort((a, b) => {
        const order = { BLOQUEANTE: 4, GRAVE: 3, MODERADA: 2, LEVE: 1 } as const;
        return order[b.severity] - order[a.severity];
      })
      .slice(0, 80);
  }, [deficiencies, projects, onlyOpen, q]);

  const openCount = useMemo(() => deficiencies.filter((item) => item.status !== 'CERRADA').length, [deficiencies]);
  const blockingCount = useMemo(() => deficiencies.filter((item) => item.severity === 'BLOQUEANTE' && item.status !== 'CERRADA').length, [deficiencies]);
  const verifiedCount = useMemo(() => deficiencies.filter((item) => item.status === 'VERIFICADA').length, [deficiencies]);

  const severityClass = (severity: Deficiency['severity']) => {
    if (severity === 'BLOQUEANTE') return 'bg-red-950 text-red-200 border-red-800';
    if (severity === 'GRAVE') return 'bg-orange-950 text-orange-200 border-orange-800';
    if (severity === 'MODERADA') return 'bg-amber-950 text-amber-200 border-amber-800';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const saveDeficiency = async () => {
    if (!form.projectId || !form.title.trim() || !form.description.trim()) {
      setMessage('Selecciona proyecto y completa título y descripción.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const record: Deficiency = {
        id: crypto.randomUUID(),
        projectId: form.projectId,
        title: form.title.trim(),
        specificLocation: form.location.trim(),
        description: form.description.trim(),
        severity: form.severity,
        reportedDate: new Date().toISOString().slice(0,10),
        reportedBy: '',
        responsibleContractor: form.responsible.trim(),
        deadline: form.deadline,
        status: 'ABIERTA',
        statusLabel: 'Abierta',
        isVerified: false,
        evidenceUrls: [],
        history: [],
      };
      await dataRepository.saveDeficiency(record);
      await onSaved?.();
      setMessage('Deficiencia registrada correctamente.');
      setShowCreate(false);
      setForm({projectId:'',title:'',location:'',description:'',severity:'MODERADA',responsible:'',deadline:''});
    } catch (error:any) {
      setMessage('No se pudo guardar: ' + String(error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><AlertOctagon className="h-5 w-5 text-red-400" />Deficiencias y seguimiento</h2>
          <p className="mt-1 text-xs text-slate-400">Cada registro conduce al problema exacto. Corregida no significa cerrada: verificación y cierre son pasos separados.</p>
        </div>
        <button onClick={()=>{setShowCreate(true);setMessage('');}} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"><Plus className="h-4 w-4" />Registrar deficiencia</button>
      </div>

      {message && <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">{message}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Casos abiertos" value={String(openCount)} detail="Requieren seguimiento" />
        <Kpi label="Bloqueantes" value={String(blockingCount)} detail="Prioridad inmediata" />
        <Kpi label="Verificadas" value={String(verifiedCount)} detail="Pendientes de cierre" />
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar problema, ubicación, proyecto o severidad…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-500" /></div>
          <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="accent-red-500" />Solo abiertas</label>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">{results.length} caso(s) visibles. Cada resultado abre su expediente de seguimiento.</div>
      </div>

      {results.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center">
          <div className="text-sm font-semibold text-white">{deficiencies.length === 0 ? 'Aún no hay deficiencias registradas' : q ? 'No encontramos ese problema' : 'No hay casos abiertos visibles'}</div>
          <div className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{deficiencies.length === 0 ? 'Usa “Registrar deficiencia” para crear el primer caso y vincularlo al proyecto correspondiente.' : q ? 'Prueba con el código del proyecto, la ubicación, la severidad o una palabra exacta del problema.' : 'Desactiva “Solo abiertas” para consultar también los casos cerrados.'}</div>
        </div>
      )}

      <div className="space-y-3">
        {results.map((deficiency) => {
          const project = projects.find((p) => p.id === deficiency.projectId);
          return (
            <button key={deficiency.id} onClick={() => onOpenDeficiency(deficiency.id)} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-red-800/70 hover:bg-[#151923]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${severityClass(deficiency.severity)}`}>{deficiency.severity}</span><span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{deficiency.statusLabel}</span></div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{deficiency.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{deficiency.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500"><span>{project?.code} · {project?.name}</span>{deficiency.specificLocation && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{deficiency.specificLocation}</span>}<span>Reportada: {formatDateSpanish(deficiency.reportedDate)}</span></div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-red-400" />
              </div>
            </button>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Registrar deficiencia">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#243247] bg-[#111827] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#243247] bg-[#111827] px-4 py-3">
              <div><div className="text-sm font-bold text-white">Registrar deficiencia</div><div className="text-[10px] text-slate-500">Estado inicial automático: Abierta.</div></div>
              <button onClick={()=>setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4"/></button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <Field label="Proyecto" wide><select value={form.projectId} onChange={(e)=>setForm({...form,projectId:e.target.value})} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
              <Field label="Título" wide><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className={inputClass} placeholder="Problema observado"/></Field>
              <Field label="Ubicación específica"><input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} className={inputClass}/></Field>
              <Field label="Severidad"><select value={form.severity} onChange={(e)=>setForm({...form,severity:e.target.value as DeficiencySeverity})} className={inputClass}><option value="LEVE">Leve</option><option value="MODERADA">Moderada</option><option value="GRAVE">Grave</option><option value="BLOQUEANTE">Bloqueante</option></select></Field>
              <Field label="Descripción" wide><textarea rows={4} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className={inputClass}/></Field>
              <Field label="Responsable"><input value={form.responsible} onChange={(e)=>setForm({...form,responsible:e.target.value})} className={inputClass}/></Field>
              <Field label="Fecha límite"><input type="date" value={form.deadline} onChange={(e)=>setForm({...form,deadline:e.target.value})} className={inputClass}/></Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#243247] p-4">
              <button onClick={()=>setShowCreate(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button onClick={()=>void saveDeficiency()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{saving?'Guardando…':'Guardar deficiencia'}</button>
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

const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
