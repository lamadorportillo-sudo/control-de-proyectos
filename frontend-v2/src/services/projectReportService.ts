import JSZip from 'jszip';
import type {
  AuditLog,
  Contract,
  Deficiency,
  DocumentEvidence,
  Estimate,
  FieldVisit,
  Guarantee,
  Project,
} from '../types.ts';
import { formatDateSpanish, formatLempiras, formatPercent } from './calculationService.ts';

export type ProjectReportType =
  | 'adjudicacion'
  | 'anticipo'
  | 'estimacion'
  | 'calidad'
  | 'final'
  | 'financiero'
  | 'contractual'
  | 'garantias'
  | 'visitas';

export interface ProjectReportOptions {
  paperSize: 'A4' | 'LETTER';
  orientation: 'portrait' | 'landscape';
  includeCover: boolean;
  includeEvidence: boolean;
  includeSignatures: boolean;
  estimateId?: string;
  visitId?: string;
}

export interface ProjectReportData {
  project: Project;
  contract?: Contract;
  estimates: Estimate[];
  guarantees: Guarantee[];
  deficiencies: Deficiency[];
  documents: DocumentEvidence[];
  visits: FieldVisit[];
  auditLogs: AuditLog[];
}

export interface ReportTypeDefinition {
  id: ProjectReportType;
  title: string;
  description: string;
}

export const REPORT_TYPES: ReportTypeDefinition[] = [
  { id: 'adjudicacion', title: 'Informe de adjudicación', description: 'Proyecto, presupuesto, contrato y soporte registrado.' },
  { id: 'anticipo', title: 'Informe de anticipo', description: 'Anticipo contractual, garantías y regla de amortización.' },
  { id: 'estimacion', title: 'Informe de estimación', description: 'Detalle de una estimación, deducciones y neto a pagar.' },
  { id: 'calidad', title: 'Informe de calidad de obra', description: 'Visitas, deficiencias, evidencia y seguimiento técnico.' },
  { id: 'final', title: 'Informe final del proyecto', description: 'Expediente integral técnico, financiero y contractual.' },
  { id: 'financiero', title: 'Informe financiero', description: 'Presupuesto, estimaciones, pagos, deducciones y saldos.' },
  { id: 'contractual', title: 'Informe contractual', description: 'Contrato, plazo, anticipo, garantías y documentos vinculados.' },
  { id: 'garantias', title: 'Informe de garantías y vigencias', description: 'Pólizas, montos, vencimientos y estados registrados.' },
  { id: 'visitas', title: 'Informe de visitas y observaciones', description: 'Seguimiento de campo, avances, instrucciones y fotografías.' },
];

const esc = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const text = (value: unknown, fallback = 'No registrado'): string => {
  const clean = String(value ?? '').trim();
  return clean ? esc(clean).replace(/\r?\n/g, '<br>') : fallback;
};

const plain = (value: unknown, fallback = 'No registrado'): string => {
  const clean = String(value ?? '').trim();
  return clean || fallback;
};

const money = (value: unknown): string => formatLempiras(Number(value) || 0);

const date = (value: unknown): string => {
  const clean = String(value ?? '').trim();
  return clean ? esc(formatDateSpanish(clean)) : 'No registrado';
};

const pct = (value: unknown): string => formatPercent(Number(value) || 0);

const dateTime = (): string => new Intl.DateTimeFormat('es-HN', {
  dateStyle: 'long',
  timeStyle: 'short',
}).format(new Date());

const typeTitle = (type: ProjectReportType): string =>
  REPORT_TYPES.find((item) => item.id === type)?.title || 'Informe del proyecto';

const emptyRow = (columns: number, message = 'No hay información registrada para este expediente.'): string =>
  `<tr><td colspan="${columns}" class="empty-cell">${esc(message)}</td></tr>`;

