import React, { useMemo, useState } from 'react';
import { AlertOctagon, Search, ArrowRight, Plus, MapPin } from 'lucide-react';
import type { Deficiency, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';

interface DeficienciasViewProps {
  deficiencies: Deficiency[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const DeficienciasView: React.FC<DeficienciasViewProps> = ({ deficiencies, projects, onOpenProject }) => {
  const [query, setQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
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

  const severityClass = (severity: Deficiency['severity']) => {
    if (severity === 'BLOQUEANTE') return 'bg-red-950 text-red-200 border-red-800';
    if (severity === 'GRAVE') return 'bg-orange-950 text-orange-200 border-orange-800';
    if (severity === 'MODERADA') return 'bg-amber-950 text-amber-200 border-amber-800';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><AlertOctagon className="h-5 w-5 text-red-400" />Deficiencias y seguimiento</h2>
          <p className="mt-1 text-xs text-slate-400">Cada registro conduce al expediente donde está el problema. Sin tarjetas duplicadas ni rutas que abren lo mismo.</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-500"><Plus className="h-4 w-4" />Registrar deficiencia</button>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar problema, ubicación, proyecto o severidad…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-500" /></div>
          <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="accent-red-500" />Solo abiertas</label>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">{results.length} registro(s) visibles.</div>
      </div>

      <div className="space-y-3">
        {results.map((deficiency) => {
          const project = projects.find((p) => p.id === deficiency.projectId);
          return (
            <button key={deficiency.id} onClick={() => onOpenProject(deficiency.projectId)} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-red-800/70 hover:bg-[#151923]">
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
    </div>
  );
};
