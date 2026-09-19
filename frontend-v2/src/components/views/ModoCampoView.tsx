import React, { useMemo, useState } from 'react';
import { Smartphone, Search, Wifi, WifiOff, Camera, MapPin, Plus, ArrowRight } from 'lucide-react';
import type { FieldVisit, Project } from '../../types.ts';
import { formatDateSpanish, formatPercent } from '../../services/calculationService.ts';
import { telegramAdapter } from '../../services/backendAdapter.ts';

interface ModoCampoViewProps {
  visits: FieldVisit[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewVisit: () => void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const ModoCampoView: React.FC<ModoCampoViewProps> = ({ visits, projects, onOpenProject, onNewVisit }) => {
  const [query, setQuery] = useState('');
  const q = norm(query.trim());
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const telegram = telegramAdapter.isAvailable();

  const recent = useMemo(() => {
    return visits
      .filter((visit) => {
        if (!q) return true;
        const project = projects.find((p) => p.id === visit.projectId);
        return norm([project?.code, project?.name, visit.inspectorName, visit.workCompleted].filter(Boolean).join(' ')).includes(q);
      })
      .slice(0, 30);
  }, [visits, projects, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Smartphone className="h-5 w-5 text-amber-400" />Modo campo</h2>
          <p className="mt-1 text-xs text-slate-400">Visitas, evidencia y seguimiento desde obra. Preparado para celular y Telegram sin duplicar expedientes.</p>
        </div>
        <button onClick={onNewVisit} className="inline-flex items-center gap-2 self-start rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"><Plus className="h-4 w-4" />Nueva visita</button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Status label="Conectividad" value={online ? 'En línea' : 'Sin conexión'} icon={online ? Wifi : WifiOff} active={online} />
        <Status label="Telegram Mini App" value={telegram ? 'Detectado' : 'Navegador web'} icon={Smartphone} active={telegram} />
        <Status label="Visitas cargadas" value={String(visits.length)} icon={Camera} active />
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar visita por proyecto, código o actividad…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500" /></div>
      </div>

      {recent.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-8 text-center">
          <div className="text-sm font-semibold text-white">{visits.length === 0 ? 'Modo campo listo para la primera visita' : 'No encontramos visitas con esa búsqueda'}</div>
          <div className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{visits.length === 0 ? 'Registra la visita desde el botón superior para documentar avance, fotografías, GPS y observaciones.' : 'Prueba con el código del proyecto, el nombre o la actividad ejecutada.'}</div>
        </div>
      )}

      <div className="space-y-3">
        {recent.map((visit) => {
          const project = projects.find((p) => p.id === visit.projectId);
          return (
            <button key={visit.id} onClick={() => onOpenProject(visit.projectId)} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-amber-700/70 hover:bg-[#151c26]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">Visita de campo</span><span className="font-mono text-[10px] text-slate-500">{project?.code}</span></div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{project?.name || 'Proyecto'}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{visit.workCompleted || 'Sin resumen registrado.'}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500"><span>{formatDateSpanish(visit.visitDate)}</span><span>Avance: <strong className="text-slate-200">{formatPercent(visit.progressReported)}</strong></span>{visit.gpsCoords && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />GPS registrado</span>}<span>{visit.photoUrls.length} foto(s)</span></div>
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

const Status: React.FC<{ label: string; value: string; icon: React.ComponentType<{ className?: string }>; active: boolean }> = ({ label, value, icon: Icon, active }) => <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3"><div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} /><div><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div><div className="mt-0.5 text-xs font-semibold text-slate-200">{value}</div></div></div></div>;
