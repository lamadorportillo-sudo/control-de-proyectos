import React, { useMemo, useState } from 'react';
import { ShieldCheck, Search, Plus, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Guarantee, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';

interface GarantiasViewProps {
  guarantees: Guarantee[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const GarantiasView: React.FC<GarantiasViewProps> = ({ guarantees, projects, onOpenProject }) => {
  const [query, setQuery] = useState('');
  const q = norm(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return guarantees.filter((guarantee) => {
      const project = projects.find((p) => p.id === guarantee.projectId);
      return norm([project?.code, project?.name, guarantee.typeLabel, guarantee.policyNumber, guarantee.issuer, guarantee.statusLabel].filter(Boolean).join(' ')).includes(q);
    }).slice(0, 60);
  }, [guarantees, projects, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><ShieldCheck className="h-5 w-5 text-amber-400" />Garantías y pólizas</h2>
          <p className="mt-1 text-xs text-slate-400">Busca únicamente la garantía que necesitas; no se muestran todas al entrar.</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-500"><Plus className="h-4 w-4" />Nueva garantía</button>
      </div>

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
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2"><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-[11px] font-semibold text-slate-200 tabular-nums">{value}</div></div>;
