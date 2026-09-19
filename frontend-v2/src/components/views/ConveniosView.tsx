import React, { useMemo, useState } from 'react';
import { Handshake, Search, ExternalLink } from 'lucide-react';
import type { DocumentEvidence, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';
import { getEvidenceAccessUrl } from '../../services/evidenceAccessService.ts';

interface ConveniosViewProps {
  documents: DocumentEvidence[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

const norm = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const ConveniosView: React.FC<ConveniosViewProps> = ({ documents, projects, onOpenProject }) => {
  const [query, setQuery] = useState('');
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState('');

  const convenioDocs = useMemo(() => documents.filter((doc) => {
    const typeLabel = norm(doc.typeLabel || '');
    return doc.type === 'CONVENIO' || typeLabel === 'convenio' || typeLabel.startsWith('convenio ');
  }), [documents]);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return convenioDocs;
    return convenioDocs.filter((doc) => {
      const project = projects.find((p) => p.id === doc.projectId);
      return norm(`${doc.title} ${doc.fileName} ${project?.code || ''} ${project?.name || ''}`).includes(q);
    });
  }, [convenioDocs, projects, query]);

  const openEvidence = async (id: string) => {
    setOpeningId(id);
    setOpenError('');
    try {
      const url = await getEvidenceAccessUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setOpenError(String(error?.message || 'No fue posible abrir el documento.'));
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Handshake className="h-5 w-5 text-emerald-400" />
          Convenios
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Aquí solo aparecen documentos clasificados como convenio. No se mezclan contratos, actas ni documentos que únicamente mencionen la palabra “convenio”.
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

      {openError && <div className="rounded-lg border border-amber-800/60 bg-amber-950/25 p-3 text-xs text-amber-200">{openError}</div>}

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
                <button
                  onClick={() => void openEvidence(doc.id)}
                  disabled={openingId === doc.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#243247] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#172235] disabled:opacity-50"
                >
                  {openingId === doc.id ? 'Abriendo…' : 'Documento'} <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#243247] p-10 text-center text-sm text-slate-500">
            No hay documentos clasificados como convenios con el criterio actual.
          </div>
        )}
      </div>
    </div>
  );
};
