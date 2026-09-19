import React, { useMemo, useState } from 'react';
import { ArrowLeft, Camera, AlertOctagon, FileText, History, ClipboardCheck, MapPin } from 'lucide-react';
import type { FieldVisit, Project, DocumentEvidence, Deficiency } from '../../types.ts';
import { formatDateSpanish, formatPercent } from '../../services/calculationService.ts';
import { downloadEvidenceFile, getEvidenceAccessUrl } from '../../services/evidenceAccessService.ts';

interface Props {
  visit: FieldVisit;
  project?: Project;
  documents: DocumentEvidence[];
  deficiencies: Deficiency[];
  onBack: () => void;
}

type Tab = 'resumen' | 'evidencia' | 'incidencias' | 'documentos' | 'historial';

export const VisitDetailView: React.FC<Props> = ({ visit, project, documents, deficiencies, onBack }) => {
  const [tab,setTab]=useState<Tab>('resumen');
  const [openingId,setOpeningId]=useState<string|null>(null);
  const [downloadingId,setDownloadingId]=useState<string|null>(null);
  const [openError,setOpenError]=useState('');

  const linkedDocs=useMemo(()=>documents.filter((d)=>d.visitId===visit.id),[documents,visit.id]);
  const evidence=linkedDocs.filter((d)=>d.type==='FOTOGRAFIA'||d.type==='AUDIO');
  const formal=linkedDocs.filter((d)=>d.type!=='FOTOGRAFIA'&&d.type!=='AUDIO');
  const incidents=useMemo(()=>deficiencies.filter((d)=>d.linkedVisitId===visit.id),[deficiencies,visit.id]);

  const openEvidence=async(id:string)=>{
    setOpeningId(id); setOpenError('');
    try{const url=await getEvidenceAccessUrl(id);window.open(url,'_blank','noopener,noreferrer');}
    catch(error:any){setOpenError(String(error?.message||'No fue posible abrir la evidencia.'));}
    finally{setOpeningId(null);}
  };

  const downloadEvidence=async(id:string)=>{
    setDownloadingId(id); setOpenError('');
    try{await downloadEvidenceFile(id);}
    catch(error:any){setOpenError(String(error?.message||'No fue posible descargar el archivo.'));}
    finally{setDownloadingId(null);}
  };

  const tabs:Array<{id:Tab;label:string;count?:number}>=[
    {id:'resumen',label:'Resumen'},
    {id:'evidencia',label:'Evidencia',count:evidence.length},
    {id:'incidencias',label:'Incidencias',count:incidents.length},
    {id:'documentos',label:'Documentos',count:formal.length},
    {id:'historial',label:'Historial'}
  ];

  return <div className="mx-auto max-w-6xl space-y-4 pb-12">
    <div className="flex items-start gap-3">
      <button onClick={onBack} className="mt-0.5 rounded-lg border border-[#243247] bg-[#172235] p-2 text-slate-300 hover:text-white" aria-label="Volver a visitas"><ArrowLeft className="h-4 w-4"/></button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">{formatDateSpanish(visit.visitDate)}</span>{project?.code&&<span className="font-mono text-[10px] text-blue-300">{project.code}</span>}</div>
        <h2 className="mt-2 text-lg font-bold text-white">Visita de obra</h2>
        <p className="mt-1 text-xs text-slate-400">{project?.name||'Proyecto no identificado'} · {visit.inspectorName||'Inspector no registrado'}</p>
      </div>
    </div>

    <div className="overflow-x-auto rounded-xl border border-[#1f2e45] bg-[#111827] p-1.5"><div className="flex min-w-max gap-1">{tabs.map((item)=><button key={item.id} onClick={()=>setTab(item.id)} className={tab===item.id?'rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-slate-950':'rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-[#172235] hover:text-white'}>{item.label}{item.count!==undefined?' ('+item.count+')':''}</button>)}</div></div>

    {openError&&<div className="rounded-lg border border-amber-800/60 bg-amber-950/25 p-3 text-xs text-amber-200">{openError}</div>}

    {tab==='resumen'&&<section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><ClipboardCheck className="h-4 w-4 text-amber-400"/>Resumen de visita</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Box label="Proyecto" value={project?project.code+' · '+project.name:'No identificado'} wide/>
        <Box label="Fecha" value={formatDateSpanish(visit.visitDate)}/>
        <Box label="Inspector" value={visit.inspectorName||'No registrado'}/>
        <Box label="Avance observado" value={formatPercent(visit.progressReported)}/>
        <Box label="Ubicación" value={visit.gpsCoords?.description||project?.location||'No registrada'} icon={MapPin}/>
        <Box label="Trabajos observados" value={visit.workCompleted||'Sin resumen registrado.'} wide/>
      </div>
    </section>}

    {tab==='evidencia'&&<Files title="Evidencia" icon={Camera} items={evidence} openingId={openingId} downloadingId={downloadingId} onOpen={openEvidence} onDownload={downloadEvidence} empty="No hay fotografías o audios vinculados a esta visita."/>}

    {tab==='incidencias'&&<section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><AlertOctagon className="h-4 w-4 text-red-400"/>Incidencias vinculadas</h3>
      {incidents.length?<div className="space-y-2">{incidents.map((d)=><div key={d.id} className="rounded-lg border border-red-900/50 bg-red-950/20 p-3"><div className="flex items-center justify-between gap-3"><strong className="text-xs text-white">{d.title}</strong><span className="text-[10px] font-bold uppercase text-red-300">{d.severity} · {d.statusLabel}</span></div><p className="mt-2 text-xs text-slate-300">{d.description}</p></div>)}</div>:<Empty text="No hay incidencias estructuradas vinculadas a esta visita."/>}
    </section>}

    {tab==='documentos'&&<Files title="Documentos formales" icon={FileText} items={formal} openingId={openingId} downloadingId={downloadingId} onOpen={openEvidence} onDownload={downloadEvidence} empty="No hay documentos formales vinculados a esta visita."/>}

    {tab==='historial'&&<section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><History className="h-4 w-4 text-blue-400"/>Historial</h3>
      <div className="rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="flex items-center justify-between gap-3"><strong className="text-xs text-white">Visita registrada</strong><span className="text-[10px] text-slate-500">{formatDateSpanish(visit.createdAt||visit.visitDate)}</span></div><div className="mt-1 text-[10px] text-slate-500">{visit.inspectorName||'Usuario'}</div></div>
    </section>}
  </div>;
};

