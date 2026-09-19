import React, { useEffect, useMemo, useState } from 'react';
import { Receipt, Search, Plus, ArrowRight, X, Save, AlertTriangle } from 'lucide-react';
import type { Estimate, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';
import { dataRepository } from '../../services/backendAdapter.ts';
import { matchesSearch, normalizeSearch } from '../../services/searchService.ts';

interface EstimacionesViewProps {
  estimates: Estimate[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenProjectTab?: (projectId: string, tab: string) => void;
  onSaved?: () => Promise<void> | void;
  initialAction?: string | null;
  initialProjectId?: string | null;
}

const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-emerald-500';

export const EstimacionesView: React.FC<EstimacionesViewProps> = ({ estimates, projects, onOpenProject, onOpenProjectTab, onSaved, initialAction = null, initialProjectId = null }) => {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId:'', estimateNumber:'1', periodStart:'', periodEnd:'', physicalPeriod:'0', physicalCumulative:'0',
    gross:'', advance:'0', isr:'0', compliance:'0', quality:'0', other:'0', notes:''
  });

  useEffect(() => {
    if (initialAction === 'NEW_ESTIMATE') setShowCreate(true);
    if (initialProjectId) setForm((current) => ({ ...current, projectId: initialProjectId }));
  }, [initialAction, initialProjectId]);

  const q = normalizeSearch(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return estimates.filter((estimate) => {
      const project = projects.find((p) => p.id === estimate.projectId);
      const text = [project?.code, project?.name, estimate.estimateNumber, estimate.paymentReference, estimate.paymentStatusLabel].filter(Boolean).join(' ');
      return matchesSearch(q, [text]);
    }).slice(0, 60);
  }, [estimates, projects, q]);

  const totalNet = useMemo(() => estimates.reduce((sum, estimate) => sum + Number(estimate.netPayable || 0), 0), [estimates]);
  const pendingReview = useMemo(() => estimates.filter((estimate) => estimate.paymentStatus === 'PENDIENTE_REVISION').length, [estimates]);
  const pendingPayment = useMemo(
    () => estimates.filter((estimate) => estimate.paymentStatus === 'APROBADA' || estimate.paymentStatus === 'ORDEN_PAGO').length,
    [estimates]
  );

  const gross = Math.max(0, Number(form.gross) || 0);
  const advance = Math.max(0, Number(form.advance) || 0);
  const isr = Math.max(0, Number(form.isr) || 0);
  const compliance = Math.max(0, Number(form.compliance) || 0);
  const quality = Math.max(0, Number(form.quality) || 0);
  const other = Math.max(0, Number(form.other) || 0);
  const deductions = advance + isr + compliance + quality + other;
  const net = Math.max(0, gross - deductions);

  const saveEstimate = async () => {
    if (!form.projectId || Number(form.estimateNumber) <= 0 || gross <= 0) {
      setMessage('Selecciona proyecto, número de estimación y monto bruto.');
      return;
    }
    if (deductions > gross) {
      setMessage('Las deducciones no pueden superar el monto bruto.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const record: Estimate = {
        id: crypto.randomUUID(),
        projectId: form.projectId,
        estimateNumber: Number(form.estimateNumber),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        physicalProgressPeriod: Math.max(0, Number(form.physicalPeriod) || 0),
        physicalProgressCumulative: Math.max(0, Number(form.physicalCumulative) || 0),
        grossAmount: gross,
        advanceAmortization: advance,
        isrDeduction: isr,
        complianceRetention: compliance,
        qualityRetention: quality,
        otherDeductions: other,
        netPayable: net,
        paymentStatus: 'PENDIENTE_REVISION',
        paymentStatusLabel: 'Pendiente de revisión',
        remarks: form.notes.trim() || undefined,
        createdAt: new Date().toISOString().slice(0,10),
      };
      await dataRepository.saveEstimate(record);
      await onSaved?.();
      setMessage('Estimación guardada correctamente.');
      setShowCreate(false);
      setForm({projectId:'',estimateNumber:'1',periodStart:'',periodEnd:'',physicalPeriod:'0',physicalCumulative:'0',gross:'',advance:'0',isr:'0',compliance:'0',quality:'0',other:'0',notes:''});
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
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Receipt className="h-5 w-5 text-emerald-400" />Estimaciones y pagos</h2>
          <p className="mt-1 text-xs text-slate-400">Consulta pagos sin cargar listados completos y registra una nueva estimación cuando corresponda.</p>
        </div>
        <button onClick={() => {setShowCreate(true);setMessage('');}} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"><Plus className="h-4 w-4" />Nueva estimación</button>
      </div>

      {message && <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">{message}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Estimaciones registradas" value={String(estimates.length)} detail="Expedientes disponibles" />
        <Kpi label="Pendientes de revisión" value={String(pendingReview)} detail="Requieren validación" />
        <Kpi label="En proceso de pago" value={String(pendingPayment)} detail="Aprobadas u ordenadas" />
        <Kpi label="Total neto registrado" value={formatLempiras(totalNet)} detail="Suma de pagos netos" />
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej.: 0322, Estimación 1, orden de pago…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500" /></div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length} coincidencia(s).`}</div>
      </div>

      {q.length < 2 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center">
          <div className="text-sm font-semibold text-white">{estimates.length === 0 ? 'Aún no hay estimaciones registradas' : 'Busca una estimación cuando la necesites'}</div>
          <div className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{estimates.length === 0 ? 'Usa “Nueva estimación” para registrar periodo, avance, deducciones y total a pagar.' : 'Escribe al menos 2 caracteres para consultar por proyecto, número o referencia de pago.'}</div>
        </div>
      )}

      {q.length >= 2 && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center text-xs text-slate-500">No encontramos estimaciones con esa búsqueda.</div>
      )}

      <div className="space-y-3">
        {results.map((estimate) => {
          const project = projects.find((p) => p.id === estimate.projectId);
          const totalDeductions = Math.max(0, estimate.grossAmount - estimate.netPayable);
          const actionLabel =
            estimate.paymentStatus === 'PENDIENTE_REVISION' ? 'Revisar estimación' :
            estimate.paymentStatus === 'APROBADA' ? 'Preparar orden de pago' :
            estimate.paymentStatus === 'ORDEN_PAGO' ? 'Dar seguimiento al pago' :
            estimate.paymentStatus === 'PAGADA' ? 'Pago completado' :
            'Corregir estimación rechazada';
          const statusTone =
            estimate.paymentStatus === 'PAGADA' ? 'bg-emerald-950 text-emerald-300' :
            estimate.paymentStatus === 'RECHAZADA' ? 'bg-red-950 text-red-300' :
            estimate.paymentStatus === 'PENDIENTE_REVISION' ? 'bg-amber-950 text-amber-300' :
            'bg-[#172235] text-slate-300';
          return (
            <button key={estimate.id} onClick={() => (onOpenProjectTab ? onOpenProjectTab(estimate.projectId, 'estimaciones') : onOpenProject(estimate.projectId))} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-emerald-700 hover:bg-[#131d2f]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-300">Estimación N.º {estimate.estimateNumber}</span><span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${statusTone}`}>{estimate.paymentStatusLabel}</span>{estimate.netPayable > 1000000 && <span className="inline-flex items-center gap-1 rounded bg-amber-950/60 px-2 py-0.5 text-[10px] font-semibold text-amber-300"><AlertTriangle className="h-3 w-3"/>Pago &gt; L 1,000,000</span>}</div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{project?.code} · {project?.name || 'Proyecto'}</h3>
                  <div className="mt-1 text-[11px] text-slate-500">Periodo: {formatDateSpanish(estimate.periodStart)} – {formatDateSpanish(estimate.periodEnd)}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Bruto" value={formatLempiras(estimate.grossAmount)} /><Metric label="Deducciones" value={formatLempiras(totalDeductions)} /><Metric label="Neto" value={formatLempiras(estimate.netPayable)} accent /><Metric label="Referencia" value={estimate.paymentReference || 'Pendiente'} /></div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#243247] pt-3">
                    <span className={estimate.paymentStatus === 'RECHAZADA' ? 'text-[11px] font-semibold text-red-300' : estimate.paymentStatus === 'PAGADA' ? 'text-[11px] font-semibold text-emerald-300' : 'text-[11px] font-semibold text-amber-300'}>{actionLabel}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 group-hover:text-white">Abrir expediente <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-emerald-400" />
              </div>
            </button>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Nueva estimación">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#243247] bg-[#111827] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#243247] bg-[#111827] px-4 py-3">
              <div><div className="text-sm font-bold text-white">Registrar estimación</div><div className="text-[10px] text-slate-500">La V2 conserva montos y deducciones auditables.</div></div>
              <button onClick={()=>setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4"/></button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Proyecto" wide><select value={form.projectId} onChange={(e)=>setForm({...form,projectId:e.target.value})} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
              <Field label="N.º estimación"><input type="number" min="1" value={form.estimateNumber} onChange={(e)=>setForm({...form,estimateNumber:e.target.value})} className={inputClass}/></Field>
              <Field label="Inicio periodo"><input type="date" value={form.periodStart} onChange={(e)=>setForm({...form,periodStart:e.target.value})} className={inputClass}/></Field>
              <Field label="Fin periodo"><input type="date" value={form.periodEnd} onChange={(e)=>setForm({...form,periodEnd:e.target.value})} className={inputClass}/></Field>
              <Field label="Avance periodo (%)"><input type="number" min="0" max="100" step="0.1" value={form.physicalPeriod} onChange={(e)=>setForm({...form,physicalPeriod:e.target.value})} className={inputClass}/></Field>
              <Field label="Avance acumulado (%)"><input type="number" min="0" max="100" step="0.1" value={form.physicalCumulative} onChange={(e)=>setForm({...form,physicalCumulative:e.target.value})} className={inputClass}/></Field>
              <Field label="Monto bruto"><input type="number" min="0" step="0.01" value={form.gross} onChange={(e)=>setForm({...form,gross:e.target.value})} className={inputClass}/></Field>
              <Field label="Anticipo amortizado"><input type="number" min="0" step="0.01" value={form.advance} onChange={(e)=>setForm({...form,advance:e.target.value})} className={inputClass}/></Field>
              <Field label="ISR"><input type="number" min="0" step="0.01" value={form.isr} onChange={(e)=>setForm({...form,isr:e.target.value})} className={inputClass}/></Field>
              <Field label="Cumplimiento"><input type="number" min="0" step="0.01" value={form.compliance} onChange={(e)=>setForm({...form,compliance:e.target.value})} className={inputClass}/></Field>
              <Field label="Calidad"><input type="number" min="0" step="0.01" value={form.quality} onChange={(e)=>setForm({...form,quality:e.target.value})} className={inputClass}/></Field>
              <Field label="Otras deducciones"><input type="number" min="0" step="0.01" value={form.other} onChange={(e)=>setForm({...form,other:e.target.value})} className={inputClass}/></Field>
              <Field label="Notas" wide><textarea rows={3} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className={inputClass}/></Field>
            </div>

            <div className="mx-4 mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Metric label="Monto bruto" value={formatLempiras(gross)} />
              <Metric label="Deducciones" value={formatLempiras(deductions)} />
              <Metric label="TOTAL A PAGAR" value={formatLempiras(net)} accent />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#243247] p-4">
              <button onClick={()=>setShowCreate(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button onClick={()=>void saveEstimate()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{saving?'Guardando…':'Guardar estimación'}</button>
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

const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'sm:col-span-2 lg:col-span-3' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
const Metric: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2"><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className={`mt-1 text-[11px] font-semibold tabular-nums ${accent ? 'text-emerald-300' : 'text-slate-200'}`}>{value}</div></div>;
