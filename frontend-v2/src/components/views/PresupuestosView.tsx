import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';
import { Project, BudgetAmendment, AppModule } from '../../types.ts';
import { formatLempiras, formatPercent, formatDateSpanish } from '../../services/calculationService.ts';
import { getBudgetAmendments } from '../../services/budgetService.ts';

interface PresupuestosViewProps {
  projects: Project[];
  amendments?: BudgetAmendment[];
  onNavigate: (module: AppModule, extra?: any) => void;
}

export const PresupuestosView: React.FC<PresupuestosViewProps> = ({
  projects,
  amendments: suppliedAmendments,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [amendments, setAmendments] = useState<BudgetAmendment[]>(suppliedAmendments || []);

  useEffect(() => {
    if (suppliedAmendments && suppliedAmendments.length > 0) {
      setAmendments(suppliedAmendments);
      return;
    }
    void getBudgetAmendments().then(setAmendments).catch((error) => {
      console.warn('No se pudieron cargar movimientos presupuestarios:', error);
      setAmendments([]);
    });
  }, [suppliedAmendments]);

  const totalAssigned = projects.reduce((acc, p) => acc + p.assignedBudget, 0);
  const totalRevised = projects.reduce((acc, p) => acc + p.revisedBudget, 0);
  const totalModifications = totalRevised - totalAssigned;
  const projectById = new Map<string, Project>(projects.map((project): [string, Project] => [project.id, project]));

  const filteredProjects = projects.filter((p) =>
    `${p.name} ${p.code} ${p.fundingSource}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="presupuestos-view-container" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#35b882]" />
            <span>Presupuesto y ampliaciones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta separada de asignación inicial, ampliaciones, reducciones y presupuesto vigente.
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#151e29] border border-[#2b3a4a] rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Presupuesto Inicial Asignado</div>
          <div className="text-lg font-bold text-white tabular-nums mt-1">{formatLempiras(totalAssigned)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Asignación inicial</div>
        </div>

        <div className="bg-[#151e29] border border-[#2b3a4a] rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Ampliaciones y reducciones</div>
          <div className="text-lg font-bold text-[#35b882] tabular-nums mt-1">{totalModifications >= 0 ? '+' : ''}{formatLempiras(Math.abs(totalModifications))}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{amendments.length} movimientos presupuestarios registrados</div>
        </div>

        <div className="bg-[#151e29] border border-[#2b3a4a] rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Presupuesto Vigente Total</div>
          <div className="text-lg font-bold text-[#c5a367] tabular-nums mt-1">{formatLempiras(totalRevised)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Asignación + movimientos aprobados</div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#151e29] border border-[#2b3a4a] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Presupuesto por proyecto
          </h3>
          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proyecto o fuente..."
              className="bg-[#0b1118] text-xs text-white rounded pl-8 pr-3 py-1.5 border border-[#2b3a4a] focus:outline-none focus:border-[#c5a367]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1118] text-slate-400 border-b border-[#2b3a4a]">
              <tr>
                <th className="p-2.5">Código</th>
                <th className="p-2.5">Proyecto</th>
                <th className="p-2.5">Fuente de Financiamiento</th>
                <th className="p-2.5">Presupuesto Inicial</th>
                <th className="p-2.5">Ampliaciones</th>
                <th className="p-2.5">Presupuesto Vigente</th>
                <th className="p-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172235] text-slate-300">
              {filteredProjects.map((p) => {
                const diff = p.revisedBudget - p.assignedBudget;
                return (
                  <tr key={p.id} className="hover:bg-[#152238]">
                    <td className="p-2.5 font-mono text-[#c5a367] font-semibold">{p.code}</td>
                    <td className="p-2.5 font-medium text-white">{p.shortName || p.name}</td>
                    <td className="p-2.5 text-slate-400">{p.fundingSource}</td>
                    <td className="p-2.5 tabular-nums">{formatLempiras(p.assignedBudget)}</td>
                    <td className="p-2.5 tabular-nums text-[#35b882]">
                      {diff > 0 ? `+${formatLempiras(diff)}` : 'L 0.00'}
                    </td>
                    <td className="p-2.5 font-bold text-white tabular-nums">{formatLempiras(p.revisedBudget)}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => onNavigate('proyectos', { projectId: p.id, tab: 'presupuesto' })}
                        className="text-xs text-[#c5a367] hover:underline"
                      >
                        Ver adendas
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Ampliaciones y movimientos aprobados</h3>
            <p className="mt-1 text-[11px] text-[#8f9fb1]">Cada movimiento conserva su referencia y documento de respaldo.</p>
          </div>
          <span className="text-[11px] text-[#8f9fb1]">{amendments.length} movimiento(s)</span>
        </div>
        {amendments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#2b3a4a] p-5 text-center text-xs text-[#8f9fb1]">
            No hay ampliaciones o reducciones registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-[#2b3a4a] text-[#8f9fb1]">
                <tr>
                  <th className="p-2">Proyecto</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Monto</th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Referencia</th>
                  <th className="p-2">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b3a4a]">
                {amendments.map((amendment) => {
                  const project = projectById.get(amendment.projectId);
                  const typeLabel = amendment.type === 'INCREMENTO' ? 'Ampliación' : amendment.type === 'REDUCCION' ? 'Reducción' : 'Transferencia';
                  const isIncrease = amendment.type === 'INCREMENTO';
                  return (
                    <tr key={amendment.id} className="hover:bg-[#1b2735]">
                      <td className="p-2 font-medium text-white">{project?.shortName || project?.name || 'Proyecto pendiente'}</td>
                      <td className="p-2 text-[#b4c0ce]">{typeLabel}</td>
                      <td className={`p-2 font-semibold tabular-nums ${isIncrease ? 'text-[#35b882]' : 'text-[#e07178]'}`}>
                        {isIncrease ? '+' : '-'}{formatLempiras(Math.abs(amendment.amount))}
                      </td>
                      <td className="p-2 text-[#b4c0ce]">{formatDateSpanish(amendment.approvalDate)}</td>
                      <td className="p-2 font-mono text-[11px] text-[#b4c0ce]">{amendment.agreementNumber || 'Sin referencia'}</td>
                      <td className="max-w-[260px] p-2 text-[#8f9fb1]">{amendment.reason || 'Sin motivo registrado'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
