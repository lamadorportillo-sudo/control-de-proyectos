import React from 'react';
import { ArrowLeft, FileSpreadsheet, FolderGit2, FileSignature, Receipt, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';
import type { Project, Contract, Estimate, Guarantee, Deficiency, DocumentEvidence } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';

export interface PublicPortalDraft {
  month: string;
  selected: string[];
}

interface Props {
  draft: PublicPortalDraft;
  projects: Project[];
  contracts: Contract[];
  estimates: Estimate[];
  guarantees: Guarantee[];
  deficiencies: Deficiency[];
  documents: DocumentEvidence[];
  onBack: () => void;
}

const monthLabel = (value: string) => {
  if (!value) return 'Mes no definido';
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-HN', { month: 'long', year: 'numeric' })
    .format(new Date(year, Math.max(0, month - 1), 1))
    .replace(/^./, (letter) => letter.toUpperCase());
};

export const PublicTransparencyPortalView: React.FC<Props> = ({
  draft, projects, contracts, estimates, guarantees, deficiencies, documents, onBack,
}) => {
  const selected = new Set(draft.selected);
  const execution = projects.filter((p) => p.status === 'EN_EJECUCION');
  const agreements = documents.filter((d) => d.type === 'CONVENIO');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al generador
          </button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-700">
                <FileSpreadsheet className="h-4 w-4" /> Portal público de transparencia
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Control Contractual</h1>
              <p className="mt-1 text-sm text-slate-500">Publicación mensual · {monthLabel(draft.month)}</p>
            </div>
            <div className="text-xs text-slate-400">Vista ciudadana · Solo contenido seleccionado</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {selected.has('projects') && (
          <Section title="Proyectos en ejecución" icon={FolderGit2}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {execution.map((p) => (
                <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-mono font-semibold text-blue-700">{p.code}</div>
                  <h2 className="mt-1 font-bold text-slate-950">{p.name}</h2>
                  <div className="mt-2 text-xs text-slate-500">{p.location}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Fact label="Avance físico" value={`${p.physicalProgress.toFixed(1)}%`} />
                    <Fact label="Presupuesto vigente" value={formatLempiras(p.revisedBudget)} />
                  </div>
                </article>
              ))}
              {execution.length === 0 && <Empty text="No hay proyectos en ejecución para este corte." />}
            </div>
          </Section>
        )}

        {selected.has('contracts') && (
          <Section title="Contratos" icon={FileSignature}>
            <Table
              headers={['Contrato','Contratista','Monto','Estado']}
              rows={contracts.slice(0,100).map((c) => [c.contractNumber, c.contractorName, formatLempiras(c.amount), c.statusLabel])}
            />
          </Section>
        )}

        {selected.has('agreements') && (
          <Section title="Convenios" icon={FileText}>
            <Table
              headers={['Documento','Proyecto','Fecha']}
              rows={agreements.slice(0,100).map((d) => {
                const p = projects.find((x) => x.id === d.projectId);
                return [d.title || d.fileName, p ? `${p.code} · ${p.name}` : 'Sin proyecto', formatDateSpanish(d.uploadDate)];
              })}
            />
          </Section>
        )}

        {selected.has('payments') && (
          <Section title="Pagos y estimaciones" icon={Receipt}>
            <Table
              headers={['Estimación','Proyecto','Monto bruto','Neto','Estado']}
              rows={estimates.slice(0,100).map((e) => {
                const p = projects.find((x) => x.id === e.projectId);
                return [`N.º ${e.estimateNumber}`, p?.code || '—', formatLempiras(e.grossAmount), formatLempiras(e.netPayable), e.paymentStatusLabel];
              })}
            />
          </Section>
        )}

        {selected.has('guarantees') && (
          <Section title="Garantías" icon={ShieldCheck}>
            <Table
              headers={['Tipo','Proyecto','Póliza','Vencimiento','Estado']}
              rows={guarantees.slice(0,100).map((g) => {
                const p = projects.find((x) => x.id === g.projectId);
                return [g.typeLabel, p?.code || '—', g.policyNumber || '—', formatDateSpanish(g.expiryDate), g.statusLabel];
              })}
            />
          </Section>
        )}

        {selected.has('deficiencies') && (
          <Section title="Deficiencias y seguimiento" icon={AlertTriangle}>
            <Table
              headers={['Proyecto','Deficiencia','Severidad','Estado']}
              rows={deficiencies.slice(0,100).map((d) => {
                const p = projects.find((x) => x.id === d.projectId);
                return [p?.code || '—', d.title, d.severity, d.statusLabel];
              })}
            />
          </Section>
        )}

        {selected.has('source_docs') && (
          <Section title="Documentos fuente" icon={FileText}>
            <Table
              headers={['Documento','Tipo','Proyecto','Fecha']}
              rows={documents.filter((d) => d.type !== 'FOTOGRAFIA' && d.type !== 'AUDIO').slice(0,100).map((d) => {
                const p = projects.find((x) => x.id === d.projectId);
                return [d.title || d.fileName, d.typeLabel, p?.code || '—', formatDateSpanish(d.uploadDate)];
              })}
            />
          </Section>
        )}

        {draft.selected.length === 0 && (
          <Empty text="No hay categorías seleccionadas para esta publicación." />
        )}
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ComponentType<{className?: string}>; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section>
    <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
      <Icon className="h-4 w-4 text-blue-700" />
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">{title}</h2>
    </div>
    {children}
  </section>
);

const Fact: React.FC<{label:string;value:string}> = ({label,value}) => (
  <div className="rounded-lg bg-slate-50 p-2">
    <div className="text-[10px] font-semibold uppercase text-slate-400">{label}</div>
    <div className="mt-1 font-semibold text-slate-800">{value}</div>
  </div>
);

const Empty: React.FC<{text:string}> = ({text}) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{text}</div>
);

const Table: React.FC<{headers:string[];rows:string[][]}> = ({headers,rows}) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table className="w-full min-w-[700px] text-left text-xs">
      <thead className="bg-slate-100 text-slate-600"><tr>{headers.map((h)=><th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} className="p-3 text-slate-700">{cell}</td>)}</tr>)}</tbody>
    </table>
    {rows.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Sin registros para publicar.</div>}
  </div>
);
