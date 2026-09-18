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

  const filteredProjects = projects.filter((p) =>
    `${p.name} ${p.code} ${p.fundingSource}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="presupuestos-view-container" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Presupuesto Municipal de Inversión y Obras</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Asignaciones iniciales, convenios modificatorios y control de techos presupuestarios
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Presupuesto Inicial Asignado</div>
          <div className="text-lg font-bold text-white tabular-nums mt-1">{formatLempiras(totalAssigned)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Techo base contractual</div>
        </div>

        <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Modificaciones / Convenios</div>
          <div className="text-lg font-bold text-emerald-400 tabular-nums mt-1">+{formatLempiras(totalModifications)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{amendments.length} convenios modificatorios aprobados</div>
        </div>

        <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Presupuesto Vigente Total</div>
          <div className="text-lg font-bold text-blue-400 tabular-nums mt-1">{formatLempiras(totalRevised)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Compromiso municipal activo</div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#111827] border border-[#1f2e45] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Detalle por Proyecto de Obra
          </h3>
          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proyecto o fuente..."
              className="bg-[#0b1220] text-xs text-white rounded pl-8 pr-3 py-1.5 border border-[#243247] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1220] text-slate-400 border-b border-[#1f2e45]">
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
                    <td className="p-2.5 font-mono text-blue-400 font-semibold">{p.code}</td>
                    <td className="p-2.5 font-medium text-white">{p.shortName || p.name}</td>
                    <td className="p-2.5 text-slate-400">{p.fundingSource}</td>
                    <td className="p-2.5 tabular-nums">{formatLempiras(p.assignedBudget)}</td>
                    <td className="p-2.5 tabular-nums text-emerald-400">
                      {diff > 0 ? `+${formatLempiras(diff)}` : 'L 0.00'}
                    </td>
                    <td className="p-2.5 font-bold text-white tabular-nums">{formatLempiras(p.revisedBudget)}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => onNavigate('proyectos', { projectId: p.id, tab: 'presupuesto' })}
                        className="text-xs text-blue-400 hover:underline"
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
    </div>
  );
};
