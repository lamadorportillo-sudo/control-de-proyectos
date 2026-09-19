import React, { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, CheckSquare2, Square, PackageCheck, CalendarDays } from 'lucide-react';
import type { Project, Contract, Estimate, Guarantee, Deficiency, DocumentEvidence } from '../../types.ts';
import { getTransparencySourceCounts } from '../../services/transparencyMetricsService.ts';

interface TransparenciaViewProps {
  onPreviewPublic?: (draft: { month: string; selected: string[] }) => void;
  projects: Project[];
  contracts: Contract[];
  estimates: Estimate[];
  guarantees: Guarantee[];
  deficiencies: Deficiency[];
  documents: DocumentEvidence[];
}

const CATEGORIES = [
  { id: 'projects', label: 'Proyectos en ejecución' },
  { id: 'contracts', label: 'Contratos' },
  { id: 'agreements', label: 'Convenios' },
  { id: 'procurement', label: 'Licitaciones y cotizaciones' },
  { id: 'purchases', label: 'Compras' },
  { id: 'payments', label: 'Pagos y estimaciones' },
  { id: 'certificates', label: 'Constancias' },
  { id: 'source_docs', label: 'Documentos fuente' },
  { id: 'guarantees', label: 'Garantías' },
  { id: 'deficiencies', label: 'Deficiencias y seguimiento' },
  { id: 'monthly_reports', label: 'Reportes mensuales' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

export const TransparenciaView: React.FC<TransparenciaViewProps> = ({ projects, contracts, estimates, guarantees, deficiencies, documents, onPreviewPublic }) => {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [selected, setSelected] = useState<CategoryId[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [format, setFormat] = useState<'PORTAL_WEB' | 'PDF' | 'ZIP'>('PORTAL_WEB');
  const [sourceCounts, setSourceCounts] = useState({ agreements: 0, procurement: 0 });

  useEffect(() => {
    void getTransparencySourceCounts()
      .then(setSourceCounts)
      .catch((error) => console.warn('Fuentes de transparencia:', error));
  }, []);

  const toggle = (id: CategoryId) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const counts = useMemo<Record<CategoryId, number>>(() => ({
    projects: projects.filter((p) => p.status === 'EN_EJECUCION').length,
    contracts: contracts.length,
    agreements: sourceCounts.agreements,
    procurement: sourceCounts.procurement,
    purchases: 0,
    payments: estimates.length,
    certificates: 0,
    source_docs: documents.length,
    guarantees: guarantees.length,
    deficiencies: deficiencies.length,
    monthly_reports: 0,
  }), [projects, contracts, estimates, guarantees, deficiencies, documents, sourceCounts]);

  const generate = () => {
    if (selected.length === 0) return;
    setGeneratedAt(new Date().toISOString());
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white"><FileSpreadsheet className="h-5 w-5 text-amber-400" />Generador del Portal de Transparencia</h2>
        <p className="mt-1 text-xs text-slate-400">Selecciona únicamente lo que debe publicarse. Esta pantalla no es un dashboard ni carga listados completos.</p>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mes del portal</label>
            <div className="mt-2 flex max-w-xs items-center gap-2 rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setGeneratedAt(null); }} className="w-full bg-transparent text-xs text-white outline-none" />
            </div>
          </div>
          <button
            onClick={() => {
              const now = new Date();
              setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
              setSelected([]);
              setGeneratedAt(null);
            }}
            className="rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1f2e45]"
          >
            Nuevo mes
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-xs font-bold uppercase tracking-wider text-white">Categorías a publicar</h3><p className="mt-1 text-[11px] text-slate-500">Solo se incluirán las categorías marcadas.</p></div><button onClick={() => setSelected(selected.length === CATEGORIES.length ? [] : CATEGORIES.map((c) => c.id))} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300">{selected.length === CATEGORIES.length ? 'Quitar todas' : 'Seleccionar todas'}</button></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORIES.map((category) => {
            const active = selected.includes(category.id);
            return (
              <button key={category.id} onClick={() => { toggle(category.id); setGeneratedAt(null); }} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${active ? 'border-blue-700 bg-blue-950/25' : 'border-[#243247] bg-[#0b1220] hover:border-[#334155]'}`}>
                <div className="flex min-w-0 items-center gap-2">{active ? <CheckSquare2 className="h-4 w-4 shrink-0 text-blue-400" /> : <Square className="h-4 w-4 shrink-0 text-slate-500" />}<span className="text-xs font-semibold text-slate-200">{category.label}</span></div>
                <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] tabular-nums text-slate-400">{counts[category.id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Formato de salida</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ['PORTAL_WEB', 'Portal web'],
            ['PDF', 'PDF'],
            ['ZIP', 'ZIP'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setFormat(id as 'PORTAL_WEB' | 'PDF' | 'ZIP'); setGeneratedAt(null); }}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                format === id
                  ? 'border-blue-600 bg-blue-950/40 text-blue-300'
                  : 'border-[#243247] bg-[#0b1220] text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#1f2e45] bg-[#111827] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-400">
          <strong className="text-white">{selected.length}</strong> categoría(s) seleccionada(s) para <strong className="text-white">{month || 'mes no definido'}</strong> · <strong className="text-white">{format === 'PORTAL_WEB' ? 'Portal web' : format}</strong>.
        </div>
        <button disabled={selected.length === 0 || !month} onClick={generate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"><PackageCheck className="h-4 w-4" />Generar vista seleccionada</button>
      </div>

      {generatedAt && (
        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Portal preparado para revisión</h3>
          <p className="mt-1 text-[11px] text-slate-400">La V2 respeta exactamente la selección: no añade KPIs ni categorías no marcadas. Formato preparado: <strong className="text-slate-200">{format === 'PORTAL_WEB' ? 'Portal web' : format}</strong>. La publicación final seguirá usando el backend productivo existente.</p>
          <div className="mt-3 flex flex-wrap gap-2">{selected.map((id) => <span key={id} className="rounded bg-emerald-950/50 px-2 py-1 text-[10px] font-semibold text-emerald-200">{CATEGORIES.find((c) => c.id === id)?.label}</span>)}</div>
          {format === 'PORTAL_WEB' && onPreviewPublic && (
            <button
              onClick={() => onPreviewPublic({ month, selected: [...selected] })}
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              Abrir vista pública
            </button>
          )}
        </div>
      )}
    </div>
  );
};
