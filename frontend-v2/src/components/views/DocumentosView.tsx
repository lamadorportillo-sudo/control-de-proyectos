import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Search, ExternalLink, Plus } from 'lucide-react';
import type { DocumentEvidence, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';
import { getGeneratedReports, type GeneratedReportRecord } from '../../services/reportService.ts';

interface DocumentosViewProps {
  documents: DocumentEvidence[];
  projects: Project[];
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const DocumentosView: React.FC<DocumentosViewProps> = ({ documents, projects }) => {
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<GeneratedReportRecord[]>([]);

  useEffect(() => {
    void getGeneratedReports()
      .then(setReports)
      .catch((error) => console.warn('Biblioteca: reportes generados', error));
  }, []);
  const q = norm(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return documents.filter((doc) => {
      const project = projects.find((p) => p.id === doc.projectId);
      return norm([doc.title, doc.fileName, doc.typeLabel, project?.code, project?.name, project?.location].filter(Boolean).join(' ')).includes(q);
    }).slice(0, 80);
  }, [documents, projects, q]);

  const reportResults = useMemo(() => {
    if (q.length < 2) return [];
    return reports.filter((report) => {
      const project = projects.find((p) => p.id === report.projectId);
      return norm([report.title, report.fileName, report.reportType, report.format, project?.code, project?.name].filter(Boolean).join(' ')).includes(q);
    }).slice(0, 80);
  }, [reports, projects, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><FileText className="h-5 w-5 text-indigo-400" />Documentos y evidencias</h2>
          <p className="mt-1 text-xs text-slate-400">Búsqueda por expediente, evidencia y reportes digitales generados. No se abre toda la biblioteca al entrar.</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-500"><Plus className="h-4 w-4" />Subir documento</button>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Contrato, estimación, acta, fotografía, plano, proyecto…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500" /></div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length + reportResults.length} coincidencia(s).`}</div>
      </div>

      <div className="space-y-2">
        {reportResults.map((report) => {
          const project = projects.find((p) => p.id === report.projectId);
          return (
            <div key={`report-${report.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-900/50 bg-[#111827] p-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">Reporte digital</span>
                  <span className="font-mono text-[10px] text-slate-500">{project?.code}</span>
                </div>
                <div className="mt-1.5 truncate text-xs font-semibold text-white">{report.title || report.fileName}</div>
                <div className="mt-1 text-[10px] text-slate-500">{project?.name || 'Proyecto no identificado'} · {formatDateSpanish(report.createdAt)} · v{report.version}</div>
              </div>
              {report.publicUrl ? (
                <a href={report.publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900/50">
                  Abrir <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-[10px] text-slate-600">Acceso interno</span>
              )}
            </div>
          );
        })}

        {results.map((doc) => {
          const project = projects.find((p) => p.id === doc.projectId);
          return (
            <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#1f2e45] bg-[#111827] p-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300">{doc.typeLabel}</span><span className="font-mono text-[10px] text-slate-500">{project?.code}</span></div>
                <div className="mt-1.5 truncate text-xs font-semibold text-white">{doc.title || doc.fileName}</div>
                <div className="mt-1 text-[10px] text-slate-500">{project?.name || 'Proyecto no identificado'} · {formatDateSpanish(doc.uploadDate)}</div>
              </div>
              {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#243247] bg-[#172235] px-2.5 py-1.5 text-[11px] font-semibold text-blue-300 hover:bg-[#1f2e45]">Abrir <ExternalLink className="h-3 w-3" /></a> : <span className="text-[10px] text-slate-600">Sin enlace público</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
