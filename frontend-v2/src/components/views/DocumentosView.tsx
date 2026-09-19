import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Search, ExternalLink, Plus, X, UploadCloud } from 'lucide-react';
import type { DocumentEvidence, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';
import { getGeneratedReports, type GeneratedReportRecord } from '../../services/reportService.ts';
import { getEvidenceAccessUrl } from '../../services/evidenceAccessService.ts';
import { uploadProjectDocument } from '../../services/documentUploadService.ts';

interface DocumentosViewProps {
  documents: DocumentEvidence[];
  projects: Project[];
  onUploaded?: () => Promise<void> | void;
  initialAction?: string | null;
  initialProjectId?: string | null;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-indigo-500';

export const DocumentosView: React.FC<DocumentosViewProps> = ({ documents, projects, onUploaded, initialAction = null, initialProjectId = null }) => {
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<GeneratedReportRecord[]>([]);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadForm, setUploadForm] = useState({
    projectId:'',
    type:'OTRO',
    title:'',
    file:null as File | null,
  });

  useEffect(() => {
    if (initialAction === 'UPLOAD_DOC') setShowUpload(true);
    if (initialProjectId) setUploadForm((current) => ({ ...current, projectId: initialProjectId }));
  }, [initialAction, initialProjectId]);

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

  const documentTypeCount = useMemo(() => new Set(documents.map((document) => document.type)).size, [documents]);

  const openEvidence = async (id: string) => {
    setOpeningId(id);
    setOpenError('');
    try {
      const url = await getEvidenceAccessUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setOpenError(String(error?.message || 'No fue posible abrir la evidencia.'));
    } finally {
      setOpeningId(null);
    }
  };

  const doUpload = async () => {
    if (!uploadForm.projectId || !uploadForm.file) {
      setUploadMessage('Selecciona un proyecto y un archivo.');
      return;
    }
    setUploading(true);
    setUploadMessage('');
    try {
      await uploadProjectDocument({
        projectId: uploadForm.projectId,
        type: uploadForm.type,
        title: uploadForm.title,
        file: uploadForm.file,
      });
      await onUploaded?.();
      setUploadMessage('Documento subido y vinculado al expediente.');
      setUploadForm({projectId:'',type:'OTRO',title:'',file:null});
      setShowUpload(false);
    } catch (error:any) {
      setUploadMessage('No se pudo subir: ' + String(error?.message || error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><FileText className="h-5 w-5 text-indigo-400" />Documentos y evidencias</h2>
          <p className="mt-1 text-xs text-slate-400">Búsqueda por expediente, evidencia y reportes digitales generados. No se abre toda la biblioteca al entrar.</p>
        </div>
        <button onClick={()=>{setShowUpload(true);setUploadMessage('');}} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"><Plus className="h-4 w-4" />Subir documento</button>
      </div>

      {uploadMessage && <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">{uploadMessage}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Documentos vinculados" value={String(documents.length)} detail="Evidencias de expedientes" />
        <Kpi label="Tipos documentales" value={String(documentTypeCount)} detail="Clasificaciones usadas" />
        <Kpi label="Reportes digitales" value={String(reports.length)} detail="Generados en la plataforma" />
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Contrato, estimación, acta, fotografía, plano, proyecto…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500" /></div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length + reportResults.length} coincidencia(s).`}</div>
      </div>

      {openError && <div className="rounded-lg border border-amber-800/60 bg-amber-950/25 p-3 text-xs text-amber-200">{openError}</div>}

      {q.length < 2 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center">
          <div className="text-sm font-semibold text-white">{documents.length === 0 && reports.length === 0 ? 'Aún no hay documentos visibles' : 'Busca una evidencia cuando la necesites'}</div>
          <div className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{documents.length === 0 && reports.length === 0 ? 'Usa “Subir documento” para vincular contratos, estimaciones, pólizas, actas, fotografías u otros respaldos al proyecto.' : 'Escribe al menos 2 caracteres para buscar por proyecto, tipo, nombre de archivo o título.'}</div>
        </div>
      )}

      {q.length >= 2 && results.length + reportResults.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#243247] bg-[#0d1623] p-5 text-center text-xs text-slate-500">No encontramos documentos ni reportes con esa búsqueda.</div>
      )}

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
              <button
                onClick={() => void openEvidence(doc.id)}
                disabled={openingId === doc.id}
                className="inline-flex items-center gap-1 rounded-lg border border-[#243247] bg-[#172235] px-2.5 py-1.5 text-[11px] font-semibold text-blue-300 hover:bg-[#1f2e45] disabled:opacity-50"
              >
                {openingId === doc.id ? 'Abriendo…' : 'Abrir'} <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Subir documento">
          <div className="w-full max-w-2xl rounded-2xl border border-[#243247] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#243247] px-4 py-3">
              <div><div className="text-sm font-bold text-white">Subir documento al expediente</div><div className="text-[10px] text-slate-500">Storage productivo · acceso protegido por RLS.</div></div>
              <button onClick={()=>setShowUpload(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4"/></button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <Field label="Proyecto" wide><select value={uploadForm.projectId} onChange={(e)=>setUploadForm({...uploadForm,projectId:e.target.value})} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
              <Field label="Tipo"><select value={uploadForm.type} onChange={(e)=>setUploadForm({...uploadForm,type:e.target.value})} className={inputClass}><option value="CONTRATO">Contrato</option><option value="ESTIMACION">Estimación</option><option value="ORDEN_PAGO">Orden de pago</option><option value="POLIZA">Póliza / garantía</option><option value="ACTA">Acta</option><option value="INFORME">Informe</option><option value="PLANO">Plano</option><option value="CONVENIO">Convenio interinstitucional</option><option value="ADENDA">Adenda contractual</option><option value="FOTOGRAFIA">Fotografía</option><option value="AUDIO">Audio</option><option value="OTRO">Otro</option></select></Field>
              <Field label="Título"><input value={uploadForm.title} onChange={(e)=>setUploadForm({...uploadForm,title:e.target.value})} placeholder="Descripción breve del documento" className={inputClass}/></Field>
              <Field label="Archivo" wide>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#334155] bg-[#0b1220] p-5 text-xs font-semibold text-slate-300 hover:border-indigo-600">
                  <UploadCloud className="h-5 w-5 text-indigo-400"/>
                  <span>{uploadForm.file?.name || 'Seleccionar archivo'}</span>
                  <input type="file" className="hidden" onChange={(e)=>setUploadForm({...uploadForm,file:e.target.files?.[0] || null})}/>
                </label>
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#243247] p-4">
              <button onClick={()=>setShowUpload(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button onClick={()=>void doUpload()} disabled={uploading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><UploadCloud className="h-4 w-4"/>{uploading?'Subiendo…':'Subir y vincular'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => (
  <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3.5">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-base font-bold text-white tabular-nums">{value}</div>
    <div className="mt-0.5 text-[11px] text-slate-500">{detail}</div>
  </div>
);

const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
