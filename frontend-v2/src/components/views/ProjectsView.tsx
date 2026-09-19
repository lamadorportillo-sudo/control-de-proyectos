import React, { useEffect, useMemo, useState } from 'react';
import { Search, FolderGit2, MapPin, ArrowRight, Plus, X, Save } from 'lucide-react';
import type { Project, ProjectStatus } from '../../types.ts';
import { formatLempiras, formatPercent } from '../../services/calculationService.ts';
import { dataRepository } from '../../services/backendAdapter.ts';
import { matchesSearch } from '../../services/searchService.ts';

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onSaved?: () => Promise<void> | void;
  initialQuery?: string;
  initialAction?: string | null;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const inputClass = 'w-full rounded-lg border border-[#2b3a4a] bg-[#0b1118] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#c5a367]';

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onSaved,
  initialQuery = '',
  initialAction = null,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showCreate, setShowCreate] = useState(initialAction === 'NEW_PROJECT');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    code:'',
    planningCode:'',
    executionCode:'',
    name:'',
    shortName:'',
    location:'',
    community:'',
    status:'PLANIFICACION' as ProjectStatus,
    assignedBudget:'',
    fundingSource:'',
    startDate:'',
    endDate:'',
    responsibleUnit:'Unidad de Proyectos',
    responsiblePerson:'',
    description:'',
  });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialAction === 'NEW_PROJECT') setShowCreate(true);
  }, [initialAction]);

  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) return [];
    return projects
      .map((project) => {
        const haystack = normalize([
          project.code,
          project.planningCode,
          project.executionCode,
          project.name,
          project.shortName,
          project.location,
          project.community,
          project.statusLabel,
        ].filter(Boolean).join(' '));
        let score = 0;
        if (normalize(project.code) === normalizedQuery) score += 200;
        if (haystack.startsWith(normalizedQuery)) score += 80;
        for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
          if (haystack.includes(token)) score += 15;
          if (normalize(project.name).includes(token)) score += 8;
        }
        const values = [
          project.code,
          project.planningCode,
          project.executionCode,
          project.name,
          project.shortName,
          project.location,
          project.community,
          project.statusLabel,
        ];
        if (!matchesSearch(normalizedQuery, values)) return { project, score: 0 };
        return { project, score: Math.max(score, 1) };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name))
      .slice(0, 40)
      .map((item) => item.project);
  }, [projects, normalizedQuery]);

  const saveProject = async () => {
    const budget = Math.max(0, Number(form.assignedBudget) || 0);
    if (!form.code.trim() || !form.name.trim()) {
      setMessage('Código y nombre del proyecto son obligatorios.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const statusLabel =
        form.status === 'EN_EJECUCION' ? 'En ejecución' :
        form.status === 'SUSPENDIDO' ? 'Suspendido' :
        form.status === 'RECEPCION_PROVISIONAL' ? 'Recepción provisional' :
        form.status === 'FINALIZADO' ? 'Finalizado' : 'Planificación';

      const record: Project = {
        id: crypto.randomUUID(),
        code: form.code.trim(),
        planningCode: form.planningCode.trim() || undefined,
        executionCode: form.executionCode.trim() || undefined,
        name: form.name.trim(),
        shortName: form.shortName.trim() || form.name.trim(),
        location: form.location.trim(),
        community: form.community.trim(),
        status: form.status,
        statusLabel,
        physicalProgress: 0,
        financialProgress: 0,
        responsibleUnit: form.responsibleUnit.trim() || 'Unidad de Proyectos',
        responsiblePerson: form.responsiblePerson.trim(),
        assignedBudget: budget,
        revisedBudget: budget,
        fundingSource: form.fundingSource.trim() || 'Por registrar',
        startDate: form.startDate,
        expectedEndDate: form.endDate,
        description: form.description.trim(),
        createdAt: new Date().toISOString().slice(0,10),
        updatedAt: new Date().toISOString().slice(0,10),
        syncStatus: 'SINCRONIZADO',
      };

      await dataRepository.saveProject(record);
      await onSaved?.();
      setMessage('Proyecto registrado correctamente.');
      setShowCreate(false);
      setForm({
        code:'',planningCode:'',executionCode:'',name:'',shortName:'',location:'',community:'',
        status:'PLANIFICACION',assignedBudget:'',fundingSource:'',startDate:'',endDate:'',
        responsibleUnit:'Unidad de Proyectos',responsiblePerson:'',description:''
      });
    } catch (error:any) {
      setMessage('No se pudo guardar: ' + String(error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <FolderGit2 className="h-5 w-5 text-[#c5a367]" />
            Proyectos
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Busca por código, nombre, ubicación o comunidad. No se cargan todos los expedientes en pantalla al entrar.
          </p>
        </div>
        <button onClick={()=>{setShowCreate(true);setMessage('');}} className="inline-flex items-center gap-2 self-start rounded-lg bg-[#c5a367] px-3 py-2 text-xs font-semibold text-[#0b1118] hover:bg-[#d4b779]">
          <Plus className="h-4 w-4" /> Nuevo proyecto
        </button>
      </div>

      {message && <div className="rounded-lg border border-[#2b3a4a] bg-[#151e29] p-3 text-xs text-slate-300">{message}</div>}

      <div role="search" className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-4 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej.: 0322, COT121706-2026, pavimento colegio, Arenalitos…"
            className="w-full rounded-lg border border-[#2b3a4a] bg-[#0b1118] py-2.5 pl-9 pr-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#c5a367]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#8f9fb1] hover:bg-[#1b2735] hover:text-[#f3f6fa]"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {normalizedQuery.length < 2 ? 'Escribe al menos 2 caracteres para buscar.' : `${results.length} coincidencia(s) encontrada(s).`}
        </div>
      </div>

      {normalizedQuery.length >= 2 && results.length === 0 && (
        <div className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-6 text-center text-sm text-slate-400">
          No encontré proyectos que coincidan con “{query}”.
        </div>
      )}

      <div className="space-y-3">
        {results.map((project) => (
          <button
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            className="group w-full rounded-xl border border-[#2b3a4a] bg-[#151e29] p-4 text-left transition hover:border-[#c5a367] hover:bg-[#1b2735]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#3a3020] px-2 py-0.5 font-mono text-xs font-bold text-[#f1e4c5]">{project.code || 'SIN CÓDIGO'}</span>
                  <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{project.statusLabel}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{project.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location || 'Ubicación pendiente'}</span>
                  <span>Presupuesto: <strong className="text-slate-200">{formatLempiras(project.revisedBudget || project.assignedBudget)}</strong></span>
                  <span>Avance físico: <strong className="text-slate-200">{formatPercent(project.physicalProgress)}</strong></span>
                </div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-[#c5a367]" />
            </div>
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Nuevo proyecto">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#2b3a4a] bg-[#151e29] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#2b3a4a] bg-[#151e29] px-4 py-3">
              <div><div className="text-sm font-bold text-white">Nuevo proyecto</div><div className="text-[10px] text-slate-500">Registro productivo protegido por Auth y RLS.</div></div>
              <button onClick={()=>setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4"/></button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Código"><input value={form.code} onChange={(e)=>setForm({...form,code:e.target.value})} className={inputClass}/></Field>
              <Field label="Código planificación"><input value={form.planningCode} onChange={(e)=>setForm({...form,planningCode:e.target.value})} className={inputClass}/></Field>
              <Field label="Código ejecución"><input value={form.executionCode} onChange={(e)=>setForm({...form,executionCode:e.target.value})} className={inputClass}/></Field>
              <Field label="Nombre" wide><input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className={inputClass}/></Field>
              <Field label="Nombre corto"><input value={form.shortName} onChange={(e)=>setForm({...form,shortName:e.target.value})} className={inputClass}/></Field>
              <Field label="Estado"><select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value as ProjectStatus})} className={inputClass}><option value="PLANIFICACION">Planificación</option><option value="EN_EJECUCION">En ejecución</option><option value="SUSPENDIDO">Suspendido</option><option value="RECEPCION_PROVISIONAL">Recepción provisional</option><option value="FINALIZADO">Finalizado</option></select></Field>
              <Field label="Ubicación"><input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} className={inputClass}/></Field>
              <Field label="Comunidad / barrio"><input value={form.community} onChange={(e)=>setForm({...form,community:e.target.value})} className={inputClass}/></Field>
              <Field label="Presupuesto inicial"><input type="number" min="0" step="0.01" value={form.assignedBudget} onChange={(e)=>setForm({...form,assignedBudget:e.target.value})} className={inputClass}/></Field>
              <Field label="Fuente de financiamiento"><input value={form.fundingSource} onChange={(e)=>setForm({...form,fundingSource:e.target.value})} className={inputClass}/></Field>
              <Field label="Fecha inicio"><input type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} className={inputClass}/></Field>
              <Field label="Fecha prevista final"><input type="date" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} className={inputClass}/></Field>
              <Field label="Unidad responsable"><input value={form.responsibleUnit} onChange={(e)=>setForm({...form,responsibleUnit:e.target.value})} className={inputClass}/></Field>
              <Field label="Responsable"><input value={form.responsiblePerson} onChange={(e)=>setForm({...form,responsiblePerson:e.target.value})} className={inputClass}/></Field>
              <Field label="Descripción" wide><textarea rows={4} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className={inputClass}/></Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#2b3a4a] p-4">
              <button onClick={()=>setShowCreate(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button onClick={()=>void saveProject()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#c5a367] px-4 py-2 text-xs font-semibold text-[#0b1118] disabled:opacity-50"><Save className="h-4 w-4"/>{saving?'Guardando…':'Guardar proyecto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'sm:col-span-2 lg:col-span-3' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
