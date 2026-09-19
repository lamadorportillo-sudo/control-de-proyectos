import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Download, FileDown, FileText, Image, Pencil, Printer, RefreshCw, RotateCcw, Save, Settings2, X } from 'lucide-react';
import type { AuditLog, Contract, Deficiency, DocumentEvidence, Estimate, FieldVisit, Guarantee, Project } from '../../types.ts';
import {
  REPORT_TYPES,
  buildProjectReportBody,
  downloadProjectReportDocx,
  downloadProjectReportHtml,
  downloadProjectReportWord,
  openProjectReportPrint,
  reportCss,
  type ProjectReportData,
  type ProjectReportOptions,
  type ProjectReportType,
} from '../../services/projectReportService.ts';

interface ProjectReportViewProps {
  project: Project;
  contract?: Contract;
  estimates: Estimate[];
  guarantees: Guarantee[];
  deficiencies: Deficiency[];
  documents: DocumentEvidence[];
  visits: FieldVisit[];
  auditLogs: AuditLog[];
}

const defaultOptions = (estimates: Estimate[], visits: FieldVisit[]): ProjectReportOptions => ({
  paperSize: 'A4',
  orientation: 'portrait',
  includeCover: true,
  includeEvidence: true,
  includeSignatures: true,
  estimateId: estimates.at(-1)?.id,
  visitId: visits.at(-1)?.id,
});

const controlClass = 'w-full rounded-lg border border-[#334155] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none focus:border-[#c5a367]';

