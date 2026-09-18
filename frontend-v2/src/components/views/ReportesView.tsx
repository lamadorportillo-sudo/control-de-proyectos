import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Search, RefreshCw, FileText, Eye } from 'lucide-react';
import type { Project } from '../../types.ts';
import { getGeneratedReports, type GeneratedReportRecord } from '../../services/reportService.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';

interface ReportesViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

export const ReportesView: React.FC<ReportesViewProps> = ({ projects, onOpenProject }) => {
  const [records, setRecords] = useState<GeneratedReportRecord[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRecords(await getGeneratedReports());
    } catch (err: any) {
      setError(String(err?.message || 'No se pudieron cargar los reportes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const project = projects.find((p) => p.id === r.projectId);
      return `${r.title} ${r.fileName} ${r.reportType} ${r.lifecycleStatus} ${project?.code || ''} ${project?.name || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [records, projects, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Reportes
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Consulta de reportes realmente generados en el backend productivo. Esta pantalla no fabrica archivos ni registros.
        </p>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar reporte, proyecto, código o formato..."
            className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200">
          <span>{error}</span>
          <button onClick={() => void load()} className="rounded bg-amber-900/50 px-2 py-1 font-semibold">Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-400" /> Cargando reportes...
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((report) => {
            const project = projects.find((p) => p.id === report.projectId);
            return (
              <div key={report.id} className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span className="font-semibold text-white">{report.title}</span>
                      <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">{report.format || 'archivo'}</span>
                      <span className="rounded bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{report.lifecycleStatus}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {project ? `${project.code} · ${project.name} · ` : ''}{formatDateSpanish(report.createdAt)} · v{report.version}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-600">
                      Evidencias: {report.evidenceCount} · Acceso público: {report.publicAccessEnabled ? 'Sí' : 'No'} · Vistas públicas: {report.publicViewCount}
                    </div>
                  </div>

                  {report.projectId && (
                    <button
                      onClick={() => onOpenProject(report.projectId!)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" /> Abrir proyecto
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#243247] p-10 text-center text-sm text-slate-500">
              No hay reportes que coincidan con la búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
