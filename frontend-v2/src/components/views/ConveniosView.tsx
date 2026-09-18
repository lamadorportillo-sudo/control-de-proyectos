import React, { useMemo, useState } from 'react';
import { Handshake, Search, ExternalLink } from 'lucide-react';
import type { DocumentEvidence, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';

interface ConveniosViewProps {
  documents: DocumentEvidence[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

const norm = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const ConveniosView: React.FC<ConveniosViewProps> = ({ documents, projects, onOpenProject }) => {
  const [query, setQuery] = useState('');

  const convenioDocs = useMemo(() => documents.filter((doc) =>
    norm(`${doc.typeLabel} ${doc.title} ${doc.fileName}`).includes('convenio')
  ), [documents]);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return convenioDocs;
    return convenioDocs.filter((doc) => {
      const project = projects.find((p) => p.id === doc.projectId);
      return norm(`${doc.title} ${doc.fileName} ${project?.code || ''} ${project?.name || ''}`).includes(q);
    });
  }, [convenioDocs, projects, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Handshake className="h-5 w-5 text-emerald-400" />
          Convenios
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Se muestran únicamente convenios respaldados por documentos/evidencias existentes. Actualmente no hay una tabla estructurada independiente de convenios en la base productiva.
        </p>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar convenio o proyecto..."
            className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((doc) => {
          const project = projects.find((p) => p.id === doc.projectId);
          return (
            <div key={doc.id} className="flex flex-col gap-3 rounded-xl border border-[#1f2e45] bg-[#111827] p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-white">{doc.title || doc.fileName}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {project ? `${project.code} · ${project.name} · ` : ''}{formatDateSpanish(doc.uploadDate)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {project && (
                  <button onClick={() => onOpenProject(project.id)} className="rounded-lg bg-[#172235] px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white">
                    Abrir expediente
                  </button>
                )}
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#243247] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#172235]">
                    Documento <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#243247] p-10 text-center text-sm text-slate-500">
            No hay convenios estructurados para mostrar con el criterio actual.
          </div>
        )}
      </div>
    </div>
  );
};
