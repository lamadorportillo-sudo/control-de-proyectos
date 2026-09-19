import React, { useMemo, useState } from 'react';
import { ArrowLeft, FileText, Receipt, ShieldCheck, AlertOctagon, Camera, WalletCards, ClipboardList, History, UploadCloud, Plus } from 'lucide-react';
import type { Project, Contract, Estimate, Guarantee, Deficiency, DocumentEvidence, FieldVisit, AuditLog, AppModule } from '../../types.ts';
import { formatLempiras, formatPercent, formatDateSpanish } from '../../services/calculationService.ts';
import { getEvidenceAccessUrl } from '../../services/evidenceAccessService.ts';

interface ProjectExpedienteViewProps {
  project: Project;
  contracts: Contract[];
  estimates: Estimate[];
  guarantees: Guarantee[];
  deficiencies: Deficiency[];
  documents: DocumentEvidence[];
  visits: FieldVisit[];
  auditLogs: AuditLog[];
  onNavigate: (module: AppModule, extra?: any) => void;
  onBack: () => void;
}

type TabId = 'resumen' | 'presupuesto' | 'contrato' | 'estimaciones' | 'garantias' | 'documentos' | 'visitas' | 'deficiencias' | 'historial';

export const ProjectExpedienteView: React.FC<ProjectExpedienteViewProps> = ({
  project,
  contracts,
  estimates,
  guarantees,
  deficiencies,
  documents,
  visits,
  auditLogs,
  onNavigate,
  onBack,
}) => {
  const [tab, setTab] = useState<TabId>('resumen');
  const [openingDocId, setOpeningDocId] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState('');
  const projectContracts = useMemo(() => contracts.filter((x) => x.projectId === project.id), [contracts, project.id]);
  const projectEstimates = useMemo(() => estimates.filter((x) => x.projectId === project.id), [estimates, project.id]);
  const projectGuarantees = useMemo(() => guarantees.filter((x) => x.projectId === project.id), [guarantees, project.id]);
  const projectDeficiencies = useMemo(() => deficiencies.filter((x) => x.projectId === project.id), [deficiencies, project.id]);
  const projectDocuments = useMemo(() => documents.filter((x) => x.projectId === project.id), [documents, project.id]);
  const projectVisits = useMemo(() => visits.filter((x) => x.projectId === project.id), [visits, project.id]);
  const contract = projectContracts[0];
  const projectHistory = useMemo(
    () => auditLogs.filter((log) =>
      log.entityId === project.id ||
      log.entityCode === project.code ||
      String(log.details || '').toLowerCase().includes(project.code.toLowerCase())
    ).slice(0, 100),
    [auditLogs, project.id, project.code]
  );

  const openEvidence = async (id: string) => {
    setOpeningDocId(id);
    setDocumentError('');
    try {
      const url = await getEvidenceAccessUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setDocumentError(String(error?.message || 'No fue posible abrir la evidencia.'));
    } finally {
      setOpeningDocId(null);
    }
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'presupuesto', label: 'Presupuesto y ampliaciones' },
    { id: 'contrato', label: 'Contrato y contratista', count: projectContracts.length },
    { id: 'estimaciones', label: 'Estimaciones y pagos', count: projectEstimates.length },
    { id: 'garantias', label: 'Garantías', count: projectGuarantees.length },
    { id: 'documentos', label: 'Documentos fuente', count: projectDocuments.length },
    { id: 'visitas', label: 'Supervisión y visitas', count: projectVisits.length },
    { id: 'deficiencias', label: 'Deficiencias y seguimiento', count: projectDeficiencies.length },
    { id: 'historial', label: 'Historial / auditoría', count: projectHistory.length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-12">
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-0.5 rounded-lg border border-[#243247] bg-[#172235] p-2 text-slate-300 hover:bg-[#1f2e45] hover:text-white" aria-label="Volver a proyectos">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-950/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">{project.code || 'SIN CÓDIGO'}</span>
            {project.executionCode && <span className="rounded bg-[#172235] px-2 py-0.5 font-mono text-[10px] text-slate-300">{project.executionCode}</span>}
            <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{project.statusLabel}</span>
          </div>
          <h2 className="mt-2 text-lg font-bold leading-tight text-white md:text-xl">{project.name}</h2>
          <p className="mt-1 text-xs text-slate-400">{project.location || project.community || 'Ubicación pendiente de registrar'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-[#1f2e45] bg-[#111827] p-3">
        <button onClick={() => onNavigate('documentos', { action: 'UPLOAD_DOC' })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white">
          <UploadCloud className="h-3.5 w-3.5" /> Agregar documento
        </button>
        <button onClick={() => onNavigate('registrar_visita', { projectId: project.id })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-600 hover:text-white">
          <Camera className="h-3.5 w-3.5" /> Registrar visita
        </button>
        <button onClick={() => onNavigate('deficiencias', { projectId: project.id })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-700 hover:text-white">
          <AlertOctagon className="h-3.5 w-3.5" /> Ver deficiencias
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1f2e45] bg-[#111827] p-1.5">
        <div className="flex min-w-max gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${tab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-[#172235] hover:text-white'}`}
            >
              {item.label}{item.count !== undefined ? ` (${item.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {tab === 'resumen' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <Metric label="Presupuesto vigente" value={formatLempiras(project.revisedBudget || project.assignedBudget)} />
          <Metric label="Monto contrato" value={contract ? formatLempiras(contract.amount) : 'Sin contrato vinculado'} />
          <Metric label="Avance físico" value={formatPercent(project.physicalProgress)} />
          <Metric label="Avance financiero" value={formatPercent(project.financialProgress)} />
          <div className="lg:col-span-4 rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Descripción / alcance</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{project.description || 'Sin descripción registrada.'}</p>
          </div>
        </div>
      )}

      {tab === 'contrato' && (
        <Section icon={FileText} title="Contrato y contratista">
          {projectContracts.length === 0 ? (
            <EmptyActions
              text="No hay contrato vinculado a este proyecto."
              actions={[
                { label: 'Ingresar datos manualmente', onClick: () => onNavigate('contratos', { action: 'NEW_CONTRACT', projectId: project.id }) },
                { label: 'Subir documento', onClick: () => onNavigate('documentos', { action: 'UPLOAD_DOC', projectId: project.id }) },
              ]}
            />
          ) : projectContracts.map((c) => (
            <div key={c.id} className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Metric label="Contrato" value={c.contractNumber || 'Sin número'} />
              <Metric label="Contratista" value={c.contractorName || 'No registrado'} />
              <Metric label="Monto" value={formatLempiras(c.amount)} />
              <Metric label="Plazo" value={c.executionTermDays ? `${c.executionTermDays} días` : 'No registrado'} />
              <Metric label="Fecha firma" value={formatDateSpanish(c.signedDate)} />
              <Metric label="Anticipo" value={formatLempiras(c.advanceAmount)} />
              <Metric label="% anticipo" value={formatPercent(c.advancePercentage)} />
              <Metric label="Estado" value={c.statusLabel} />
            </div>
          ))}
        </Section>
      )}

      {tab === 'presupuesto' && (
        <Section icon={WalletCards} title="Presupuesto">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric label="Asignado" value={formatLempiras(project.assignedBudget)} />
            <Metric label="Vigente" value={formatLempiras(project.revisedBudget)} />
            <Metric label="Fuente" value={project.fundingSource || 'No registrada'} />
          </div>
        </Section>
      )}

      {tab === 'estimaciones' && (
        <Section icon={Receipt} title="Estimaciones y pagos">
          {projectEstimates.length === 0 ? (
            <EmptyActions
              text="No hay estimaciones registradas."
              actions={[{ label: 'Agregar nueva estimación', onClick: () => onNavigate('estimaciones', { action: 'NEW_ESTIMATE', projectId: project.id }) }]}
            />
          ) : (
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-[#243247] text-slate-500"><tr><th className="p-2">N.º</th><th className="p-2">Periodo</th><th className="p-2">Bruto</th><th className="p-2">Deducciones</th><th className="p-2">Neto</th><th className="p-2">Estado</th></tr></thead><tbody className="divide-y divide-[#1f2e45]">{projectEstimates.map((e) => <tr key={e.id}><td className="p-2 font-bold text-white">{e.estimateNumber}</td><td className="p-2 text-slate-300">{formatDateSpanish(e.periodStart)} – {formatDateSpanish(e.periodEnd)}</td><td className="p-2 tabular-nums text-slate-200">{formatLempiras(e.grossAmount)}</td><td className="p-2 tabular-nums text-amber-300">{formatLempiras(e.grossAmount - e.netPayable)}</td><td className="p-2 tabular-nums font-semibold text-emerald-300">{formatLempiras(e.netPayable)}</td><td className="p-2 text-slate-300">{e.paymentStatusLabel}</td></tr>)}</tbody></table></div>
          )}
        </Section>
      )}

      {tab === 'garantias' && (
        <Section icon={ShieldCheck} title="Garantías y pólizas">
          {projectGuarantees.length === 0 ? <EmptyActions text="No hay garantías registradas." actions={[{ label: 'Crear nueva garantía', onClick: () => onNavigate('garantias', { action: 'NEW_GUARANTEE', projectId: project.id }) }]} /> : <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{projectGuarantees.map((g) => <div key={g.id} className="rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-white">{g.typeLabel}</strong><span className="text-[10px] font-semibold uppercase text-amber-300">{g.statusLabel}</span></div><div className="mt-2 space-y-1 text-xs text-slate-400"><div>Póliza: <span className="text-slate-200">{g.policyNumber || 'No registrada'}</span></div><div>Monto: <span className="text-slate-200">{formatLempiras(g.amount)}</span></div><div>Vence: <span className="text-slate-200">{formatDateSpanish(g.expiryDate)}</span></div></div></div>)}</div>}
        </Section>
      )}

      {tab === 'visitas' && (
        <Section icon={Camera} title="Visitas y evidencia de campo">
          {projectVisits.length === 0 ? <Empty text="No hay visitas registradas." /> : <div className="space-y-2">{projectVisits.map((v) => <div key={v.id} className="rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-white">{formatDateSpanish(v.visitDate)}</strong><span className="text-[10px] text-slate-500">Avance reportado: {formatPercent(v.progressReported)}</span></div><p className="mt-2 text-xs leading-relaxed text-slate-300">{v.workCompleted || 'Sin resumen.'}</p></div>)}</div>}
        </Section>
      )}

      {tab === 'deficiencias' && (
        <Section icon={AlertOctagon} title="Deficiencias y seguimiento">
          {projectDeficiencies.length === 0 ? <Empty text="No hay deficiencias registradas para este expediente." /> : <div className="space-y-2">{projectDeficiencies.map((d) => <div key={d.id} className="rounded-lg border border-red-900/50 bg-red-950/20 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-white">{d.title}</strong><span className="text-[10px] font-bold uppercase text-red-300">{d.severity} · {d.statusLabel}</span></div><p className="mt-2 text-xs text-slate-300">{d.description}</p></div>)}</div>}
        </Section>
      )}

      {tab === 'documentos' && (
        <Section icon={ClipboardList} title="Documentos fuente">
          {documentError && <div className="mb-3 rounded-lg border border-amber-800/60 bg-amber-950/25 p-3 text-xs text-amber-200">{documentError}</div>}
          {projectDocuments.length === 0 ? <EmptyActions text="No hay documentos o evidencias vinculadas." actions={[{ label: 'Subir documento', onClick: () => onNavigate('documentos', { action: 'UPLOAD_DOC', projectId: project.id }) }]} /> : <div className="space-y-2">{projectDocuments.map((d) => <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="min-w-0"><div className="truncate text-xs font-semibold text-white">{d.title || d.fileName}</div><div className="mt-0.5 text-[10px] text-slate-500">{d.typeLabel} · {formatDateSpanish(d.uploadDate)}</div></div><button onClick={() => void openEvidence(d.id)} disabled={openingDocId === d.id} className="text-xs font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-50">{openingDocId === d.id ? 'Abriendo…' : 'Abrir'}</button></div>)}</div>}
        </Section>
      )}

      {tab === 'historial' && (
        <Section icon={History} title="Historial / auditoría">
          {projectHistory.length === 0 ? <Empty text="No hay eventos de auditoría vinculados directamente a este expediente." /> : (
            <div className="space-y-2">{projectHistory.map((log) => (
              <div key={log.id} className="rounded-lg border border-[#243247] bg-[#0b1220] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-xs text-white">{log.action}</strong>
                  <span className="text-[10px] text-slate-500">{formatDateSpanish(log.timestamp)}</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-500">{log.user} · {log.role}</div>
                <p className="mt-2 text-xs text-slate-300">{log.details}</p>
              </div>
            ))}</div>
          )}
        </Section>
      )}
    </div>
  );
};

const Metric: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3.5">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1.5 text-sm font-semibold text-slate-100 tabular-nums">{value}</div>
  </div>
);

const Section: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><Icon className="h-4 w-4 text-blue-400" />{title}</h3>
    {children}
  </section>
);

const Empty: React.FC<{ text: string }> = ({ text }) => <div className="rounded-lg border border-dashed border-[#243247] p-5 text-center text-xs text-slate-500">{text}</div>;

const EmptyActions: React.FC<{text:string;actions:Array<{label:string;onClick:()=>void}>}> = ({text,actions}) => (
  <div className="rounded-lg border border-dashed border-[#243247] p-5 text-center">
    <div className="text-xs text-slate-500">{text}</div>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {actions.map((action) => (
        <button key={action.label} onClick={action.onClick} className="inline-flex items-center gap-1 rounded-lg bg-[#172235] px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white">
          <Plus className="h-3.5 w-3.5" /> {action.label}
        </button>
      ))}
    </div>
  </div>
);
