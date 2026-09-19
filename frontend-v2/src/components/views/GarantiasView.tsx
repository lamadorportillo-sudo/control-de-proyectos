import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, Plus, AlertTriangle, ArrowRight, X, Save } from 'lucide-react';
import type { Guarantee, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';
import { dataRepository } from '../../services/backendAdapter.ts';

interface GarantiasViewProps {
  guarantees: Guarantee[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onSaved?: () => Promise<void> | void;
  initialAction?: string | null;
  initialProjectId?: string | null;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-amber-500';

export const GarantiasView: React.FC<GarantiasViewProps> = ({ guarantees, projects, onOpenProject, onSaved, initialAction = null, initialProjectId = null }) => {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId:'', type:'CUMPLIMIENTO' as Guarantee['type'], policyNumber:'', issuer:'', amount:'',
    issueDate:'', expiryDate:'', documentRef:''
  });

  useEffect(() => {
    if (initialAction === 'NEW_GUARANTEE') setShowCreate(true);
    if (initialProjectId) setForm((current) => ({ ...current, projectId: initialProjectId }));
  }, [initialAction, initialProjectId]);

  const q = norm(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return guarantees.filter((guarantee) => {
      const project = projects.find((p) => p.id === guarantee.projectId);
      return norm([project?.code, project?.name, guarantee.typeLabel, guarantee.policyNumber, guarantee.issuer, guarantee.statusLabel].filter(Boolean).join(' ')).includes(q);
    }).slice(0, 60);
  }, [guarantees, projects, q]);

  const saveGuarantee = async () => {
    const amount = Number(form.amount) || 0;
    if (!form.projectId || !form.issueDate || !form.expiryDate || amount <= 0) {
      setMessage('Completa proyecto, monto, fecha de emisión y fecha de vencimiento.');
      return;
    }
    if (form.expiryDate < form.issueDate) {
      setMessage('La fecha de vencimiento no puede ser anterior a la fecha de emisión.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const end = new Date(form.expiryDate + 'T12:00:00');
      const daysToExpiry = Math.ceil((end.getTime() - Date.now()) / 86400000);
      const status: Guarantee['status'] = daysToExpiry < 0 ? 'VENCIDA' : daysToExpiry <= 30 ? 'POR_VENCER' : 'VIGENTE';
      const typeLabel =
        form.type === 'ANTICIPO' ? 'Anticipo' :
        form.type === 'CALIDAD_OBRA' ? 'Calidad de obra' :
        form.type === 'MANTENIMIENTO_OFERTA' ? 'Mantenimiento de oferta' : 'Cumplimiento';

      const record: Guarantee = {
        id: crypto.randomUUID(),
        projectId: form.projectId,
        type: form.type,
        typeLabel,
        issuer: form.issuer.trim(),
        policyNumber: form.policyNumber.trim(),
        amount,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        daysToExpiry,
        status,
        statusLabel: status.replaceAll('_',' '),
        sourceDocumentId: form.documentRef.trim() || undefined,
      };

      await dataRepository.saveGuarantee(record);
      await onSaved?.();
      setMessage('Garantía guardada correctamente.');
      setShowCreate(false);
      setForm({projectId:'',type:'CUMPLIMIENTO',policyNumber:'',issuer:'',amount:'',issueDate:'',expiryDate:'',documentRef:''});
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
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><ShieldCheck className="h-5 w-5 text-amber-400" />Garantías y pólizas</h2>
          <p className="mt-1 text-xs text-slate-400">Busca únicamente la garantía que necesitas; no se muestran todas al entrar.</p>
        </div>
        <button onClick={()=>{setShowCreate(true);setMessage('');}} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500"><Plus className="h-4 w-4" />Nueva garantía</button>
      </div>

      {message && <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">{message}</div>}

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Proyecto, póliza, tipo, emisor o estado…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500" /></div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length} coincidencia(s).`}</div>
      </div>

      <div className="space-y-3">
        {results.map((guarantee) => {
          const project = projects.find((p) => p.id === guarantee.projectId);
          const warning = guarantee.status === 'VENCIDA' || guarantee.status === 'POR_VENCER';
          return (
            <button key={guarantee.id} onClick={() => onOpenProject(guarantee.projectId)} className={`group w-full rounded-xl border p-4 text-left ${warning ? 'border-amber-800/60 bg-amber-950/20' : 'border-[#1f2e45] bg-[#111827] hover:border-amber-700'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-[#172235] px-2 py-0.5 text-xs font-bold text-white">{guarantee.typeLabel}</span><span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${warning ? 'bg-amber-900/60 text-amber-200' : 'bg-emerald-950 text-emerald-300'}`}>{guarantee.statusLabel}</span>{warning && <AlertTriangle className="h-4 w-4 text-amber-400" />}</div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{project?.code} · {project?.name || 'Proyecto'}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Póliza" value={guarantee.policyNumber || 'No registrada'} /><Metric label="Emisor" value={guarantee.issuer || 'No registrado'} /><Metric label="Monto" value={formatLempiras(guarantee.amount)} /><Metric label="Vence" value={formatDateSpanish(guarantee.expiryDate)} /></div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-amber-400" />
              </div>
            </button>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Nueva garantía">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#243247] bg-[#111827] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#243247] bg-[#111827] px-4 py-3">
              <div><div className="text-sm font-bold text-white">Registrar garantía</div><div className="text-[10px] text-slate-500">Guardado protegido por Auth y RLS del proyecto.</div></div>
              <button onClick={()=>setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4"/></button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <Field label="Proyecto" wide><select value={form.projectId} onChange={(e)=>setForm({...form,projectId:e.target.value})} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
              <Field label="Tipo"><select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value as Guarantee['type']})} className={inputClass}><option value="CUMPLIMIENTO">Cumplimiento</option><option value="ANTICIPO">Anticipo</option><option value="CALIDAD_OBRA">Calidad de obra</option><option value="MANTENIMIENTO_OFERTA">Mantenimiento de oferta</option></select></Field>
              <Field label="Número de póliza"><input value={form.policyNumber} onChange={(e)=>setForm({...form,policyNumber:e.target.value})} className={inputClass}/></Field>
              <Field label="Emisor"><input value={form.issuer} onChange={(e)=>setForm({...form,issuer:e.target.value})} className={inputClass}/></Field>
              <Field label="Monto"><input type="number" min="0" step="0.01" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} className={inputClass}/></Field>
              <Field label="Fecha de emisión"><input type="date" value={form.issueDate} onChange={(e)=>setForm({...form,issueDate:e.target.value})} className={inputClass}/></Field>
              <Field label="Fecha de vencimiento"><input type="date" value={form.expiryDate} onChange={(e)=>setForm({...form,expiryDate:e.target.value})} className={inputClass}/></Field>
              <Field label="Referencia documento"><input value={form.documentRef} onChange={(e)=>setForm({...form,documentRef:e.target.value})} className={inputClass}/></Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#243247] p-4">
              <button onClick={()=>setShowCreate(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button onClick={()=>void saveGuarantee()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{saving?'Guardando…':'Guardar garantía'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2"><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-[11px] font-semibold text-slate-200 tabular-nums">{value}</div></div>;
