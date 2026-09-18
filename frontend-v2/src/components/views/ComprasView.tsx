import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Search, RefreshCw, AlertTriangle, FileCheck2 } from 'lucide-react';
import type { Project, AppModule } from '../../types.ts';
import { formatLempiras } from '../../services/calculationService.ts';
import { getProcurementAudit, type ProcurementAuditRecord } from '../../services/procurementService.ts';

interface ComprasViewProps {
  projects: Project[];
  onNavigate: (module: AppModule, extra?: any) => void;
}

export const ComprasView: React.FC<ComprasViewProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<ProcurementAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRecords(await getProcurementAudit());
    } catch (err: any) {
      setError(String(err?.message || 'No se pudo cargar la auditoría de contratación.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      `${r.code} ${r.name} ${r.procurementModeLabel || ''} ${r.gacetaNumber || ''} ${r.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [records, search]);

  return (
    <div id="compras-view-container" className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="pt-1">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <ShoppingBag className="h-5 w-5 text-amber-400" />
          Compras, Cotizaciones y Modalidad de Contratación
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Lectura del control de contratación registrado en la base productiva. No se muestran órdenes ficticias ni datos DEMO.
        </p>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3 md:p-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyecto, código, modalidad o referencia..."
            className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => void load()} className="rounded bg-amber-900/50 px-2 py-1 font-semibold hover:bg-amber-800/60">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
          Cargando control de contratación...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1f2e45] bg-[#111827]">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-[#1f2e45] bg-[#0b1220] text-slate-400">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Proyecto</th>
                <th className="p-3">Modalidad</th>
                <th className="p-3">Monto referencia</th>
                <th className="p-3">Marco / Gaceta</th>
                <th className="p-3">Control</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172235] text-slate-300">
              {filtered.map((record) => (
                <tr key={record.projectId} className="hover:bg-[#152238]">
                  <td className="p-3 font-mono font-semibold text-amber-400">{record.code}</td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{record.name}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{record.status || 'Estado por registrar'}</div>
                  </td>
                  <td className="p-3">
                    <span className="rounded border border-blue-800/60 bg-blue-950/40 px-2 py-1 text-[10px] font-semibold text-blue-300">
                      {record.procurementModeLabel || record.procurementModeOriginal || 'Pendiente de clasificar'}
                    </span>
                  </td>
                  <td className="p-3 font-semibold tabular-nums text-white">{formatLempiras(record.referenceAmount)}</td>
                  <td className="p-3">
                    <div>{record.gacetaNumber || 'Sin número registrado'}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{record.decreeReference || record.thresholdStatus || ''}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{record.auditStatus || record.snapshotIntegrity || 'Sin observación'}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onNavigate('proyectos', { projectId: record.projectId })}
                      className="rounded-lg bg-[#172235] px-3 py-1.5 font-medium text-blue-300 hover:bg-blue-600 hover:text-white"
                    >
                      Abrir proyecto
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No hay registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