const table = (headers: string[], rows: string[], classes = ''): string => `
  <div class="report-table-wrap">
    <table class="report-table ${classes}">
      <thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join('')}</tr></thead>
      <tbody>${rows.length ? rows.join('') : emptyRow(headers.length)}</tbody>
    </table>
  </div>`;

const section = (title: string, content: string, subtitle = ''): string => `
  <section class="report-section">
    <div class="report-section-title"><h2>${esc(title)}</h2>${subtitle ? `<div class="report-section-subtitle">${esc(subtitle)}</div>` : ''}</div>
    ${content}
  </section>`;

const labelValueTable = (rows: Array<[string, string]>): string => table(
  ['Campo', 'Información registrada'],
  rows.map(([label, value]) => `<tr><th class="label-cell">${esc(label)}</th><td>${value}</td></tr>`),
  'label-value-table',
);

const projectOverview = (data: ProjectReportData): string => {
  const { project } = data;
  return section('Identificación del proyecto', labelValueTable([
    ['Código de planificación', text(project.planningCode)],
    ['Código de ejecución / contratación', text(project.executionCode)],
    ['Nombre del proyecto', text(project.name)],
    ['Ubicación', text(project.location || project.community)],
    ['Estado actual', text(project.statusLabel || project.status)],
    ['Unidad responsable', text(project.responsibleUnit)],
    ['Responsable registrado', text(project.responsiblePerson)],
    ['Fuente de financiamiento', text(project.fundingSource)],
    ['Presupuesto asignado', money(project.assignedBudget)],
    ['Presupuesto vigente', money(project.revisedBudget || project.assignedBudget)],
    ['Fecha de inicio registrada', date(project.startDate)],
    ['Fecha prevista de finalización', date(project.expectedEndDate)],
    ['Avance físico', pct(project.physicalProgress)],
    ['Avance financiero', pct(project.financialProgress)],
    ['Descripción / alcance', text(project.description)],
  ]), 'Datos tomados del expediente productivo vinculado al proyecto.');
};

const contractSection = (data: ProjectReportData): string => {
  const c = data.contract;
  if (!c) return section('Contrato y contratista', `<div class="report-note warning">No hay un contrato vinculado a este proyecto. El informe no inventa información contractual.</div>`);
  return section('Contrato y contratista', labelValueTable([
    ['Número de contrato', text(c.contractNumber)],
    ['Contratista', text(c.contractorName)],
    ['RTN del contratista', text(c.contractorRTN)],
    ['Representante', text(c.contractorRep)],
    ['Monto contractual', money(c.amount)],
    ['Fecha de firma', date(c.signedDate)],
    ['Plazo de ejecución', c.executionTermDays ? `${c.executionTermDays} días calendario` : 'No registrado'],
    ['Porcentaje de anticipo', pct(c.advancePercentage)],
    ['Monto del anticipo', money(c.advanceAmount)],
    ['Regla de amortización', text(c.advanceAmortizationRule)],
    ['Estado contractual', text(c.statusLabel || c.status)],
    ['Notas', text(c.notes)],
  ]), 'Información contractual registrada y vinculada al expediente.');
};

const advanceSection = (data: ProjectReportData): string => {
  const c = data.contract;
  if (!c) return section('Anticipo contractual', `<div class="report-note warning">No hay contrato registrado; no es posible emitir un control definitivo del anticipo.</div>`);
  return section('Anticipo contractual', labelValueTable([
    ['Contrato', text(c.contractNumber)],
    ['Porcentaje autorizado', pct(c.advancePercentage)],
    ['Monto del anticipo', money(c.advanceAmount)],
    ['Amortización contractual', text(c.advanceAmortizationRule)],
    ['Estado documentado', c.advanceAmount > 0 ? 'Monto de anticipo registrado en el contrato' : 'No se registró monto de anticipo'],
    ['Documentos del expediente', `${data.documents.filter((item) => /anticipo|orden.?pago|pago/i.test(`${item.title} ${item.fileName}`)).length} documento(s) relacionado(s)`],
  ]), 'La fecha de pago y los documentos de soporte se muestran únicamente cuando están registrados.');
};

