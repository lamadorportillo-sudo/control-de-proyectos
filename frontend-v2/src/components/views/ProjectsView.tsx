import React, { useMemo, useState } from 'react';
import { Search, FolderGit2, MapPin, ArrowRight, Plus } from 'lucide-react';
import type { Project } from '../../types.ts';
import { formatLempiras, formatPercent } from '../../services/calculationService.ts';

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProject?: () => void;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onOpenProject, onNewProject }) => {
  const [query, setQuery] = useState('');
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
        return { project, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name))
      .slice(0, 40)
      .map((item) => item.project);
  }, [projects, normalizedQuery]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <FolderGit2 className="h-5 w-5 text-blue-400" />
            Proyectos
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Busca por código, nombre, ubicación o comunidad. No se cargan todos los expedientes en pantalla al entrar.
          </p>
        </div>
        {onNewProject && (
          <button onClick={onNewProject} className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
            <Plus className="h-4 w-4" /> Nuevo proyecto
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej.: 0322, COT121706-2026, pavimento colegio, Arenalitos…"
            className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {normalizedQuery.length < 2 ? 'Escribe al menos 2 caracteres para buscar.' : `${results.length} coincidencia(s) encontrada(s).`}
        </div>
      </div>

      {normalizedQuery.length >= 2 && results.length === 0 && (
        <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-6 text-center text-sm text-slate-400">
          No encontré proyectos que coincidan con “{query}”.
        </div>
      )}

      <div className="space-y-3">
        {results.map((project) => (
          <button
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left transition hover:border-blue-700 hover:bg-[#131d2f]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-blue-950/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">{project.code || 'SIN CÓDIGO'}</span>
                  <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{project.statusLabel}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{project.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location || 'Ubicación pendiente'}</span>
                  <span>Presupuesto: <strong className="text-slate-200">{formatLempiras(project.revisedBudget || project.assignedBudget)}</strong></span>
                  <span>Avance físico: <strong className="text-slate-200">{formatPercent(project.physicalProgress)}</strong></span>
                </div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-blue-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
