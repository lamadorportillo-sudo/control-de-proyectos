import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  AlertOctagon,
  Camera,
  FileText,
  History,
  ClipboardCheck,
  MapPin,
  CheckCircle2,
  XCircle,
  LockKeyhole,
  Plus,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import type { Deficiency, DocumentEvidence, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';
import { downloadEvidenceFile, getEvidenceAccessUrl } from '../../services/evidenceAccessService.ts';
import {
  addDeficiencyFollowup,
  markDeficiencyInCorrection,
  verifyDeficiency,
  rejectDeficiencyCorrection,
  closeDeficiency,
} from '../../services/deficiencyService.ts';
import { uploadProjectDocument } from '../../services/documentUploadService.ts';

interface Props {
  deficiency: Deficiency;
  project?: Project;
  documents: DocumentEvidence[];
  onBack: () => void;
  onChanged?: () => Promise<void> | void;
  onDocumentsChanged?: () => Promise<void> | void;
}

type Tab = 'resumen' | 'evidencia' | 'seguimiento' | 'documentos' | 'historial';

const inputClass =
  'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-red-500';

export const DeficiencyDetailView: React.FC<Props> = ({
  deficiency,
  project,
  documents,
  onBack,
  onChanged,
  onDocumentsChanged,
}) => {
  const [tab, setTab] = useState<Tab>('resumen');
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [openError, setOpenError] = useState('');
  const [busy, setBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [followup, setFollowup] = useState({
    comment: '',
    instruction: '',
    responsible: deficiency.responsibleContractor || '',
    dueDate: deficiency.deadline || '',
  });
  const [verificationObservation, setVerificationObservation] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [rejectForm, setRejectForm] = useState({
    reason: '',
    instruction: '',
    responsible: deficiency.responsibleContractor || '',
    dueDate: deficiency.deadline || '',
  });
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const linked = useMemo(
    () =>
      documents.filter(
        (doc) =>
          doc.deficiencyId === deficiency.id ||
          (deficiency.linkedVisitId && doc.visitId === deficiency.linkedVisitId),
      ),
    [documents, deficiency.id, deficiency.linkedVisitId],
  );

  const evidence = linked.filter((doc) => doc.type === 'FOTOGRAFIA' || doc.type === 'AUDIO');
  const formalDocs = linked.filter((doc) => doc.type !== 'FOTOGRAFIA' && doc.type !== 'AUDIO');

  const openEvidence = async (id: string) => {
    setOpeningId(id);
    setOpenError('');
    try {
      const url = await getEvidenceAccessUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setOpenError(String(error?.message || 'No fue posible abrir el archivo.'));
    } finally {
      setOpeningId(null);
    }
  };

  const downloadEvidence = async (id: string) => {
    setDownloadingId(id);
    setOpenError('');
    try {
      await downloadEvidenceFile(id);
    } catch (error: any) {
      setOpenError(String(error?.message || 'No fue posible descargar el archivo.'));
    } finally {
      setDownloadingId(null);
    }
  };

  const run = async (key: string, fn: () => Promise<void>, success: string) => {
    setBusy(key);
    setActionMessage('');
    try {
      await fn();
      await onChanged?.();
      setActionMessage(success);
    } catch (error: any) {
      setActionMessage('No se pudo completar: ' + String(error?.message || error));
    } finally {
      setBusy('');
    }
  };

  const registerFollowup = async () => {
    if (!followup.comment.trim() && !followup.instruction.trim()) {
      setActionMessage('Escribe una observación o instrucción de seguimiento.');
      return;
    }
    await run(
      'followup',
      () =>
        addDeficiencyFollowup({
          deficiencyId: deficiency.id,
          projectId: deficiency.projectId,
          action: 'Seguimiento',
          comment: followup.comment,
          instruction: followup.instruction,
          responsible: followup.responsible,
          dueDate: followup.dueDate || undefined,
        }),
      'Seguimiento registrado.',
    );
    setFollowup((current) => ({ ...current, comment: '', instruction: '' }));
  };

  const uploadEvidence = async () => {
    if (!evidenceFile) {
      setActionMessage('Selecciona una fotografía o audio.');
      return;
    }
    await run(
      'evidence',
      async () => {
        await uploadProjectDocument({
          projectId: deficiency.projectId,
          deficiencyId: deficiency.id,
          visitId: deficiency.linkedVisitId,
          type: evidenceFile.type.startsWith('audio/') ? 'AUDIO' : 'FOTOGRAFIA',
          title: evidenceTitle || `Evidencia · ${deficiency.title}`,
          file: evidenceFile,
        });
        await onDocumentsChanged?.();
      },
      'Evidencia vinculada a la deficiencia.',
    );
    setEvidenceFile(null);
    setEvidenceTitle('');
  };

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'evidencia', label: 'Evidencia', count: evidence.length },
    { id: 'seguimiento', label: 'Seguimiento', count: deficiency.history.length },
    { id: 'documentos', label: 'Documentos', count: formalDocs.length },
    { id: 'historial', label: 'Historial', count: deficiency.history.length },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-12">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-0.5 rounded-lg border border-[#243247] bg-[#172235] p-2 text-slate-300 hover:text-white"
          aria-label="Volver a deficiencias"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-red-800 bg-red-950/50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">
              {deficiency.severity}
            </span>
            <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
              {deficiency.statusLabel}
            </span>
            {project?.code && <span className="font-mono text-[10px] text-blue-300">{project.code}</span>}
          </div>
          <h2 className="mt-2 text-lg font-bold text-white">{deficiency.title}</h2>
          <p className="mt-1 text-xs text-slate-400">{project?.name || 'Proyecto no identificado'}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1f2e45] bg-[#111827] p-1.5">
        <div className="flex min-w-max gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? 'rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white'
                  : 'rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-[#172235] hover:text-white'
              }
            >
              {item.label}
              {item.count !== undefined ? ' (' + item.count + ')' : ''}
            </button>
          ))}
        </div>
      </div>

      {(openError || actionMessage) && (
        <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">
          {openError || actionMessage}
        </div>
      )}

      {tab === 'resumen' && (
        <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <AlertOctagon className="h-4 w-4 text-red-400" />
            Problema
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Box label="Descripción" value={deficiency.description || 'Sin descripción.'} wide />
            <Box label="Ubicación específica" value={deficiency.specificLocation || 'No registrada'} icon={MapPin} />
            <Box label="Fecha reportada" value={formatDateSpanish(deficiency.reportedDate)} />
            <Box label="Responsable" value={deficiency.responsibleContractor || 'No registrado'} />
            <Box label="Fecha límite" value={deficiency.deadline ? formatDateSpanish(deficiency.deadline) : 'No registrada'} />
            <Box label="Origen" value={deficiency.linkedVisitId ? 'Visita de obra vinculada' : 'Hallazgo técnico / control'} />
          </div>
        </section>
      )}

      {tab === 'evidencia' && (
        <div className="space-y-3">
          <FileList
            title="Evidencia fotográfica y audio"
            icon={Camera}
            items={evidence}
            openingId={openingId}
            downloadingId={downloadingId}
            onOpen={openEvidence}
            onDownload={downloadEvidence}
            empty="No hay fotografías o audios vinculados directamente a esta deficiencia."
          />
          {deficiency.status !== 'CERRADA' && (
            <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                Agregar evidencia
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Título</span>
                  <input
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className={inputClass}
                    placeholder="Ej. Corrección de fisura verificada"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Archivo</span>
                  <input
                    type="file"
                    accept="image/*,audio/*"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    className={inputClass}
                  />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => void uploadEvidence()}
                  disabled={busy === 'evidence'}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {busy === 'evidence' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Vincular evidencia
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {tab === 'seguimiento' && (
        <div className="space-y-3">
          <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <ClipboardCheck className="h-4 w-4 text-amber-400" />
              Seguimiento
            </h3>
            <Timeline items={deficiency.history} />

            {deficiency.status !== 'CERRADA' && (
              <div className="mt-5 border-t border-[#243247] pt-4">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Registrar seguimiento</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-1.5 block text-[10px] text-slate-500">Observación</span>
                    <textarea rows={3} value={followup.comment} onChange={(e)=>setFollowup({...followup,comment:e.target.value})} className={inputClass}/>
                  </label>
                  <label className="md:col-span-2">
                    <span className="mb-1.5 block text-[10px] text-slate-500">Nueva instrucción</span>
                    <textarea rows={2} value={followup.instruction} onChange={(e)=>setFollowup({...followup,instruction:e.target.value})} className={inputClass}/>
                  </label>
                  <label><span className="mb-1.5 block text-[10px] text-slate-500">Responsable</span><input value={followup.responsible} onChange={(e)=>setFollowup({...followup,responsible:e.target.value})} className={inputClass}/></label>
                  <label><span className="mb-1.5 block text-[10px] text-slate-500">Nueva fecha límite</span><input type="date" value={followup.dueDate} onChange={(e)=>setFollowup({...followup,dueDate:e.target.value})} className={inputClass}/></label>
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={()=>void registerFollowup()} disabled={busy==='followup'} className="inline-flex items-center gap-2 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white disabled:opacity-50">
                    <Plus className="h-4 w-4"/>Agregar seguimiento
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Verificación y cierre</h3>

            {deficiency.status === 'ABIERTA' && (
              <button
                onClick={()=>void run('correction',()=>markDeficiencyInCorrection(deficiency.id,deficiency.projectId,'Corrección iniciada.'),'Deficiencia marcada En corrección.')}
                disabled={busy==='correction'}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                <ClipboardCheck className="h-4 w-4"/>Marcar en corrección
              </button>
            )}

            {deficiency.status === 'EN_CORRECCION' && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">Confirmar verificación no cierra la deficiencia. El cierre es una acción separada.</p>
                <textarea
                  rows={3}
                  value={verificationObservation}
                  onChange={(e)=>setVerificationObservation(e.target.value)}
                  className={inputClass}
                  placeholder="Observación de verificación técnica…"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={()=>void run('verify',()=>verifyDeficiency(deficiency.id,deficiency.projectId,verificationObservation),'Corrección verificada. Aún no está cerrada.')}
                    disabled={busy==='verify'}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4"/>Confirmar verificación
                  </button>
                  <button onClick={()=>setShowReject((v)=>!v)} className="inline-flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-300">
                    <XCircle className="h-4 w-4"/>Rechazar corrección
                  </button>
                </div>

                {showReject && (
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-red-900/50 bg-red-950/15 p-3 md:grid-cols-2">
                    <label className="md:col-span-2"><span className="mb-1 block text-[10px] text-slate-500">Motivo del rechazo</span><textarea rows={2} value={rejectForm.reason} onChange={(e)=>setRejectForm({...rejectForm,reason:e.target.value})} className={inputClass}/></label>
                    <label className="md:col-span-2"><span className="mb-1 block text-[10px] text-slate-500">Nueva instrucción</span><textarea rows={2} value={rejectForm.instruction} onChange={(e)=>setRejectForm({...rejectForm,instruction:e.target.value})} className={inputClass}/></label>
                    <label><span className="mb-1 block text-[10px] text-slate-500">Responsable</span><input value={rejectForm.responsible} onChange={(e)=>setRejectForm({...rejectForm,responsible:e.target.value})} className={inputClass}/></label>
                    <label><span className="mb-1 block text-[10px] text-slate-500">Nueva fecha límite</span><input type="date" value={rejectForm.dueDate} onChange={(e)=>setRejectForm({...rejectForm,dueDate:e.target.value})} className={inputClass}/></label>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        onClick={()=>void run('reject',()=>rejectDeficiencyCorrection(deficiency.id,deficiency.projectId,rejectForm.reason,rejectForm.instruction,rejectForm.responsible,rejectForm.dueDate||undefined),'Corrección rechazada; vuelve a En corrección.')}
                        disabled={busy==='reject' || !rejectForm.reason.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4"/>Registrar rechazo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {deficiency.status === 'VERIFICADA' && (
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/20 p-3 text-xs text-emerald-200">
                  La corrección está verificada. Todavía no está cerrada.
                </div>
                <div>
                  <button
                    onClick={()=>void run('close',()=>closeDeficiency(deficiency.id,deficiency.projectId),'Deficiencia cerrada.')}
                    disabled={busy==='close'}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <LockKeyhole className="h-4 w-4"/>Cerrar deficiencia
                  </button>
                </div>
              </div>
            )}

            {deficiency.status === 'CERRADA' && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-300">
                Deficiencia cerrada. El historial permanece disponible en modo lectura.
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'documentos' && (
        <FileList
          title="Documentos formales"
          icon={FileText}
          items={formalDocs}
          openingId={openingId}
          downloadingId={downloadingId}
          onOpen={openEvidence}
          onDownload={downloadEvidence}
          empty="No hay documentos formales vinculados."
        />
      )}

      {tab === 'historial' && (
        <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <History className="h-4 w-4 text-blue-400" />
            Historial
          </h3>
          <Timeline items={deficiency.history} />
        </section>
      )}
    </div>
  );
};

const Box: React.FC<{
  label: string;
  value: string;
  wide?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ label, value, wide, icon: Icon }) => (
  <div className={(wide ? 'md:col-span-2 ' : '') + 'rounded-lg border border-[#243247] bg-[#0b1220] p-3'}>
    <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </div>
    <div className="mt-1.5 text-xs leading-relaxed text-slate-200">{value}</div>
  </div>
);

const Timeline: React.FC<{ items: Deficiency['history'] }> = ({ items }) =>
  items.length ? (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.timestamp + index} className="rounded-lg border border-[#243247] bg-[#0b1220] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-xs text-white">{item.action}</strong>
            <span className="text-[10px] text-slate-500">{formatDateSpanish(item.timestamp)}</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">{item.user}</div>
          {item.comment && <p className="mt-2 text-xs text-slate-300">{item.comment}</p>}
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-lg border border-dashed border-[#243247] p-5 text-center text-xs text-slate-500">
      Sin eventos registrados.
    </div>
  );

const FileList: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DocumentEvidence[];
  openingId: string | null;
  downloadingId: string | null;
  onOpen: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
  empty: string;
}> = ({ title, icon: Icon, items, openingId, downloadingId, onOpen, onDownload, empty }) => (
  <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
      <Icon className="h-4 w-4 text-blue-400" />
      {title}
    </h3>
    {items.length ? (
      <div className="space-y-2">
        {items.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#243247] bg-[#0b1220] p-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">{doc.title || doc.fileName}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                {doc.typeLabel} · {formatDateSpanish(doc.uploadDate)}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => void onOpen(doc.id)}
                disabled={openingId === doc.id || downloadingId === doc.id}
                className="text-xs font-semibold text-blue-400 disabled:opacity-50"
              >
                {openingId === doc.id ? 'Abriendo…' : 'Abrir'}
              </button>
              <button
                onClick={() => void onDownload(doc.id)}
                disabled={openingId === doc.id || downloadingId === doc.id}
                className="rounded-lg border border-[#243247] px-2 py-1 text-[11px] font-semibold text-emerald-300 disabled:opacity-50"
              >
                {downloadingId === doc.id ? 'Descargando…' : 'Descargar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-lg border border-dashed border-[#243247] p-5 text-center text-xs text-slate-500">{empty}</div>
    )}
  </section>
);