export const ProjectReportView: React.FC<ProjectReportViewProps> = ({
  project,
  contract,
  estimates,
  guarantees,
  deficiencies,
  documents,
  visits,
  auditLogs,
}) => {
  const [type, setType] = useState<ProjectReportType>('final');
  const [options, setOptions] = useState<ProjectReportOptions>(() => defaultOptions(estimates, visits));
  const [wordBusy, setWordBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [editingOnline, setEditingOnline] = useState(false);
  const [editedPreview, setEditedPreview] = useState('');
  const [hasManualEdits, setHasManualEdits] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptions((current) => ({
      ...current,
      estimateId: estimates.some((item) => item.id === current.estimateId) ? current.estimateId : estimates.at(-1)?.id,
      visitId: visits.some((item) => item.id === current.visitId) ? current.visitId : visits.at(-1)?.id,
    }));
  }, [project.id, estimates, visits]);

  const data = useMemo<ProjectReportData>(() => ({
    project,
    contract,
    estimates,
    guarantees,
    deficiencies,
    documents,
    visits,
    auditLogs,
  }), [project, contract, estimates, guarantees, deficiencies, documents, visits, auditLogs]);

  const preview = useMemo(() => buildProjectReportBody(data, type, options), [data, type, options]);
  const selectedDefinition = REPORT_TYPES.find((item) => item.id === type);
  const activePreview = hasManualEdits ? editedPreview : preview;

  useEffect(() => {
    setEditingOnline(false);
    setEditedPreview('');
    setHasManualEdits(false);
  }, [project.id]);

  const clearOnlineEdits = () => {
    setEditingOnline(false);
    setEditedPreview('');
    setHasManualEdits(false);
  };

  const selectType = (nextType: ProjectReportType) => {
    setType(nextType);
    clearOnlineEdits();
    setMessage('');
  };

  const updateOption = <K extends keyof ProjectReportOptions>(key: K, value: ProjectReportOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
    clearOnlineEdits();
    setMessage('');
  };

  const currentReportBody = () =>
    editingOnline ? (editorRef.current?.innerHTML || activePreview) : activePreview;

  const startOnlineEdit = () => {
    setEditingOnline(true);
    setMessage('Edición en línea activa. Puedes corregir directamente textos, títulos, observaciones y contenido visible del informe.');
  };

  const saveOnlineEdit = () => {
    const body = editorRef.current?.innerHTML || activePreview;
    setEditedPreview(body);
    setHasManualEdits(true);
    setEditingOnline(false);
    setMessage('Cambios de edición en línea conservados para este informe. Se usarán al imprimir o descargar PDF, Word y HTML.');
  };

  const cancelOnlineEdit = () => {
    setEditingOnline(false);
    setMessage('Edición cancelada. No se aplicaron los últimos cambios.');
  };

  const restoreGeneratedReport = () => {
    clearOnlineEdits();
    setMessage('Se restauró el contenido generado desde los datos del expediente.');
  };

  const print = () => {
    const opened = openProjectReportPrint(data, type, options, currentReportBody());
    setMessage(opened ? 'Se abrió el formato de impresión. En el diálogo del navegador elige “Guardar como PDF” o selecciona tu impresora.' : 'El navegador bloqueó la ventana del informe. Permite las ventanas emergentes para Control Contractual e inténtalo nuevamente.');
  };

  const downloadWord = async () => {
    setWordBusy(true);
    setMessage('');
    const body = currentReportBody();
    try {
      await downloadProjectReportDocx(data, type, options, body);
      setMessage('Informe Word (.docx) descargado.');
    } catch (error) {
      console.warn('No se pudo generar DOCX; se usará formato compatible con Word.', error);
      downloadProjectReportWord(data, type, options, body);
      setMessage('Informe Word compatible (.doc) descargado.');
    } finally {
      setWordBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#c5a367]"><FileText className="h-4 w-4" /> Informes profesionales del expediente</div>
            <h3 className="mt-1 text-lg font-bold text-white">{selectedDefinition?.title || 'Informe del proyecto'}</h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">{selectedDefinition?.description} Los datos se toman del proyecto y sus registros vinculados; no se crean cifras ni documentos ficticios.</p>
          </div>
          <div className="rounded-lg border border-[#334155] bg-[#0b1220] px-3 py-2 text-right text-[10px] text-slate-400"><b className="block text-white">{project.code || 'SIN CÓDIGO'}</b>{project.statusLabel || project.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectType(item.id)}
            className={`rounded-xl border p-3 text-left transition ${type === item.id ? 'border-[#c5a367] bg-[#3a3020] shadow-[0_0_0_1px_rgba(197,163,103,.25)]' : 'border-[#2b3a4a] bg-[#111a25] hover:border-[#64748b] hover:bg-[#172235]'}`}
          >
            <div className="flex items-start gap-2"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${type === item.id ? 'bg-[#c5a367] text-[#0b1118]' : 'bg-[#253448] text-slate-400'}`}>{type === item.id ? <Check className="h-3 w-3" /> : <FileText className="h-3 w-3" />}</span><span className="text-xs font-bold text-white">{item.title}</span></div>
            <span className="mt-2 block text-[10px] leading-relaxed text-slate-400">{item.description}</span>
          </button>
        ))}
      </div>

      <section className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><Settings2 className="h-4 w-4 text-[#c5a367]" /> Configuración de impresión</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tipo de informe</span><select value={type} onChange={(event) => selectType(event.target.value as ProjectReportType)} className={controlClass}>{REPORT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tamaño de papel</span><select value={options.paperSize} onChange={(event) => updateOption('paperSize', event.target.value as ProjectReportOptions['paperSize'])} className={controlClass}><option value="A4">A4</option><option value="LETTER">Carta / Letter</option></select></label>
          <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Orientación</span><select value={options.orientation} onChange={(event) => updateOption('orientation', event.target.value as ProjectReportOptions['orientation'])} className={controlClass}><option value="portrait">Vertical</option><option value="landscape">Horizontal</option></select></label>
          {type === 'estimacion' && <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Estimación a informar</span><select value={options.estimateId || ''} onChange={(event) => updateOption('estimateId', event.target.value || undefined)} className={controlClass}><option value="">Todas las estimaciones</option>{estimates.map((item) => <option key={item.id} value={item.id}>N.º {item.estimateNumber} · {item.periodStart} – {item.periodEnd}</option>)}</select></label>}
          {type === 'visitas' && <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Visita a informar</span><select value={options.visitId || ''} onChange={(event) => updateOption('visitId', event.target.value || undefined)} className={controlClass}><option value="">Todas las visitas</option>{visits.map((item) => <option key={item.id} value={item.id}>{item.visitDate} · {item.inspectorName || 'Sin supervisor'}</option>)}</select></label>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Toggle checked={options.includeCover} label="Portada institucional" onChange={(value) => updateOption('includeCover', value)} />
          <Toggle checked={options.includeEvidence} label="Registro fotográfico" onChange={(value) => updateOption('includeEvidence', value)} icon={<Image className="h-3 w-3" />} />
          <Toggle checked={options.includeSignatures} label="Espacios de firma" onChange={(value) => updateOption('includeSignatures', value)} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-900/50 bg-blue-950/20 p-3">
        <button type="button" onClick={print} className="inline-flex items-center gap-1.5 rounded-lg bg-[#c5a367] px-3 py-2 text-xs font-bold text-[#0b1118] hover:bg-[#d6bb83]"><Printer className="h-3.5 w-3.5" /> Imprimir / Guardar PDF</button>
        <button type="button" onClick={() => void downloadWord()} disabled={wordBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5a367]/60 bg-[#3a3020] px-3 py-2 text-xs font-bold text-[#f1e4c5] hover:bg-[#4b3e27] disabled:opacity-50"><FileDown className="h-3.5 w-3.5" /> {wordBusy ? 'Generando Word…' : 'Descargar Word (.docx)'}</button>
        <button type="button" onClick={() => downloadProjectReportHtml(data, type, options, currentReportBody())} className="inline-flex items-center gap-1.5 rounded-lg border border-[#334155] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#243247]"><Download className="h-3.5 w-3.5" /> Descargar HTML</button>
        {!editingOnline ? (
          <button type="button" onClick={startOnlineEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/60 bg-emerald-950/30 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50"><Pencil className="h-3.5 w-3.5" /> Editar en línea</button>
        ) : (
          <>
            <button type="button" onClick={saveOnlineEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"><Save className="h-3.5 w-3.5" /> Guardar cambios</button>
            <button type="button" onClick={cancelOnlineEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"><X className="h-3.5 w-3.5" /> Cancelar</button>
          </>
        )}
        {hasManualEdits && !editingOnline && (
          <button type="button" onClick={restoreGeneratedReport} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/50 bg-amber-950/20 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40"><RotateCcw className="h-3.5 w-3.5" /> Restaurar original</button>
        )}
        <button type="button" onClick={() => { setOptions(defaultOptions(estimates, visits)); clearOnlineEdits(); setMessage('Configuración restablecida.'); }} className="inline-flex items-center gap-1.5 rounded-lg border border-[#334155] px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-[#172235] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Restablecer opciones</button>
        {message && <span className="basis-full text-[11px] text-blue-200">{message}</span>}
      </div>

      <div className="rounded-xl border border-[#2b3a4a] bg-[#111827] p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">Vista previa del informe</div>
            <div className="mt-1 text-[10px] text-slate-500">{options.paperSize} · {options.orientation === 'portrait' ? 'vertical' : 'horizontal'} · {hasManualEdits ? 'con cambios editados en línea' : 'generado con la información disponible'}</div>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${editingOnline ? 'border-amber-700/60 bg-amber-950/30 text-amber-300' : hasManualEdits ? 'border-blue-700/60 bg-blue-950/30 text-blue-300' : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300'}`}>{editingOnline ? 'Editando en línea' : hasManualEdits ? 'Editado · listo para exportar' : 'Listo para imprimir'}</span>
        </div>
        {editingOnline && (
          <div className="mb-3 rounded-lg border border-amber-700/40 bg-amber-950/20 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
            Haz clic directamente sobre el texto del informe y corrígelo. Los cambios son solo para esta salida del informe: no modifican los datos fuente del proyecto, contrato, estimaciones o garantías.
          </div>
        )}
        <div className={`cc-report-preview overflow-auto rounded-lg border bg-white p-3 text-left shadow-inner transition ${editingOnline ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-[#d5dde5]'}`}>
          <style dangerouslySetInnerHTML={{ __html: reportCss(options, true) }} />
          <div
            key={`${project.id}-${type}-${editingOnline ? 'edit' : 'view'}-${hasManualEdits ? 'manual' : 'auto'}`}
            ref={editorRef}
            data-cc-online-report-editor
            contentEditable={editingOnline}
            suppressContentEditableWarning
            className={editingOnline ? 'min-h-[360px] cursor-text outline-none' : undefined}
            dangerouslySetInnerHTML={{ __html: activePreview }}
          />
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ checked: boolean; label: string; onChange: (value: boolean) => void; icon?: React.ReactNode }> = ({ checked, label, onChange, icon }) => (
  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#334155] bg-[#0b1220] px-3 py-2 text-[11px] text-slate-300 hover:border-[#64748b]">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-[#c5a367]" />
    {icon}{label}
  </label>
);

