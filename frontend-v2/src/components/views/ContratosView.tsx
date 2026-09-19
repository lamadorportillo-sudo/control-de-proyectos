import React, { useMemo, useState } from 'react';
import { FileSignature, Search, ArrowRight, Plus, X, Save } from 'lucide-react';
import type { Contract, Project } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';
import { dataRepository } from '../../services/backendAdapter.ts';

interface ContratosViewProps {
  contracts: Contract[];
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onSaved?: () => Promise<void> | void;
}

const norm = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const inputClass = 'w-full rounded-lg border border-[#243247] bg-[#0b1220] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500';

export const ContratosView: React.FC<ContratosViewProps> = ({ contracts, projects, onOpenProject, onSaved }) => {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    contractNumber: '',
    contractorName: '',
    contractorRTN: '',
    contractorRep: '',
    amount: '',
    signedDate: '',
    executionTermDays: '',
    advancePercentage: '0',
    notes: '',
  });

  const q = norm(query.trim());
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return contracts.filter((contract) => {
      const project = projects.find((p) => p.id === contract.projectId);
      return norm([contract.contractNumber, contract.contractorName, contract.contractorRTN, project?.code, project?.name, project?.location].filter(Boolean).join(' ')).includes(q);
    }).slice(0, 50);
  }, [contracts, projects, q]);

  const saveContract = async () => {
    if (!form.projectId || !form.contractNumber.trim() || !form.contractorName.trim() || Number(form.amount) <= 0) {
      setMessage('Completa proyecto, número de contrato, contratista y monto.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const amount = Number(form.amount);
      const advancePercentage = Math.max(0, Number(form.advancePercentage) || 0);
      const record: Contract = {
        id: crypto.randomUUID(),
        projectId: form.projectId,
        contractNumber: form.contractNumber.trim(),
        contractorName: form.contractorName.trim(),
        contractorRTN: form.contractorRTN.trim(),
        contractorRep: form.contractorRep.trim(),
        amount,
        signedDate: form.signedDate,
        executionTermDays: Math.max(0, Number(form.executionTermDays) || 0),
        advancePercentage,
        advanceAmount: amount * advancePercentage / 100,
        advanceAmortizationRule: 'ORIGINAL',
        isDraft: false,
        status: 'VIGENTE',
        statusLabel: 'Vigente',
        notes: form.notes.trim() || undefined,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      await dataRepository.saveContract(record);
      await onSaved?.();
      setMessage('Contrato guardado correctamente.');
      setForm({ projectId:'', contractNumber:'', contractorName:'', contractorRTN:'', contractorRep:'', amount:'', signedDate:'', executionTermDays:'', advancePercentage:'0', notes:'' });
      setShowCreate(false);
    } catch (error: any) {
      setMessage('No se pudo guardar: ' + String(error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><FileSignature className="h-5 w-5 text-blue-400" />Contratos y contratistas</h2>
          <p className="mt-1 text-xs text-slate-400">Busca un contrato o registra uno nuevo sin cargar todos los expedientes en pantalla.</p>
        </div>
        <button onClick={() => { setShowCreate(true); setMessage(''); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"><Plus className="h-4 w-4" />Crear nuevo</button>
      </div>

      {message && <div className="rounded-lg border border-[#243247] bg-[#111827] p-3 text-xs text-slate-300">{message}</div>}

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

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true" aria-label="Crear contrato">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#243247] bg-[#111827] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#243247] bg-[#111827] px-4 py-3">
              <div><div className="text-sm font-bold text-white">Registrar contrato</div><div className="text-[10px] text-slate-500">Guardado protegido por Auth y RLS.</div></div>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-[#172235] hover:text-white" aria-label="Cerrar"><X className="h-4 w-4"/></button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <Field label="Proyecto" wide><select value={form.projectId} onChange={(e)=>setForm({...form,projectId:e.target.value})} className={inputClass}><option value="">Seleccionar proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.shortName || p.name}</option>)}</select></Field>
              <Field label="Número de contrato"><input value={form.contractNumber} onChange={(e)=>setForm({...form,contractNumber:e.target.value})} className={inputClass}/></Field>
              <Field label="Contratista"><input value={form.contractorName} onChange={(e)=>setForm({...form,contractorName:e.target.value})} className={inputClass}/></Field>
              <Field label="RTN"><input value={form.contractorRTN} onChange={(e)=>setForm({...form,contractorRTN:e.target.value})} className={inputClass}/></Field>
              <Field label="Representante"><input value={form.contractorRep} onChange={(e)=>setForm({...form,contractorRep:e.target.value})} className={inputClass}/></Field>
              <Field label="Monto contractual"><input type="number" min="0" step="0.01" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} className={inputClass}/></Field>
              <Field label="Fecha de firma"><input type="date" value={form.signedDate} onChange={(e)=>setForm({...form,signedDate:e.target.value})} className={inputClass}/></Field>
              <Field label="Plazo (días)"><input type="number" min="0" value={form.executionTermDays} onChange={(e)=>setForm({...form,executionTermDays:e.target.value})} className={inputClass}/></Field>
              <Field label="Anticipo (%)"><input type="number" min="0" max="100" step="0.01" value={form.advancePercentage} onChange={(e)=>setForm({...form,advancePercentage:e.target.value})} className={inputClass}/></Field>
              <Field label="Notas" wide><textarea rows={3} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} className={inputClass}/></Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#243247] p-4">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-300">Cancelar</button>
              <button onClick={() => void saveContract()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4"/>{saving ? 'Guardando…' : 'Guardar contrato'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{label:string;children:React.ReactNode;wide?:boolean}> = ({label,children,wide}) => <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
