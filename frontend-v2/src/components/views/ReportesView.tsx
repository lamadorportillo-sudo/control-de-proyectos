import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Search, RefreshCw, FileText, Eye, ExternalLink, Printer, Download, FolderOpen, Pencil } from 'lucide-react';
import type { Project } from '../../types.ts';
import { getGeneratedReports, type GeneratedReportRecord } from '../../services/reportService.ts';
import { formatDateSpanish, formatLempiras } from '../../services/calculationService.ts';
import { downloadUrlFile } from '../../services/evidenceAccessService.ts';

interface ReportesViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onOpenProjectTab?: (projectId: string, tab: string) => void;
}

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const ReportesView: React.FC<ReportesViewProps> = ({ projects, onOpenProject, onOpenProjectTab }) => {
  const [records, setRecords] = useState<GeneratedReportRecord[]>([]);
  const [query, setQuery] = useState('');
  const [projectQuery, setProjectQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

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

  const executionProjects = useMemo(
    () => projects.filter((project) => project.status === 'EN_EJECUCION'),
    [projects]
  );

  const projectMatches = useMemo(() => {
    const q = projectQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return projects.filter((project) => `${project.code} ${project.executionCode || ''} ${project.name} ${project.shortName} ${project.location} ${project.community}`.toLowerCase().includes(q)).slice(0, 12);
  }, [projects, projectQuery]);

  const downloadGeneratedReport = async (report: GeneratedReportRecord) => {
    if (!report.publicUrl) return;
    setDownloadingReportId(report.id);
    setError('');
    try {
      await downloadUrlFile(report.publicUrl, report.fileName || 'reporte');
    } catch (err: any) {
      setError(String(err?.message || 'No fue posible descargar el reporte.'));
    } finally {
      setDownloadingReportId(null);
    }
  };

  const exportExecutionCsv = () => {
    const header = ['Código','Proyecto','Ubicación','Avance físico','Avance financiero','Presupuesto vigente','Fuente'];
    const rows = executionProjects.map((project) => [
      project.code,
      project.name,
      project.location,
      `${project.physicalProgress.toFixed(2)}%`,
      `${project.financialProgress.toFixed(2)}%`,
      project.revisedBudget.toFixed(2),
      project.fundingSource,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_proyectos_en_ejecucion_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printExecutionReport = () => {
    const popup = window.open('', '_blank');
    if (!popup) return;
    try { popup.opener = null; } catch {}

    const rows = executionProjects.map((project) => `
      <tr>
        <td>${escapeHtml(project.code)}</td>
        <td>${escapeHtml(project.name)}</td>
        <td>${escapeHtml(project.location)}</td>
        <td class="num">${escapeHtml(project.physicalProgress.toFixed(2))}%</td>
        <td class="num">${escapeHtml(project.financialProgress.toFixed(2))}%</td>
        <td class="num">${escapeHtml(formatLempiras(project.revisedBudget))}</td>
      </tr>`
    ).join('');

    popup.document.write(`<!doctype html>
      <html lang="es"><head><meta charset="utf-8"><title>Proyectos en ejecución</title>
      <style>
        body{font-family:Arial,sans-serif;color:#111827;margin:28px}
        h1{font-size:20px;margin:0 0 4px}.meta{color:#64748b;font-size:11px;margin-bottom:18px}
        table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #cbd5e1;padding:7px;vertical-align:top}
        th{background:#e2e8f0;text-align:left}.num{text-align:right;white-space:nowrap}
        @page{size: ${paperSize} ${orientation}; margin: 10mm}
        @media print{body{margin:0}}
      </style></head><body>
      <h1>Reporte de proyectos en ejecución</h1>
      <div class="meta">Control Contractual · Generado ${escapeHtml(new Date().toLocaleString('es-HN'))} · ${executionProjects.length} proyecto(s)</div>
      <table><thead><tr><th>Código</th><th>Proyecto</th><th>Ubicación</th><th>Avance físico</th><th>Avance financiero</th><th>Presupuesto vigente</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6">No hay proyectos en ejecución.</td></tr>'}</tbody></table>
      <script>window.onload=()=>window.print();<\/script>
      </body></html>`);
    popup.document.close();
  };

  const exportExecutionWord = () => {
    const rows = executionProjects.map((project) => `
      <tr>
        <td>${escapeHtml(project.code)}</td>
        <td>${escapeHtml(project.name)}</td>
        <td>${escapeHtml(project.location)}</td>
        <td>${escapeHtml(project.physicalProgress.toFixed(2))}%</td>
        <td>${escapeHtml(project.financialProgress.toFixed(2))}%</td>
        <td>${escapeHtml(formatLempiras(project.revisedBudget))}</td>
        <td>${escapeHtml(project.fundingSource)}</td>
      </tr>`
    ).join('');

    const html = `<!doctype html>
      <html lang="es"><head><meta charset="utf-8"><title>Proyectos en ejecución</title>
      <style>
        body{font-family:Arial,sans-serif;color:#111827;margin:28px}
        h1{font-size:20px;margin:0 0 4px}.meta{color:#64748b;font-size:11px;margin-bottom:18px}
        table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #cbd5e1;padding:7px;vertical-align:top}
        th{background:#e2e8f0;text-align:left}
        @page{size: ${paperSize} ${orientation}; margin: 10mm}
      </style></head><body>
      <h1>Reporte de proyectos en ejecución</h1>
      <div class="meta">Control Contractual · Generado ${escapeHtml(new Date().toLocaleString('es-HN'))} · ${executionProjects.length} proyecto(s)</div>
      <table><thead><tr><th>Código</th><th>Proyecto</th><th>Ubicación</th><th>Avance físico</th><th>Avance financiero</th><th>Presupuesto vigente</th><th>Fuente</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7">No hay proyectos en ejecución.</td></tr>'}</tbody></table>
      </body></html>`;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_proyectos_en_ejecucion_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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

      <section className="rounded-xl border border-[#c5a367]/30 bg-[#211c13] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#f1e4c5]"><FolderOpen className="h-4 w-4 text-[#c5a367]" /> Generar informe desde un expediente</div>
            <p className="mt-1 text-[11px] text-[#c9bfa8]">Busca por código, nombre o ubicación y abre directamente la configuración de informes profesionales del proyecto.</p>
          </div>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b3a88f]" />
            <input value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)} placeholder="Buscar proyecto para generar informe..." className="w-full rounded-lg border border-[#5b4a2c] bg-[#0b1220] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#8c816a] focus:border-[#c5a367]" />
          </div>
        </div>
        {projectQuery.trim().length < 2 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#5b4a2c] p-3 text-center text-[11px] text-[#a99e86]">Escribe al menos 2 caracteres. No se cargan todos los proyectos en esta pantalla.</div>
        ) : projectMatches.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#5b4a2c] p-3 text-center text-[11px] text-[#a99e86]">No encontramos un proyecto con esa búsqueda.</div>
        ) : (
          <div className="mt-3 space-y-2">{projectMatches.map((project) => <div key={project.id} className="flex flex-col gap-2 rounded-lg border border-[#5b4a2c] bg-[#15120d] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] font-bold text-[#f1e4c5]">{project.code}</span><span className="rounded bg-[#3a3020] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#d9c99f]">{project.statusLabel}</span></div><div className="mt-1 truncate text-xs font-semibold text-white">{project.name}</div><div className="mt-0.5 truncate text-[10px] text-slate-500">{project.location || project.community || 'Ubicación pendiente'}</div></div><button onClick={() => onOpenProjectTab ? onOpenProjectTab(project.id, 'informes') : onOpenProject(project.id)} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#c5a367] px-3 py-2 text-xs font-bold text-[#0b1118] hover:bg-[#d6bb83]"><FileText className="h-3.5 w-3.5" /> Abrir informes</button></div>)}</div>
        )}
      </section>

      <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-white">Reporte de proyectos en ejecución</div>
            <div className="mt-1 text-[11px] text-slate-400">
              Usa los proyectos productivos actualmente clasificados como En ejecución. No crea registros ficticios.
            </div>
            <div className="mt-2 text-xs font-semibold text-blue-300">
              {executionProjects.length} proyecto(s) incluidos
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Hoja
                <select value={paperSize} onChange={(e) => setPaperSize(e.target.value as 'A4' | 'Letter')} className="ml-1 rounded border border-[#243247] bg-[#0b1220] px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-200">
                  <option value="A4">A4</option>
                  <option value="Letter">Carta</option>
                </select>
              </label>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Orientación
                <select value={orientation} onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')} className="ml-1 rounded border border-[#243247] bg-[#0b1220] px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-200">
                  <option value="landscape">Horizontal</option>
                  <option value="portrait">Vertical</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
              onClick={printExecutionReport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={exportExecutionWord}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-800/60 bg-indigo-950/30 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/50"
            >
              <FileText className="h-3.5 w-3.5" /> Descargar Word
            </button>
            <button
              onClick={exportExecutionCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1f2e45]"
            >
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
          </div>
        </div>
      </div>
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

                  <div className="flex flex-wrap items-center gap-2">
                    {report.publicUrl && (
                      <>
                        <a
                          href={report.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Abrir documento
                        </a>
                        <button
                          onClick={() => void downloadGeneratedReport(report)}
                          disabled={downloadingReportId === report.id}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1f2e45] disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" /> {downloadingReportId === report.id ? 'Descargando…' : `Descargar ${report.format || 'archivo'}`}
                        </button>
                      </>
                    )}
                    {report.projectId && (
                      <>
                        <button
                          onClick={() => onOpenProjectTab ? onOpenProjectTab(report.projectId!, 'informes') : onOpenProject(report.projectId!)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-700/60 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Editar en línea
                        </button>
                        <button
                          onClick={() => onOpenProject(report.projectId!)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" /> Abrir proyecto
                        </button>
                      </>
                    )}
                  </div>
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