const estimateRow = (estimate: Estimate): string => `<tr>
  <td class="cell-center">${esc(estimate.estimateNumber)}</td>
  <td>${date(estimate.periodStart)} – ${date(estimate.periodEnd)}</td>
  <td class="cell-number">${money(estimate.grossAmount)}</td>
  <td class="cell-number">${money(estimate.advanceAmortization)}</td>
  <td class="cell-number">${money(estimate.isrDeduction)}</td>
  <td class="cell-number">${money(estimate.complianceRetention)}</td>
  <td class="cell-number">${money(estimate.qualityRetention)}</td>
  <td class="cell-number">${money(estimate.otherDeductions)}</td>
  <td class="cell-number strong">${money(estimate.netPayable)}</td>
  <td>${text(estimate.paymentStatusLabel || estimate.paymentStatus)}</td>
</tr>`;

const financialSection = (data: ProjectReportData, selectedEstimate?: Estimate): string => {
  const estimates = selectedEstimate ? [selectedEstimate] : data.estimates;
  const gross = estimates.reduce((sum, item) => sum + (Number(item.grossAmount) || 0), 0);
  const net = estimates.reduce((sum, item) => sum + (Number(item.netPayable) || 0), 0);
  const deductions = gross - net;
  const summary = labelValueTable([
    ['Presupuesto vigente', money(data.project.revisedBudget || data.project.assignedBudget)],
    ['Monto contractual', data.contract ? money(data.contract.amount) : 'No registrado'],
    ['Estimaciones incluidas', String(estimates.length)],
    ['Monto bruto de estimaciones', money(gross)],
    ['Deducciones acumuladas', money(deductions)],
    ['Monto neto registrado', money(net)],
    ['Avance físico del proyecto', pct(data.project.physicalProgress)],
    ['Avance financiero del proyecto', pct(data.project.financialProgress)],
  ]);
  const detail = table(
    ['N.º', 'Periodo', 'Bruto', 'Anticipo', 'ISR', 'Cumplimiento', 'Calidad', 'Otras deducciones', 'Neto', 'Estado'],
    estimates.map(estimateRow),
    'financial-table',
  );
  return section(selectedEstimate ? `Estimación N.º ${selectedEstimate.estimateNumber}` : 'Resumen financiero', `${summary}${detail}`, selectedEstimate ? 'Detalle de la estimación seleccionada.' : 'Cálculos basados únicamente en las estimaciones cargadas en el expediente.');
};

const guaranteeSection = (data: ProjectReportData): string => {
  const rows = data.guarantees.map((item) => `<tr>
    <td>${text(item.typeLabel || item.type)}</td>
    <td>${text(item.issuer)}</td>
    <td>${text(item.policyNumber)}</td>
    <td class="cell-number">${money(item.amount)}</td>
    <td>${date(item.issueDate)}</td>
    <td>${date(item.expiryDate)}</td>
    <td>${text(item.statusLabel || item.status)}</td>
  </tr>`);
  return section('Garantías y vigencias', table(['Tipo', 'Emisor', 'Póliza', 'Monto', 'Emisión', 'Vencimiento', 'Estado'], rows, 'guarantee-table'), 'Se muestran las garantías vinculadas al proyecto; las ampliaciones o liberaciones solo aparecen si fueron registradas.');
};

const visitRow = (visit: FieldVisit): string => `<tr>
  <td>${date(visit.visitDate)}</td>
  <td>${text(visit.inspectorName)}</td>
  <td class="cell-center">${pct(visit.progressReported)}</td>
  <td>${text(visit.workCompleted)}</td>
  <td>${text(visit.weatherCondition)}</td>
  <td class="cell-center">${visit.staffCount || 0}</td>
  <td>${text(visit.equipmentOnSite)}</td>
</tr>`;

