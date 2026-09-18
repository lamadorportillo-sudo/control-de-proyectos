import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertOctagon, Camera, FileText, History, ClipboardCheck, MapPin } from 'lucide-react';
import type { Deficiency, DocumentEvidence, Project } from '../../types.ts';
import { formatDateSpanish } from '../../services/calculationService.ts';
import { getEvidenceAccessUrl } from '../../services/evidenceAccessService.ts';

interface Props {
  deficiency: Deficiency;
  project?: Project;
  documents: DocumentEvidence[];
  onBack: () => void;
}

type Tab = 'resumen' | 'evidencia' | 'seguimiento' | 'documentos' | 'historial';

export const DeficiencyDetailView: React.FC<Props> = ({ deficiency, project, documents, onBack }) => {
  const [tab, setTab] = useState<Tab>('resumen');
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState('');

  const linked = useMemo(() => documents.filter((doc) =>
    doc.deficiencyId === deficiency.id ||
    (deficiency.linkedVisitId && doc.visitId === deficiency.linkedVisitId)
  ), [documents, deficiency.id, deficiency.linkedVisitId]);

  const evidence = linked.filter((doc) => doc.type === 'FOTOGRAFIA' || doc.type === 'AUDIO');
  const formalDocs = linked.filter((doc) => doc.type !== 'FOTOGRAFIA' && doc.type !== 'AUDIO');

  const openEvidence = async (id: string) => {
    setOpeningId(id);
    setOpenError('');
    try {
      const url = await getEvidenceAccessUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      setOpenError(String(error?.message || 'No fue posible abrir el archivo.'));
    } finally {
      setOpeningId(null);
    }
  };

  const tabs: Array<{id:Tab;label:string;count?:number}> = [
    { id:'resumen', label:'Resumen' },
    { id:'evidencia', label:'Evidencia', count:evidence.length },
    { id:'seguimiento', label:'Seguimiento', count:deficiency.history.length },
    { id:'documentos', label:'Documentos', count:formalDocs.length },
    { id:'historial', label:'Historial', count:deficiency.history.length },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-12">
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-0.5 rounded-lg border border-[#243247] bg-[#172235] p-2 text-slate-300 hover:text-white" aria-label="Volver a deficiencias"><ArrowLeft className="h-4 w-4"/></button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-red-800 bg-red-950/50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">{deficiency.severity}</span>
            <span className="rounded bg-[#172235] px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">{deficiency.statusLabel}</span>
            {project?.code && <span className="font-mono text-[10px] text-blue-300">{project.code}</span>}
          </div>
          <h2 className="mt-2 text-lg font-bold text-white">{deficiency.title}</h2>
          <p className="mt-1 text-xs text-slate-400">{project?.name || 'Proyecto no identificado'}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1f2e45] bg-[#111827] p-1.5">
        <div className="flex min-w-max gap-1">{tabs.map((item)=><button key={item.id} onClick={()=>setTab(item.id)} className={tab===item.id ? 'rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white' : 'rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-[#172235] hover:text-white'}>{item.label}{item.count !== undefined ? ' ('+item.count+')' : ''}</button>)}</div>
      </div>

      {openError && <div className="rounded-lg border border-amber-800/60 bg-amber-950/25 p-3 text-xs text-amber-200">{openError}</div>}

      {tab === 'resumen' && <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><AlertOctagon className="h-4 w-4 text-red-400"/>Problema</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Box label="Descripción" value={deficiency.description || 'Sin descripción.'} wide/>
          <Box label="Ubicación específica" value={deficiency.specificLocation || 'No registrada'} icon={MapPin}/>
          <Box label="Fecha reportada" value={formatDateSpanish(deficiency.reportedDate)}/>
          <Box label="Responsable" value={deficiency.responsibleContractor || 'No registrado'}/>
          <Box label="Fecha límite" value={deficiency.deadline ? formatDateSpanish(deficiency.deadline) : 'No registrada'}/>
          <Box label="Origen" value={deficiency.linkedVisitId ? 'Visita de obra vinculada' : 'Hallazgo técnico / control'}/>
        </div>
      </section>}

      {tab === 'evidencia' && <FileList title="Evidencia fotográfica y audio" icon={Camera} items={evidence} openingId={openingId} onOpen={openEvidence} empty="No hay fotografías o audios vinculados directamente a esta deficiencia."/>}

      {tab === 'seguimiento' && <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><ClipboardCheck className="h-4 w-4 text-amber-400"/>Seguimiento</h3>
        <Timeline items={deficiency.history}/>
        <div className="mt-4 rounded-lg border border-amber-800/50 bg-amber-950/20 p-3 text-[11px] text-amber-200">
          El registro de nuevos seguimientos permanece en solo lectura hasta conectar un flujo backend autorizado. No se escribirá sobre alertas administrativas desde el cliente.
        </div>
      </section>}

      {tab === 'documentos' && <FileList title="Documentos formales" icon={FileText} items={formalDocs} openingId={openingId} onOpen={openEvidence} empty="No hay documentos formales vinculados."/>}

      {tab === 'historial' && <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><History className="h-4 w-4 text-blue-400"/>Historial</h3>
        <Timeline items={deficiency.history}/>
      </section>}
    </div>
  );
};

const Box: React.FC<{label:string;value:string;wide?:boolean;icon?:React.ComponentType<{className?:string}>}> = ({label,value,wide,icon:Icon}) =>
  <div className={(wide ? 'md:col-span-2 ' : '') + 'rounded-lg border border-[#243247] bg-[#0b1220] p-3'}><div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{Icon && <Icon className="h-3 w-3"/>}{label}</div><div className="mt-1.5 text-xs leading-relaxed text-slate-200">{value}</div></div>;

const Timeline: React.FC<{items:Deficiency['history']}> = ({items}) => items.length ? <div className="space-y-2">{items.map((item,index)=><div key={item.timestamp+index} className="rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-white">{item.action}</strong><span className="text-[10px] text-slate-500">{formatDateSpanish(item.timestamp)}</span></div><div className="mt-1 text-[10px] text-slate-500">{item.user}</div>{item.comment && <p className="mt-2 text-xs text-slate-300">{item.comment}</p>}</div>)}</div> : <div className="rounded-lg border border-dashed border-[#243247] p-5 text-center text-xs text-slate-500">Sin eventos registrados.</div>;

const FileList: React.FC<{title:string;icon:React.ComponentType<{className?:string}>;items:DocumentEvidence[];openingId:string|null;onOpen:(id:string)=>Promise<void>;empty:string}> = ({title,icon:Icon,items,openingId,onOpen,empty}) =>
  <section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4"><h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><Icon className="h-4 w-4 text-blue-400"/>{title}</h3>{items.length ? <div className="space-y-2">{items.map((doc)=><div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="min-w-0"><div className="truncate text-xs font-semibold text-white">{doc.title || doc.fileName}</div><div className="mt-0.5 text-[10px] text-slate-500">{doc.typeLabel} · {formatDateSpanish(doc.uploadDate)}</div></div><button onClick={()=>void onOpen(doc.id)} disabled={openingId===doc.id} className="text-xs font-semibold text-blue-400 disabled:opacity-50">{openingId===doc.id?'Abriendo…':'Abrir'}</button></div>)}</div> : <div className="rounded-lg border border-dashed border-[#243247] p-5 text-center text-xs text-slate-500">{empty}</div>}</section>;
