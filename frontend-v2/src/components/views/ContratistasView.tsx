import React, { useMemo, useState } from 'react';
import { Building2, Search, ArrowRight, FileSignature } from 'lucide-react';
import type { Contract, Project } from '../../types.ts';
import { formatLempiras } from '../../services/calculationService.ts';
import { matchesSearch, normalizeSearch } from '../../services/searchService.ts';

interface ContratistasViewProps {
  contracts: Contract[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

interface ContractorSummary {
  key: string;
  name: string;
  rtn: string;
  representative: string;
  contractCount: number;
  activeCount: number;
  totalAmount: number;
  projectIds: string[];
}

/**
 * Los contratos históricos no siempre guardan el nombre legal con el mismo
 * formato. Esta clave sirve únicamente para consolidar la vista del directorio;
 * no modifica ni elimina los contratos productivos.
 */
const contractorNameKey = (value: string): string => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/&/g, ' Y ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();

  if (!normalized) return '';

  const tokens = normalized.split(/\s+/);
  // “Constructora” es un prefijo descriptivo que aparece solo en algunos
  // registros de la misma empresa.
  if (tokens.length > 1 && ['CONSTRUCTORA', 'CONSTRUCTOR'].includes(tokens[0])) {
    tokens.shift();
  }

  // Quita únicamente sufijos societarios, de derecha a izquierda. Así se
  // consideran iguales “S DE R L”, “S.DE R.L.” y “S DE RL”, sin afectar el
  // nombre real de la empresa.
  const legalTokens = new Set([
    'S',
    'R',
    'L',
    'RL',
    'SRL',
    'SA',
    'SAS',
    'LTDA',
    'LIMITADA',
    'DE',
  ]);
  while (tokens.length > 1 && legalTokens.has(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  return tokens.join('');
};

const contractorIdentity = (contract: Contract): string => {
  const nameKey = contractorNameKey(contract.contractorName || '');
  // El nombre normalizado permite unir un contrato histórico sin RTN con otro
  // del mismo contratista que sí tenga RTN. El RTN queda como respaldo cuando
  // el nombre aún no fue registrado.
  if (nameKey) return `name:${nameKey}`;

  const rtn = (contract.contractorRTN || '').replace(/[^0-9A-Z]/gi, '').toUpperCase();
  if (rtn) return `rtn:${rtn}`;

  return `name:${nameKey || 'POR_REGISTRAR'}`;
};

export const ContratistasView: React.FC<ContratistasViewProps> = ({ contracts, projects, onOpenProject }) => {
  const [search, setSearch] = useState('');

  const contractors = useMemo(() => {
    const map = new Map<string, ContractorSummary>();
    const seenContractIds = new Set<string>();
    for (const contract of contracts) {
      if (contract.id && seenContractIds.has(contract.id)) continue;
      if (contract.id) seenContractIds.add(contract.id);

      const key = contractorIdentity(contract);
      const current = map.get(key) || {
        key,
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
    const q = normalizeSearch(search);
    if (!q) return contractors;
    return contractors.filter((c) => matchesSearch(q, [c.name, c.rtn, c.representative]));
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

      <div className="text-[11px] text-slate-500">
        {search.trim() ? `${filtered.length} contratista(s) encontrado(s)` : `${contractors.length} contratista(s) consolidado(s) · ${contracts.length} contrato(s) conservado(s)`}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filtered.map((contractor) => {
          const linkedProjects = contractor.projectIds
            .map((projectId) => projects.find((project) => project.id === projectId))
            .filter((project): project is Project => Boolean(project));

          return (
            <div key={contractor.key} className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
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

              <div className="mt-4 border-t border-[#1f2e45] pt-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    {contractor.projectIds.length} proyecto(s) vinculado(s)
                  </span>
                  {linkedProjects.length > 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Todos los expedientes
                    </span>
                  )}
                </div>

                {linkedProjects.length > 0 ? (
                  <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
                    {linkedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#243247] bg-[#0b1220] px-2.5 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-semibold text-slate-200">
                            <span className="font-mono text-blue-300">{project.code}</span>
                            <span className="mx-1 text-slate-600">·</span>
                            {project.shortName || project.name}
                          </div>
                          <div className="truncate text-[10px] text-slate-500">{project.statusLabel}</div>
                        </div>
                        <button
                          onClick={() => onOpenProject(project.id)}
                          aria-label={`Abrir expediente ${project.code}`}
                          className="flex shrink-0 items-center gap-1 rounded-md bg-[#172235] px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-600 hover:text-white"
                        >
                          Abrir <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-600">Sin proyecto vinculado en el catálogo actual.</span>
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
