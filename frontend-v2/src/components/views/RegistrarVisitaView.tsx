
import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Save, MapPin } from 'lucide-react';
import type { Project } from '../../types.ts';
import { saveVisitWithEvidence, visitWritesEnabled } from '../../services/visitWriteService.ts';

interface Props { projects: Project[]; initialProjectId?: string | null; onBack: () => void; }
interface Draft {
  id: string; projectId: string; date: string; time: string; location: string;
  observedProgress: number; previousProgress: number; workObserved: string;
  activities: string[]; photoNames: string[]; audioName?: string;
  hasIncident: boolean; incidentDescription?: string; instruction?: string;
  responsible?: string; deadline?: string; savedAt?: string;
}

const KEY = 'cc_field_visit_drafts_v2';
const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500';

export const RegistrarVisitaView: React.FC<Props> = ({ projects, initialProjectId = null, onBack }) => {
  const now = new Date();
  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState('');
  const [saved, setSaved] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    id: crypto.randomUUID(), projectId: initialProjectId || '', date: now.toISOString().slice(0,10),
    time: now.toTimeString().slice(0,5),
    location: projects.find((p) => p.id === initialProjectId)?.location || '',
    observedProgress: projects.find((p) => p.id === initialProjectId)?.physicalProgress || 0,
    previousProgress: projects.find((p) => p.id === initialProjectId)?.physicalProgress || 0,
    workObserved: '', activities: [], photoNames: [], hasIncident: false
  });

  const project = useMemo(() => projects.find((p) => p.id === draft.projectId), [projects, draft.projectId]);
  const variation = draft.observedProgress - draft.previousProgress;
  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const addActivity = () => {
    const value = activity.trim();
    if (!value) return;
    update({ activities: [...draft.activities, value] });
    setActivity('');
  };

  const saveLocal = () => {
    let current: Draft[] = [];
    try { current = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
    const savedDraft = { ...draft, savedAt: new Date().toISOString() };
    const next = [savedDraft, ...current.filter((item) => item.id !== draft.id)].slice(0,25);
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved('Borrador guardado localmente con el mismo ID para sincronización posterior.');
  };

  const saveProduction = async () => {
    if (!visitWritesEnabled) return;
    if (!navigator.onLine) {
      saveLocal();
      setSaved('Sin conexión. La visita quedó guardada localmente y conserva el mismo ID.');
      return;
    }
    setSaving(true);
    setSaved('');
    try {
      const result = await saveVisitWithEvidence({
        id: draft.id,
        projectId: draft.projectId,
        date: draft.date,
        time: draft.time,
        location: draft.location,
        observedProgress: draft.observedProgress,
        previousProgress: draft.previousProgress,
        workObserved: draft.workObserved,
        activities: draft.activities,
        hasIncident: draft.hasIncident,
        incidentDescription: draft.incidentDescription,
        instruction: draft.instruction,
        responsible: draft.responsible,
        deadline: draft.deadline,
      }, photoFiles, audioFile);
      setSaved('Visita sincronizada con Supabase. Evidencias registradas: ' + String(result.evidenceCount) + (result.warning ? ' · ' + result.warning : ''));
    } catch (error: any) {
      setSaved('No se pudo sincronizar: ' + String(error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  const canNext = step === 1
    ? Boolean(draft.projectId && draft.date && draft.time)
    : step === 2
      ? Boolean(draft.workObserved.trim() || draft.activities.length)
      : true;

  const labels = ['Datos y avance','Trabajo realizado','Incidencias','Revisar y guardar'];

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5"/>Volver a visitas</button>
          <h2 className="text-xl font-bold text-white">Registrar visita de obra</h2>
          <p className="mt-1 text-xs text-slate-400">Flujo oficial de 5 pasos. El borrador local conserva un único ID.</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${visitWritesEnabled ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300' : 'border-amber-800/60 bg-amber-950/30 text-amber-300'}`}>{visitWritesEnabled ? 'Sincronización habilitada' : 'Pendiente de sincronización'}</span>
      </div>

      <div className="grid grid-cols-5 gap-1 rounded-xl border border-[#1f2e45] bg-[#111827] p-2">
        {labels.map((label,index) => {
          const n=index+1; const active=n===step; const complete=n<step;
          return <button key={label} onClick={() => setStep(n)} className={active ? 'rounded-lg bg-blue-600 px-2 py-2 text-left text-white' : complete ? 'rounded-lg bg-emerald-950/40 px-2 py-2 text-left text-emerald-300' : 'rounded-lg px-2 py-2 text-left text-slate-500 hover:bg-[#172235]'}>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase">{complete ? <Check className="h-3 w-3"/> : <span>{n}</span>}<span className="hidden sm:inline">{label}</span></div>
          </button>;
        })}
      </div>

      <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 md:p-5">
        {step === 1 && <div className="space-y-4">
          <Title n={1} text="Datos y avance"/>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Proyecto" wide><select value={draft.projectId} onChange={(e) => {
              const id=e.target.value; const p=projects.find((item)=>item.id===id);
              update({ projectId:id, location:draft.location || p?.location || '', previousProgress:p?.physicalProgress || 0, observedProgress:p?.physicalProgress || 0 });
            }} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map((p)=><option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
            <Field label="Ubicación"><div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/><input value={draft.location} onChange={(e)=>update({location:e.target.value})} className={inputClass + ' pl-9'}/></div></Field>
            <Field label="Fecha"><input type="date" value={draft.date} onChange={(e)=>update({date:e.target.value})} className={inputClass}/></Field>
            <Field label="Hora"><input type="time" value={draft.time} onChange={(e)=>update({time:e.target.value})} className={inputClass}/></Field>
            <Field label="Avance observado (%)"><input type="number" min="0" max="100" step="0.1" value={draft.observedProgress} onChange={(e)=>update({observedProgress:Number(e.target.value)})} className={inputClass}/></Field>
            <Field label="Avance anterior (%)"><input type="number" min="0" max="100" step="0.1" value={draft.previousProgress} onChange={(e)=>update({previousProgress:Number(e.target.value)})} className={inputClass}/></Field>
          </div>
          <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3 text-xs text-slate-400">Variación observada: <strong className={variation >= 0 ? 'text-emerald-300' : 'text-red-300'}>{variation >= 0 ? '+' : ''}{variation.toFixed(1)}%</strong></div>
        </div>}

        {step === 2 && <div className="space-y-4">
          <Title n={2} text="Trabajo realizado"/>
          <Field label="Trabajos observados"><textarea rows={5} value={draft.workObserved} onChange={(e)=>update({workObserved:e.target.value})} className={inputClass} placeholder="Describe únicamente lo observado en la visita."/></Field>
          <Field label="Actividades verificadas"><div className="flex gap-2"><input value={activity} onChange={(e)=>setActivity(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();addActivity();}}} className={inputClass}/><button onClick={addActivity} className="rounded-lg bg-blue-600 px-3 text-white"><Plus className="h-4 w-4"/></button></div></Field>
          <div className="space-y-2">{draft.activities.map((item,index)=><div key={item + index} className="flex items-center justify-between rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-slate-300"><span>{item}</span><button onClick={()=>update({activities:draft.activities.filter((_,i)=>i!==index)})} className="text-red-300">Quitar</button></div>)}</div>
        </div>}

        {step === 3 && <div className="space-y-4">
          <Title n={3} text="Incidencias"/>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200"><input type="checkbox" checked={draft.hasIncident} onChange={(e)=>update({hasIncident:e.target.checked})}/>Registrar incidencia o deficiencia observada</label>
          {draft.hasIncident && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Problema observado" wide><textarea rows={4} value={draft.incidentDescription || ''} onChange={(e)=>update({incidentDescription:e.target.value})} className={inputClass}/></Field>
            <Field label="Instrucción del supervisor" wide><textarea rows={3} value={draft.instruction || ''} onChange={(e)=>update({instruction:e.target.value})} className={inputClass}/></Field>
            <Field label="Responsable"><input value={draft.responsible || ''} onChange={(e)=>update({responsible:e.target.value})} className={inputClass}/></Field>
            <Field label="Fecha límite"><input type="date" value={draft.deadline || ''} onChange={(e)=>update({deadline:e.target.value})} className={inputClass}/></Field>
            <div className="md:col-span-2 rounded-lg border border-amber-800/50 bg-amber-950/20 p-3 text-xs text-amber-200">Estado inicial automático: <strong>Pendiente</strong>. Corregida no significa cerrada; verificación y cierre son acciones separadas.</div>
          </div>}
        </div>}

        {step === 4 && <div className="space-y-4">
          <Title n={4} text="Revisar y guardar"/>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Summary label="Proyecto" value={project ? project.code + ' · ' + project.name : 'Sin proyecto'}/>
            <Summary label="Fecha / hora" value={draft.date + ' · ' + draft.time}/>
            <Summary label="Avance observado" value={draft.observedProgress.toFixed(1) + '%'}/>
            <Summary label="Variación" value={(variation >= 0 ? '+' : '') + variation.toFixed(1) + '%'}/>
            <Summary label="Actividades" value={String(draft.activities.length)}/>
            <Summary label="Incidencia" value={draft.hasIncident ? 'Sí · Pendiente' : 'No'}/>
            <Summary label="ID del registro" value={draft.id}/>
          </div>
          {!visitWritesEnabled && <div className="rounded-lg border border-amber-800/60 bg-amber-950/20 p-3 text-xs text-amber-200">La escritura productiva está preparada pero permanece desactivada en este preview. El borrador local sí está disponible.</div>}
          {saved && <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-3 text-xs text-emerald-300">{saved}</div>}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button onClick={saveLocal} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#334155] bg-[#172235] px-4 py-2 text-xs font-semibold text-slate-200"><Save className="h-4 w-4"/>Guardar borrador local</button>
            <button
              disabled={!visitWritesEnabled || saving || !draft.projectId}
              onClick={() => void saveProduction()}
              title={visitWritesEnabled ? 'Guardar visita en Supabase usando el mismo ID del borrador.' : 'Escritura productiva desactivada hasta validar el preview.'}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-600/40 disabled:text-blue-200 disabled:opacity-60"
            ><Check className="h-4 w-4"/>{saving ? 'Guardando…' : 'Guardar visita'}</button>
          </div>
        </div>}
      </section>

      <div className="flex items-center justify-between">
        <button disabled={step===1} onClick={()=>setStep((s)=>Math.max(1,s-1))} className="inline-flex items-center gap-1 rounded-lg border border-[#243247] px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5"/>Anterior</button>
        {step < 4 && <button disabled={!canNext} onClick={()=>setStep((s)=>Math.min(4,s+1))} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Siguiente<ArrowRight className="h-3.5 w-3.5"/></button>}
      </div>
    </div>
  );
};

const Title: React.FC<{n:number;text:string}> = ({n,text}) => <div className="flex items-center gap-2 border-b border-[#1f2e45] pb-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{n}</span><h3 className="text-sm font-bold text-white">{text}</h3></div>;
const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'md:col-span-2' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
const Summary: React.FC<{label:string;value:string}> = ({label,value}) => <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 break-words text-xs font-semibold text-slate-200">{value}</div></div>;
