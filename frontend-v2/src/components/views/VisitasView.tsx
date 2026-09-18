import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Search, Camera, ArrowRight, Plus, MapPin } from 'lucide-react';
import type { FieldVisit, Project } from '../../types.ts';
import { formatDateSpanish, formatPercent } from '../../services/calculationService.ts';

interface Props {
  visits: FieldVisit[];
  projects: Project[];
  onOpenVisit: (visitId: string) => void;
  onNewVisit: () => void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export const VisitasView: React.FC<Props> = ({ visits, projects, onOpenVisit, onNewVisit }) => {
  const [query, setQuery] = useState('');
  const q = norm(query.trim());

  const filtered = useMemo(() => visits.filter((visit) => {
    if (!q) return true;
    const project = projects.find((p) => p.id === visit.projectId);
    return norm([
      project?.code, project?.name, project?.shortName, project?.location,
      visit.inspectorName, visit.workCompleted, visit.visitDate
    ].filter(Boolean).join(' ')).includes(q);
  }).slice(0,100), [visits, projects, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><ClipboardCheck className="h-5 w-5 text-amber-400"/>Visitas de obra</h2>
          <p className="mt-1 text-xs text-slate-400">Listado cronológico de supervisión. La evidencia se abre dentro de cada visita, no como galería general.</p>
        </div>
        <button onClick={onNewVisit} className="inline-flex items-center gap-2 self-start rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"><Plus className="h-4 w-4"/>Registrar visita</button>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar proyecto, código, inspector o trabajo observado…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500"/></div>
        <div className="mt-2 text-[11px] text-slate-500">{filtered.length} visita(s) visible(s).</div>
      </div>

      <div className="space-y-2">
        {filtered.map((visit) => {
          const project = projects.find((p) => p.id === visit.projectId);
          return (
            <button key={visit.id} onClick={()=>onOpenVisit(visit.id)} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-amber-800/70 hover:bg-[#151c26]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">{formatDateSpanish(visit.visitDate)}</span>
                    <span className="font-mono text-[10px] text-blue-300">{project?.code}</span>
                    <span className="text-[10px] text-slate-500">Avance {formatPercent(visit.progressReported)}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{project?.name || 'Proyecto no identificado'}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{visit.workCompleted || 'Sin resumen de trabajos.'}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span>Inspector: {visit.inspectorName || 'No registrado'}</span>
                    <span className="inline-flex items-center gap-1"><Camera className="h-3 w-3"/>{visit.photoUrls.length} evidencia(s)</span>
                    {visit.gpsCoords && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3"/>GPS registrado</span>}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-amber-400"/>
              </div>
            </button>
          );
        })}
        {filtered.length===0 && <div className="rounded-xl border border-dashed border-[#243247] p-10 text-center text-sm text-slate-500">No hay visitas que coincidan con la búsqueda.</div>}
      </div>
    </div>
  );
};
