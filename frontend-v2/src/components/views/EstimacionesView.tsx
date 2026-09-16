import React, { useMemo, useState } from 'react';
import { Receipt, Search, Plus, ArrowRight } from 'lucide-react';
import type { Estimate, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';

interface EstimacionesViewProps {
  estimates: Estimate[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const EstimacionesView: React.FC<EstimacionesViewProps> = ({ estimates, projects, onOpenProject }) => {
  const [query, setQuery] = useState('');
  const q = norm(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return estimates.filter((estimate) => {
      const project = projects.find((p) => p.id === estimate.projectId);
      const text = [project?.code, project?.name, estimate.estimateNumber, estimate.paymentReference, estimate.paymentStatusLabel].filter(Boolean).join(' ');
      return norm(text).includes(q);
    }).slice(0, 60);
  }, [estimates, projects, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Receipt className="h-5 w-5 text-emerald-400" />Estimaciones y pagos</h2>
          <p className="mt-1 text-xs text-slate-400">Búsqueda directa por proyecto, número de estimación o referencia de pago.</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-500" title="Se habilitará tras validar la escritura productiva"><Plus className="h-4 w-4" />Nueva estimación</button>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej.: 0322, Estimación 1, orden de pago…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500" /></div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length} coincidencia(s).`}</div>
      </div>

      <div className="space-y-3">
        {results.map((estimate) => {
          const project = projects.find((p) => p.id === estimate.projectId);
          const totalDeductions = Math.max(0, estimate.grossAmount - estimate.netPayable);
          return (
            <button key={estimate.id} onClick={() => onOpenProject(estimate.projectId)} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-emerald-700 hover:bg-[#131d2f]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-300">Estimación N.º {estimate.estimateNumber}</span><span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{estimate.paymentStatusLabel}</span></div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{project?.code} · {project?.name || 'Proyecto'}</h3>
                  <div className="mt-1 text-[11px] text-slate-500">Periodo: {formatDateSpanish(estimate.periodStart)} – {formatDateSpanish(estimate.periodEnd)}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Bruto" value={formatLempiras(estimate.grossAmount)} /><Metric label="Deducciones" value={formatLempiras(totalDeductions)} /><Metric label="Neto" value={formatLempiras(estimate.netPayable)} accent /><Metric label="Referencia" value={estimate.paymentReference || 'Pendiente'} /></div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-emerald-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2"><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className={`mt-1 text-[11px] font-semibold tabular-nums ${accent ? 'text-emerald-300' : 'text-slate-200'}`}>{value}</div></div>;
