import React, { useMemo, useState } from 'react';
import { Building2, Search, ArrowRight, FileSignature } from 'lucide-react';
import type { Contract, Project } from '../../types.ts';
import { formatLempiras } from '../../services/calculationService.ts';

interface ContratistasViewProps {
  contracts: Contract[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

interface ContractorSummary {
  name: string;
  rtn: string;
  representative: string;
  contractCount: number;
  activeCount: number;
  totalAmount: number;
  projectIds: string[];
}

export const ContratistasView: React.FC<ContratistasViewProps> = ({ contracts, projects, onOpenProject }) => {
  const [search, setSearch] = useState('');

  const contractors = useMemo(() => {
    const map = new Map<string, ContractorSummary>();
    for (const contract of contracts) {
      const key = (contract.contractorRTN || contract.contractorName).trim().toLowerCase();
      const current = map.get(key) || {
        name: contract.contractorName || 'Contratista por registrar',
        rtn: contract.contractorRTN || '',
        representative: contract.contractorRep || '',
        contractCount: 0,
        activeCount: 0,
        totalAmount: 0,
        projectIds: [],
      };
      current.contractCount += 1;
      current.totalAmount += contract.amount || 0;
      if (contract.status === 'VIGENTE' || contract.status === 'MODIFICADO') current.activeCount += 1;
      if (contract.projectId && !current.projectIds.includes(contract.projectId)) current.projectIds.push(contract.projectId);
      if (!current.representative && contract.contractorRep) current.representative = contract.contractorRep;
      if (!current.rtn && contract.contractorRTN) current.rtn = contract.contractorRTN;
      map.set(key, current);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [contracts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contractors;
    return contractors.filter((c) =>
      `${c.name} ${c.rtn} ${c.representative}`.toLowerCase().includes(q)
    );
  }, [contractors, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="pt-1">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Building2 className="h-5 w-5 text-blue-400" />
          Contratistas
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Directorio consolidado directamente desde los contratos productivos, sin duplicar contratistas por proyecto.
        </p>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-3">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contratista, RTN o representante..."
            className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filtered.map((contractor) => {
          const firstProject = projects.find((p) => contractor.projectIds.includes(p.id));
          return (
            <div key={contractor.rtn || contractor.name} className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">{contractor.name}</div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    RTN: <span className="font-mono text-slate-300">{contractor.rtn || 'Por registrar'}</span>
                  </div>
                  {contractor.representative && (
                    <div className="mt-0.5 text-[11px] text-slate-500">Representante: {contractor.representative}</div>
                  )}
                </div>
                <FileSignature className="h-5 w-5 shrink-0 text-blue-400" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric label="Contratos" value={String(contractor.contractCount)} />
                <Metric label="Activos" value={String(contractor.activeCount)} />
                <Metric label="Monto acumulado" value={formatLempiras(contractor.totalAmount)} compact />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#1f2e45] pt-3">
                <span className="text-[11px] text-slate-500">
                  {contractor.projectIds.length} proyecto(s) vinculado(s)
                </span>
                {firstProject && (
                  <button
                    onClick={() => onOpenProject(firstProject.id)}
                    className="flex items-center gap-1 rounded-lg bg-[#172235] px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-600 hover:text-white"
                  >
                    Abrir expediente <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-[#243247] p-10 text-center text-sm text-slate-500">
            No hay contratistas que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; compact?: boolean }> = ({ label, value, compact }) => (
  <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-2.5">
    <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className={`mt-1 font-bold text-white ${compact ? 'text-[11px]' : 'text-sm'}`}>{value}</div>
  </div>
);