const visitsSection = (data: ProjectReportData, selectedVisit?: FieldVisit): string => {
  const visits = selectedVisit ? [selectedVisit] : data.visits;
  return section(selectedVisit ? 'Visita seleccionada' : 'Visitas y seguimiento de campo', table(['Fecha', 'Supervisor', 'Avance reportado', 'Trabajos ejecutados', 'Clima', 'Personal', 'Equipo en sitio'], visits.map(visitRow), 'visits-table'), selectedVisit ? 'Se imprimirá únicamente la visita seleccionada.' : 'Cada visita se mantiene como registro independiente del expediente.');
};

const deficienciesSection = (data: ProjectReportData): string => {
  const rows = data.deficiencies.map((item) => `<tr>
    <td>${text(item.title)}</td>
    <td>${text(item.specificLocation)}</td>
    <td>${text(item.description)}</td>
    <td>${text(item.severity)}</td>
    <td>${date(item.deadline)}</td>
    <td>${text(item.statusLabel || item.status)}</td>
  </tr>`);
  return section('Deficiencias y seguimiento', table(['Deficiencia', 'Ubicación', 'Descripción', 'Severidad', 'Fecha compromiso', 'Estado'], rows, 'deficiencies-table'), 'Las deficiencias se presentan como seguimiento técnico y no se eliminan del informe por estar cerradas.');
};

const documentsSection = (data: ProjectReportData): string => {
  const rows = data.documents.map((item) => `<tr>
    <td>${text(item.typeLabel || item.type)}</td>
    <td>${text(item.title || item.fileName)}</td>
    <td>${text(item.fileName)}</td>
    <td>${date(item.uploadDate)}</td>
    <td class="cell-center">${item.version || 1}</td>
  </tr>`);
  return section('Documentos fuente vinculados', table(['Tipo', 'Título', 'Archivo', 'Fecha', 'Versión'], rows, 'documents-table'));
};

const photoSection = (data: ProjectReportData, selectedVisit?: FieldVisit): string => {
  const visits = selectedVisit ? [selectedVisit] : data.visits;
  const photos = visits.flatMap((visit) => (visit.photoUrls || []).map((url, index) => ({ url, visit, index })));
  if (!photos.length) return section('Registro fotográfico', '<div class="report-note">No hay fotografías disponibles en las visitas incluidas.</div>');
  return section('Registro fotográfico', `<div class="photo-grid">${photos.map((photo) => `<figure><img src="${esc(photo.url)}" alt="Evidencia de visita"/><figcaption>Visita del ${date(photo.visit.visitDate)} · Fotografía ${photo.index + 1}</figcaption></figure>`).join('')}</div>`);
};

const auditSection = (data: ProjectReportData): string => {
  const rows = data.auditLogs
    .filter((log) => log.entityId === data.project.id || log.entityCode === data.project.code || String(log.details || '').toLowerCase().includes(data.project.code.toLowerCase()))
    .slice(0, 50)
    .map((log) => `<tr><td>${date(log.timestamp)}</td><td>${text(log.action)}</td><td>${text(log.user)}</td><td>${text(log.details)}</td></tr>`);
  return section('Historial y trazabilidad', table(['Fecha', 'Acción', 'Usuario', 'Detalle'], rows, 'audit-table'));
};

const signatures = (): string => `<div class="signatures">
  <div><span></span><b>Supervisor / responsable de proyectos</b></div>
  <div><span></span><b>Representante del contratista</b></div>
  <div><span></span><b>V.º B.º / autoridad competente</b></div>
</div>`;