const Box:React.FC<{label:string;value:string;wide?:boolean;icon?:React.ComponentType<{className?:string}>}>=({label,value,wide,icon:Icon})=><div className={(wide?'md:col-span-2 ':'')+'rounded-lg border border-[#243247] bg-[#0b1220] p-3'}><div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{Icon&&<Icon className="h-3 w-3"/>}{label}</div><div className="mt-1.5 text-xs leading-relaxed text-slate-200">{value}</div></div>;
const Empty:React.FC<{text:string}>=({text})=><div className="rounded-lg border border-dashed border-[#243247] p-5 text-center text-xs text-slate-500">{text}</div>;
const Files:React.FC<{title:string;icon:React.ComponentType<{className?:string}>;items:DocumentEvidence[];openingId:string|null;downloadingId:string|null;onOpen:(id:string)=>Promise<void>;onDownload:(id:string)=>Promise<void>;empty:string}>=({title,icon:Icon,items,openingId,downloadingId,onOpen,onDownload,empty})=><section className="rounded-xl border border-[#1f2e45] bg-[#111827] p-4"><h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><Icon className="h-4 w-4 text-blue-400"/>{title}</h3>{items.length?<div className="space-y-2">{items.map((doc)=><div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#243247] bg-[#0b1220] p-3"><div className="min-w-0"><div className="truncate text-xs font-semibold text-white">{doc.title||doc.fileName}</div><div className="mt-0.5 text-[10px] text-slate-500">{doc.typeLabel} · {formatDateSpanish(doc.uploadDate)}</div></div><div className="flex shrink-0 items-center gap-2"><button onClick={()=>void onOpen(doc.id)} disabled={openingId===doc.id||downloadingId===doc.id} className="text-xs font-semibold text-blue-400 disabled:opacity-50">{openingId===doc.id?'Abriendo…':'Abrir'}</button><button onClick={()=>void onDownload(doc.id)} disabled={openingId===doc.id||downloadingId===doc.id} className="rounded-lg border border-[#243247] px-2 py-1 text-[11px] font-semibold text-emerald-300 disabled:opacity-50">{downloadingId===doc.id?'Descargando…':'Descargar'}</button></div></div>)}</div>:<Empty text={empty}/>}</section>;
