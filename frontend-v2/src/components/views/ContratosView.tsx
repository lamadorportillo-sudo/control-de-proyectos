import React, { useMemo, useState } from 'react';
import { FileSignature, Search, ArrowRight, Plus } from 'lucide-react';
import type { Contract, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';

interface ContratosViewProps {
  contracts: Contract[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const ContratosView: React.FC<ContratosViewProps> = ({ contracts, projects, onOpenProject }) => {
  const [query, setQuery] = useState('');
  const q = norm(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return contracts.filter((contract) => {
      const project = projects.find((p) => p.id === contract.projectId);
      return norm([contract.contractNumber, contract.contractorName, contract.contractorRTN, project?.code, project?.name, project?.location].filter(Boolean).join(' ')).includes(q);
    }).slice(0, 50);
  }, [contracts, projects, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><FileSignature className="h-5 w-5 text-blue-400" />Contratos y contratistas</h2>
          <p className="mt-1 text-xs text-slate-400">Busca un contrato o contratista. No se listan todos los expedientes automáticamente.</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 rounded-lg border border-[#243247] bg-[#172235] px-3 py-2 text-xs font-semibold text-slate-500" title="Se habilitará cuando la escritura RLS/RPC quede validada"><Plus className="h-4 w-4" />Crear nuevo</button>
      </div>

      <div className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Contrato, contratista, RTN, código o nombre del proyecto…" className="w-full rounded-lg border border-[#243247] bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500" />
        </div>
        <div className="mt-2 text-[11px] text-slate-500">{q.length < 2 ? 'Escribe al menos 2 caracteres.' : `${results.length} coincidencia(s).`}</div>
      </div>

      <div className="space-y-3">
        {results.map((contract) => {
          const project = projects.find((p) => p.id === contract.projectId);
          return (
            <button key={contract.id} onClick={() => onOpenProject(contract.projectId)} className="group w-full rounded-xl border border-[#1f2e45] bg-[#111827] p-4 text-left hover:border-blue-700 hover:bg-[#131d2f]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-blue-950/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">{contract.contractNumber || 'SIN NÚMERO'}</span><span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{contract.statusLabel}</span></div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{contract.contractorName || 'Contratista no registrado'}</h3>
                  <div className="mt-1 text-xs text-slate-400">{project?.code} · {project?.name}</div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400"><span>Monto: <strong className="text-slate-200">{formatLempiras(contract.amount)}</strong></span><span>Firma: <strong className="text-slate-200">{formatDateSpanish(contract.signedDate)}</strong></span><span>Plazo: <strong className="text-slate-200">{contract.executionTermDays || 0} días</strong></span></div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-blue-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