const reportHeader = (data: ProjectReportData, type: ProjectReportType): string => `<header class="report-header">
  <div><div class="report-kicker">MUNICIPALIDAD DE SANTA MARÍA, LA PAZ</div><div class="report-unit">UNIDAD DE PROYECTOS · CONTROL CONTRACTUAL</div><h1>${esc(typeTitle(type))}</h1><p>${text(data.project.name)}</p></div>
  <div class="report-code"><b>${text(data.project.code)}</b><span>${esc(data.project.statusLabel || data.project.status)}</span></div>
</header>`;

export const reportCss = (options: ProjectReportOptions, scoped = false): string => {
  const prefix = scoped ? '.cc-report-preview ' : '';
  const size = options.paperSize === 'LETTER' ? 'letter' : 'A4';
  return `
@page{size:${size} ${options.orientation};margin:14mm 13mm}
${prefix}*{box-sizing:border-box}${prefix}body{margin:0;background:#fff;color:#1d2b36;font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.42;-webkit-print-color-adjust:exact;print-color-adjust:exact}${prefix}.report-shell{background:#fff;color:#1d2b36;max-width:100%;padding:0}${prefix}.report-cover{min-height:230mm;display:flex;flex-direction:column;justify-content:center;text-align:center;page-break-after:always;break-after:page;border:1px solid #d6dee5;padding:28mm 18mm}${prefix}.report-cover .crest{width:26mm;height:26mm;border:2px solid #3d6380;border-radius:50%;display:grid;place-items:center;margin:0 auto 9mm;color:#3d6380;font-weight:800;font-size:9pt}${prefix}.report-cover h1{font-size:21pt;color:#244766;margin:5mm 0 3mm}${prefix}.report-cover h2{font-size:15pt;color:#263c4c;margin:0 0 7mm}${prefix}.report-cover p{margin:2mm 0;color:#5d7180}${prefix}.report-cover .cover-meta{margin-top:18mm;padding-top:7mm;border-top:1px solid #cad6df;font-size:9pt}${prefix}.report-sheet{width:100%}${prefix}.report-header{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;border-bottom:3px solid #315f8c;padding-bottom:8px;margin-bottom:10px}${prefix}.report-kicker{font-size:8pt;font-weight:800;letter-spacing:.08em;color:#60778c}${prefix}.report-unit{font-size:8pt;color:#60778c;margin-top:2px}${prefix}.report-header h1{font-size:17pt;color:#244766;margin:5px 0 2px}${prefix}.report-header p{margin:0;font-size:11pt;font-weight:700;color:#263c4c}${prefix}.report-code{border:1px solid #b9c9d8;padding:8px 10px;min-width:145px;text-align:right}${prefix}.report-code b{display:block;font-size:10pt}${prefix}.report-code span{font-size:8pt;color:#607489}${prefix}.report-section{margin:12px 0 16px;break-inside:auto;page-break-inside:auto}${prefix}.report-section-title{border-left:4px solid #315f8c;padding-left:8px;margin:0 0 6px;break-after:avoid}${prefix}.report-section-title h2{font-size:11pt;color:#244766;margin:0;text-transform:uppercase;letter-spacing:.025em}${prefix}.report-section-subtitle{font-size:8.5pt;color:#6a7e8e;margin-top:2px}${prefix}.report-table-wrap{width:100%;overflow:visible}${prefix}.report-table{width:100%;border-collapse:collapse;margin:0 0 4px;table-layout:auto}${prefix}.report-table th,.report-table td{border:1px solid #aabccd;padding:6px 7px;vertical-align:top;overflow-wrap:anywhere}${prefix}.report-table th{background:#e9f0f6;color:#294760;font-size:8pt;text-align:left;text-transform:uppercase;letter-spacing:.02em}${prefix}.report-table td{font-size:9pt;background:#fff}${prefix}.report-table tbody tr:nth-child(even) td{background:#fafcfd}${prefix}.report-table .label-cell{width:29%;background:#eef4f8;text-transform:none;font-size:8.5pt}${prefix}.report-table .cell-number{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}${prefix}.report-table .cell-center{text-align:center}${prefix}.report-table .strong{font-weight:800}${prefix}.report-table .empty-cell{text-align:center;color:#697b89;padding:11px}${prefix}.report-note{border:1px solid #cbd8e1;background:#f7fafc;border-radius:6px;padding:10px;color:#4d6272}${prefix}.report-note.warning{border-color:#decf9e;background:#fffbea;color:#735b17}${prefix}.photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}${prefix}.photo-grid figure{margin:0;border:1px solid #bdcbd5;padding:5px;break-inside:avoid}${prefix}.photo-grid img{display:block;width:100%;height:43mm;object-fit:contain;background:#f5f7f9}${prefix}.photo-grid figcaption{font-size:7.5pt;color:#637889;margin-top:4px}${prefix}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:18mm;margin-top:18mm;break-inside:avoid;page-break-inside:avoid}${prefix}.signatures div{text-align:center;font-size:8pt;color:#334b5e}${prefix}.signatures span{display:block;border-top:1px solid #445b6c;margin-bottom:4px}${prefix}.report-footer{display:flex;justify-content:space-between;border-top:1px solid #cad6df;margin-top:13mm;padding-top:5px;font-size:7.5pt;color:#687b8d;break-inside:avoid}${prefix}.report-disclaimer{font-size:8pt;color:#6b7b87;margin:10px 0 0;padding:8px;background:#f6f8fa;border-left:3px solid #9eafbc}${prefix}@media print{${prefix}.report-cover{border:0}${prefix}.report-section{break-inside:auto}${prefix}.report-table tr{break-inside:avoid;page-break-inside:avoid}${prefix}.report-table thead{display:table-header-group}${prefix}.report-note,${prefix}.signatures{break-inside:avoid;page-break-inside:avoid}}`;
};

export function buildProjectReportBody(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions): string {
  const selectedEstimate = options.estimateId ? data.estimates.find((item) => item.id === options.estimateId) : undefined;
  const selectedVisit = options.visitId ? data.visits.find((item) => item.id === options.visitId) : undefined;
  const sections: string[] = [];

  if (type === 'final' || type === 'adjudicacion' || type === 'contractual' || type === 'financiero') sections.push(projectOverview(data));
  if (type === 'final' || type === 'adjudicacion' || type === 'contractual') sections.push(contractSection(data));
  if (type === 'anticipo') sections.push(projectOverview(data), advanceSection(data));
  if (type === 'estimacion') sections.push(projectOverview(data), financialSection(data, selectedEstimate));
  if (type === 'financiero') sections.push(financialSection(data));
  if (type === 'garantias') sections.push(projectOverview(data), guaranteeSection(data));
  if (type === 'visitas') sections.push(projectOverview(data), visitsSection(data, selectedVisit));
  if (type === 'calidad') sections.push(projectOverview(data), visitsSection(data, selectedVisit), deficienciesSection(data));
  if (type === 'contractual') sections.push(advanceSection(data), guaranteeSection(data), documentsSection(data));
  if (type === 'adjudicacion') sections.push(section('Soporte de adjudicación', `<div class="report-note">Este expediente V2 no contiene un módulo de ofertas económicas. El informe presenta únicamente la información de proyecto y contrato que sí está registrada, sin fabricar participantes ni resultados.</div>`));
  if (type === 'final') sections.push(financialSection(data), advanceSection(data), guaranteeSection(data), visitsSection(data), deficienciesSection(data), documentsSection(data), auditSection(data));

  if (options.includeEvidence && (type === 'final' || type === 'calidad' || type === 'visitas')) sections.push(photoSection(data, selectedVisit));

  const notice = `<div class="report-disclaimer">Documento generado desde Control Contractual con la información disponible en el expediente al ${esc(dateTime())}. Revise los datos y los documentos fuente antes de firmar o remitir oficialmente.</div>`;
  return `<div class="report-shell">${options.includeCover ? `<article class="report-cover"><div class="crest">SM</div><div class="report-kicker">MUNICIPALIDAD DE SANTA MARÍA, LA PAZ</div><h1>${esc(typeTitle(type))}</h1><h2>${text(data.project.name)}</h2><p>Código: <b>${text(data.project.code)}</b></p><p>${text(data.project.location || data.project.community)}</p><div class="cover-meta">Unidad de Proyectos · Control Contractual<br>Generado: ${esc(dateTime())}</div></article>` : ''}<article class="report-sheet">${reportHeader(data, type)}${sections.join('')}${notice}${options.includeSignatures ? signatures() : ''}<footer class="report-footer"><span>${text(data.project.code)}</span><span>Control Contractual · ${esc(typeTitle(type))}</span><span>Uso administrativo</span></footer></article></div>`;
}

export function buildStandaloneReportHtml(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions, bodyOverride?: string): string {
  const body = bodyOverride ?? buildProjectReportBody(data, type, options);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(typeTitle(type))} · ${esc(plain(data.project.code, 'Proyecto'))}</title><style>${reportCss(options)}</style></head><body>${body}<script>window.addEventListener('load',()=>{const images=[...document.images];Promise.race([Promise.all(images.map((image)=>image.complete?Promise.resolve():new Promise((resolve)=>{image.onload=image.onerror=resolve}))),new Promise((resolve)=>setTimeout(resolve,3500))]).then(()=>{if(new URLSearchParams(location.search).has('autoprint'))setTimeout(()=>window.print(),160);});});<\/script></body></html>`;
}

function safeFilePart(value: unknown): string {
  return plain(value, 'proyecto').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'proyecto';
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1800);
}

export function openProjectReportPrint(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions, bodyOverride?: string): boolean {
  const popup = window.open('', '_blank', 'width=1200,height=900');
  if (!popup) return false;
  try { popup.opener = null; } catch {}
  const printScript = `<script>window.addEventListener('load',()=>{const images=[...document.images];Promise.race([Promise.all(images.map((image)=>image.complete?Promise.resolve():new Promise((resolve)=>{image.onload=image.onerror=resolve}))),new Promise((resolve)=>setTimeout(resolve,3500))]).then(()=>setTimeout(()=>window.print(),160));});<\/script>`;
  popup.document.open();
  popup.document.write(buildStandaloneReportHtml(data, type, options, bodyOverride).replace('</body>', `${printScript}</body>`));
  popup.document.close();
  return true;
}

export function downloadProjectReportHtml(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions, bodyOverride?: string): void {
  const html = buildStandaloneReportHtml(data, type, options, bodyOverride);
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `informe-${safeFilePart(type)}-${safeFilePart(data.project.code)}.html`);
}

/**
 * Word abre este formato como documento compatible. Se conserva el diseño
 * completo (tablas, portada, fotografías y espacios de firma) sin depender de
 * una plantilla remota ni de un servidor de conversión.
 */
export function downloadProjectReportWord(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions, bodyOverride?: string): void {
  const html = buildStandaloneReportHtml(data, type, options, bodyOverride);
  downloadBlob(new Blob([`\ufeff${html}`], { type: 'application/msword' }), `informe-${safeFilePart(type)}-${safeFilePart(data.project.code)}.doc`);
}

export async function downloadProjectReportDocx(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions, bodyOverride?: string): Promise<void> {
  const html = buildStandaloneReportHtml(data, type, options, bodyOverride);
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="htm" ContentType="text/html"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:altChunk r:id="htmlChunk"/><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="737" w:bottom="850" w:left="737"/></w:sectPr></w:body></w:document>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="htmlChunk" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.htm"/></Relationships>`);
  zip.file('word/afchunk.htm', html);
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  downloadBlob(blob, `informe-${safeFilePart(type)}-${safeFilePart(data.project.code)}.docx`);
}
