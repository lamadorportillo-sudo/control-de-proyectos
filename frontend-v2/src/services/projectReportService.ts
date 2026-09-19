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
  includeCharts: boolean;
  includeProcessGuide: boolean;
  compactLayout: boolean;
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

const executiveSummary = (data: ProjectReportData): string => {
  const { project } = data;
  const physical = Number(project.physicalProgress) || 0;
  const financial = Number(project.financialProgress) || 0;
  const delta = physical - financial;
  const budget = Number(project.revisedBudget || project.assignedBudget) || 0;
  const contractAmount = data.contract ? Number(data.contract.amount) || 0 : 0;
  const progress = (label: string, value: number, tone: 'blue' | 'gold' = 'blue') => `
    <div class="report-progress-row">
      <div class="report-progress-head"><span>${esc(label)}</span><b>${pct(value)}</b></div>
      <div class="report-progress-track"><span class="report-progress-fill ${tone}" style="width:${Math.max(0, Math.min(100, value))}%"></span></div>
    </div>`;
  const metric = (label: string, value: string, note = '') => `
    <div class="report-metric">
      <div class="report-metric-label">${esc(label)}</div>
      <div class="report-metric-value">${value}</div>
      ${note ? `<div class="report-metric-note">${esc(note)}</div>` : ''}
    </div>`;
  const control = (label: string, value: string, ok: boolean) => `
    <div class="report-control-item">
      <span class="report-control-dot ${ok ? 'ok' : 'pending'}"></span>
      <div><b>${esc(label)}</b><small>${esc(value)}</small></div>
    </div>`;

  const differenceNote = Math.abs(delta) >= 10
    ? `<div class="report-note warning"><b>Punto de control:</b> existe una diferencia de ${Math.abs(delta).toFixed(2)} puntos porcentuales entre el avance físico y el financiero. Debe revisarse junto con estimaciones, pagos y evidencia de campo antes de emitir conclusiones.</div>`
    : `<div class="report-note"><b>Lectura de avance:</b> la diferencia entre el avance físico y el financiero es de ${Math.abs(delta).toFixed(2)} puntos porcentuales, según los valores registrados en el expediente.</div>`;

  return section('Resumen ejecutivo', `
    <div class="report-summary-grid">
      ${metric('Avance físico', pct(physical), 'Ejecución registrada')}
      ${metric('Avance financiero', pct(financial), 'Ejecución financiera')}
      ${metric('Presupuesto vigente', money(budget), 'Base presupuestaria')}
      ${metric('Monto contractual', data.contract ? money(contractAmount) : 'No registrado', data.contract ? 'Contrato vinculado' : 'Pendiente de vínculo')}
    </div>
    <div class="report-progress-grid">
      ${progress('Avance físico', physical, 'blue')}
      ${progress('Avance financiero', financial, 'gold')}
    </div>
    <div class="report-control-grid">
      ${control('Contrato', data.contract ? 'Vinculado al expediente' : 'No registrado', Boolean(data.contract))}
      ${control('Garantías', `${data.guarantees.length} registro(s)`, data.guarantees.length > 0)}
      ${control('Visitas de campo', `${data.visits.length} registro(s)`, data.visits.length > 0)}
      ${control('Documentos fuente', `${data.documents.length} archivo(s)`, data.documents.length > 0)}
      ${control('Deficiencias', `${data.deficiencies.length} registro(s) de seguimiento`, true)}
      ${control('Estimaciones', `${data.estimates.length} registro(s)`, data.estimates.length > 0)}
    </div>
    ${differenceNote}
  `, 'Lectura rápida del estado técnico, financiero y documental con información existente en el expediente.');
};


const normalizedStatus = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase();

const isResolvedDeficiency = (item: Deficiency): boolean => {
  const value = normalizedStatus(item.statusLabel || item.status);
  return /cerrad|resuelt|subsanad|corregid|finaliz/.test(value);
};

const progressChartsSection = (data: ProjectReportData): string => {
  const physical = Math.max(0, Math.min(100, Number(data.project.physicalProgress) || 0));
  const financial = Math.max(0, Math.min(100, Number(data.project.financialProgress) || 0));
  const recentVisits = [...data.visits]
    .filter((visit) => Number.isFinite(Number(visit.progressReported)))
    .slice(-8);
  const maxVisit = Math.max(100, ...recentVisits.map((visit) => Number(visit.progressReported) || 0));

  const visitBars = recentVisits.length
    ? `<div class="report-mini-chart">
        <div class="report-chart-title">Tendencia de avance reportado en visitas</div>
        <div class="report-column-chart">
          ${recentVisits.map((visit) => {
            const value = Math.max(0, Number(visit.progressReported) || 0);
            const height = maxVisit ? Math.max(4, (value / maxVisit) * 100) : 4;
            return `<div class="report-column-item">
              <div class="report-column-value">${pct(value)}</div>
              <div class="report-column-track"><span style="height:${height}%"></span></div>
              <div class="report-column-label">${date(visit.visitDate)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`
    : '<div class="report-note">Aún no hay suficientes registros de visita para mostrar tendencia de avance.</div>';

  return section('Gráficos de seguimiento', `
    <div class="report-chart-grid">
      <div class="report-mini-chart">
        <div class="report-chart-title">Comparativo de avance actual</div>
        <div class="report-bar-row"><span>Físico</span><div class="report-bar-track"><i style="width:${physical}%"></i></div><b>${pct(physical)}</b></div>
        <div class="report-bar-row"><span>Financiero</span><div class="report-bar-track gold"><i style="width:${financial}%"></i></div><b>${pct(financial)}</b></div>
        <div class="report-chart-caption">La diferencia actual es de ${Math.abs(physical - financial).toFixed(2)} puntos porcentuales.</div>
      </div>
      ${visitBars}
    </div>
  `, 'Visualización rápida para comparar avance y evolución registrada en campo.');
};

const processGuideSection = (data: ProjectReportData): string => {
  const status = normalizedStatus(data.project.statusLabel || data.project.status);
  const projectClosed = /terminad|finaliz|cerrad|recepcionad/.test(status);
  const openDeficiencies = data.deficiencies.filter((item) => !isResolvedDeficiency(item));
  const gap = Math.abs((Number(data.project.physicalProgress) || 0) - (Number(data.project.financialProgress) || 0));

  const stages = [
    ['Expediente base', Boolean(data.project.code || data.project.name), 'Identificación y datos generales'],
    ['Contrato', Boolean(data.contract), data.contract ? 'Contrato vinculado' : 'Sin contrato vinculado'],
    ['Garantías', data.guarantees.length > 0, data.guarantees.length ? `${data.guarantees.length} registro(s)` : 'Sin registros'],
    ['Seguimiento de campo', data.visits.length > 0, data.visits.length ? `${data.visits.length} visita(s)` : 'Sin visitas registradas'],
    ['Estimaciones', data.estimates.length > 0, data.estimates.length ? `${data.estimates.length} registro(s)` : 'Sin estimaciones'],
    ['Cierre', projectClosed, projectClosed ? 'Proyecto en estado de cierre/finalizado' : 'Proceso aún activo'],
  ] as Array<[string, boolean, string]>;

  const actions: string[] = [];
  if (!data.contract) actions.push('Revisar si corresponde vincular o registrar el contrato del proyecto.');
  if (!data.guarantees.length) actions.push('Verificar si corresponde registrar garantías o pólizas asociadas.');
  if (!data.visits.length) actions.push('Programar o registrar seguimiento de campo cuando corresponda.');
  if (!data.estimates.length) actions.push('Registrar estimaciones y pagos cuando el avance contractual lo requiera.');
  if (openDeficiencies.length) actions.push(`Dar seguimiento a ${openDeficiencies.length} deficiencia(s) que no figuran como cerradas.`);
  if (gap >= 10) actions.push(`Revisar la diferencia de ${gap.toFixed(2)} puntos entre avance físico y financiero.`);
  if (!actions.length) actions.push('No se detectaron pendientes automáticos con los datos actualmente registrados.');

  return section('Ruta de avance y control', `
    <div class="report-process-flow">
      ${stages.map(([label, complete, detail], index) => `
        <div class="report-process-step ${complete ? 'complete' : 'pending'}">
          <div class="report-process-number">${index + 1}</div>
          <div><b>${esc(label)}</b><small>${esc(detail)}</small></div>
        </div>`).join('')}
    </div>
    <div class="report-action-box">
      <div class="report-action-title">Próximas acciones sugeridas por el expediente</div>
      <ol>${actions.map((action) => `<li>${esc(action)}</li>`).join('')}</ol>
    </div>
  `, 'Guía dinámica basada en la información registrada; no sustituye la revisión técnica o contractual.');
};

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
  const compact = options.compactLayout;
  const pageMargin = compact ? '9mm 10mm' : '14mm 13mm';
  const sectionGap = compact ? '8px 0 10px' : '12px 0 16px';
  const cellPadding = compact ? '4px 5px' : '6px 7px';
  return `
@page{size:${size} ${options.orientation};margin:${pageMargin}}
${prefix}*{box-sizing:border-box}${prefix}body{margin:0;background:#fff;color:#1d2b36;font-family:Arial,Helvetica,sans-serif;font-size:${compact ? '9pt' : '10pt'};line-height:${compact ? '1.32' : '1.42'};-webkit-print-color-adjust:exact;print-color-adjust:exact}${prefix}.report-shell{background:#fff;color:#1d2b36;max-width:100%;padding:0}${prefix}.report-cover{display:flex;flex-direction:column;justify-content:center;text-align:center;border:1px solid #d6dee5;padding:${compact ? '8mm 10mm' : '14mm 14mm'};margin-bottom:10px;break-inside:avoid}${prefix}.report-cover .crest{width:${compact ? '18mm' : '24mm'};height:${compact ? '18mm' : '24mm'};border:2px solid #3d6380;border-radius:50%;display:grid;place-items:center;margin:0 auto ${compact ? '4mm' : '7mm'};color:#3d6380;font-weight:800;font-size:8pt}${prefix}.report-cover h1{font-size:${compact ? '16pt' : '20pt'};color:#244766;margin:${compact ? '2mm 0' : '4mm 0 3mm'}}${prefix}.report-cover h2{font-size:${compact ? '11pt' : '14pt'};color:#263c4c;margin:0 0 ${compact ? '3mm' : '6mm'}}${prefix}.report-cover p{margin:1mm 0;color:#5d7180}${prefix}.report-cover .cover-meta{margin-top:${compact ? '5mm' : '10mm'};padding-top:4mm;border-top:1px solid #cad6df;font-size:8pt}${prefix}.report-sheet{width:100%}${prefix}.report-header{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;border-bottom:3px solid #315f8c;padding-bottom:8px;margin-bottom:10px}${prefix}.report-kicker{font-size:8pt;font-weight:800;letter-spacing:.08em;color:#60778c}${prefix}.report-unit{font-size:8pt;color:#60778c;margin-top:2px}${prefix}.report-header h1{font-size:17pt;color:#244766;margin:5px 0 2px}${prefix}.report-header p{margin:0;font-size:11pt;font-weight:700;color:#263c4c}${prefix}.report-code{border:1px solid #b9c9d8;padding:8px 10px;min-width:145px;text-align:right}${prefix}.report-code b{display:block;font-size:10pt}${prefix}.report-code span{font-size:8pt;color:#607489}${prefix}.report-section{margin:${sectionGap};break-inside:auto;page-break-inside:auto}${prefix}.report-section-title{border-left:4px solid #315f8c;padding-left:8px;margin:0 0 6px;break-after:avoid}${prefix}.report-section-title h2{font-size:11pt;color:#244766;margin:0;text-transform:uppercase;letter-spacing:.025em}${prefix}.report-section-subtitle{font-size:8.5pt;color:#6a7e8e;margin-top:2px}${prefix}.report-table-wrap{width:100%;overflow:visible}${prefix}.report-table{width:100%;border-collapse:collapse;margin:0 0 4px;table-layout:auto}${prefix}.report-table th,.report-table td{border:1px solid #aabccd;padding:${cellPadding};vertical-align:top;overflow-wrap:anywhere}${prefix}.report-table th{background:#e9f0f6;color:#294760;font-size:8pt;text-align:left;text-transform:uppercase;letter-spacing:.02em}${prefix}.report-table td{font-size:${compact ? '8.2pt' : '9pt'};background:#fff}${prefix}.report-table tbody tr:nth-child(even) td{background:#fafcfd}${prefix}.report-table .label-cell{width:29%;background:#eef4f8;text-transform:none;font-size:8.5pt}${prefix}.report-table .cell-number{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}${prefix}.report-table .cell-center{text-align:center}${prefix}.report-table .strong{font-weight:800}${prefix}.report-table .empty-cell{text-align:center;color:#697b89;padding:11px}${prefix}.report-note{border:1px solid #cbd8e1;background:#f7fafc;border-radius:6px;padding:10px;color:#4d6272}${prefix}.report-note.warning{border-color:#decf9e;background:#fffbea;color:#735b17}${prefix}.report-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:0 0 9px}${prefix}.report-metric{border:1px solid #c8d4de;border-top:3px solid #315f8c;background:#fbfcfd;padding:${compact ? '6px' : '8px'};min-height:${compact ? '52px' : '67px'};break-inside:avoid}${prefix}.report-metric-label{font-size:7.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.035em;color:#667b8c}${prefix}.report-metric-value{font-size:13pt;line-height:1.15;font-weight:800;color:#244766;margin-top:4px}${prefix}.report-metric-note{font-size:7.3pt;color:#788a98;margin-top:3px}${prefix}.report-progress-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;border:1px solid #d5dee6;background:#f8fafc;padding:8px;margin-bottom:9px;break-inside:avoid}${prefix}.report-progress-head{display:flex;justify-content:space-between;gap:8px;font-size:8pt;color:#425a6d;margin-bottom:4px}${prefix}.report-progress-head b{color:#263f54}${prefix}.report-progress-track{height:7px;background:#e4eaf0;border-radius:99px;overflow:hidden}${prefix}.report-progress-fill{display:block;height:100%;background:#315f8c;border-radius:99px}${prefix}.report-progress-fill.gold{background:#c5a367}${prefix}.report-control-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:0 0 9px}${prefix}.report-control-item{display:flex;align-items:flex-start;gap:6px;border:1px solid #d7e0e7;background:#fff;padding:7px;break-inside:avoid}${prefix}.report-control-item b{display:block;font-size:8pt;color:#31495b}${prefix}.report-control-item small{display:block;font-size:7.3pt;color:#718391;margin-top:1px}${prefix}.report-control-dot{width:7px;height:7px;border-radius:50%;margin-top:3px;flex:0 0 auto;background:#b7791f}${prefix}.report-control-dot.ok{background:#2f855a}${prefix}.report-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}${prefix}.report-mini-chart{border:1px solid #d3dde5;background:#fbfcfd;padding:7px;break-inside:avoid}${prefix}.report-chart-title{font-size:8pt;font-weight:800;color:#31495b;margin-bottom:7px;text-transform:uppercase;letter-spacing:.025em}${prefix}.report-bar-row{display:grid;grid-template-columns:58px 1fr 46px;gap:6px;align-items:center;margin:5px 0;font-size:8pt}${prefix}.report-bar-row b{text-align:right;color:#244766}${prefix}.report-bar-track{height:8px;background:#e5ebf0;border-radius:99px;overflow:hidden}${prefix}.report-bar-track i{display:block;height:100%;background:#315f8c;border-radius:99px}${prefix}.report-bar-track.gold i{background:#c5a367}${prefix}.report-chart-caption{font-size:7.4pt;color:#6e8190;margin-top:6px}${prefix}.report-column-chart{display:flex;align-items:end;gap:5px;min-height:74px;padding-top:14px}${prefix}.report-column-item{flex:1;min-width:0;text-align:center}${prefix}.report-column-value{font-size:6.7pt;color:#52697b;white-space:nowrap}${prefix}.report-column-track{height:45px;display:flex;align-items:end;justify-content:center;border-bottom:1px solid #c9d4dd}${prefix}.report-column-track span{display:block;width:70%;min-height:3px;background:#315f8c;border-radius:2px 2px 0 0}${prefix}.report-column-label{font-size:6.2pt;color:#738593;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}${prefix}.report-process-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}${prefix}.report-process-step{display:flex;gap:6px;align-items:flex-start;border:1px solid #d5dee5;padding:6px;background:#fff;break-inside:avoid}${prefix}.report-process-step.complete{border-left:3px solid #2f855a}${prefix}.report-process-step.pending{border-left:3px solid #b7791f}${prefix}.report-process-number{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#e8eef3;color:#294760;font-size:7pt;font-weight:800;flex:0 0 auto}${prefix}.report-process-step b{display:block;font-size:7.8pt;color:#31495b}${prefix}.report-process-step small{display:block;font-size:7pt;color:#718391;margin-top:1px}${prefix}.report-action-box{margin-top:7px;border:1px solid #cbd8e1;background:#f7fafc;padding:7px}${prefix}.report-action-title{font-size:8pt;font-weight:800;color:#31495b;margin-bottom:3px}${prefix}.report-action-box ol{margin:0;padding-left:17px}${prefix}.report-action-box li{font-size:7.8pt;color:#526879;margin:2px 0}${prefix}.photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${compact ? '6px' : '8px'}}${prefix}.photo-grid figure{margin:0;border:1px solid #bdcbd5;padding:${compact ? '4px' : '5px'};break-inside:avoid}${prefix}.photo-grid img{display:block;width:100%;height:${compact ? '34mm' : '43mm'};object-fit:cover;background:#f5f7f9}${prefix}.photo-grid figcaption{font-size:7.5pt;color:#637889;margin-top:4px}${prefix}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:18mm;margin-top:18mm;break-inside:avoid;page-break-inside:avoid}${prefix}.signatures div{text-align:center;font-size:8pt;color:#334b5e}${prefix}.signatures span{display:block;border-top:1px solid #445b6c;margin-bottom:4px}${prefix}.report-footer{display:flex;justify-content:space-between;border-top:1px solid #cad6df;margin-top:13mm;padding-top:5px;font-size:7.5pt;color:#687b8d;break-inside:avoid}${prefix}.report-disclaimer{font-size:8pt;color:#6b7b87;margin:10px 0 0;padding:8px;background:#f6f8fa;border-left:3px solid #9eafbc}${prefix}@media print{${prefix}.report-cover{border:0}${prefix}.report-section{break-inside:auto}${prefix}.report-table tr{break-inside:avoid;page-break-inside:avoid}${prefix}.report-table thead{display:table-header-group}${prefix}.report-note,${prefix}.signatures{break-inside:avoid;page-break-inside:avoid}}`;
};

export function buildProjectReportBody(data: ProjectReportData, type: ProjectReportType, options: ProjectReportOptions): string {
  const selectedEstimate = options.estimateId ? data.estimates.find((item) => item.id === options.estimateId) : undefined;
  const selectedVisit = options.visitId ? data.visits.find((item) => item.id === options.visitId) : undefined;
  const sections: string[] = [];

  sections.push(executiveSummary(data));
  if (options.includeCharts) sections.push(progressChartsSection(data));
  if (options.includeProcessGuide) sections.push(processGuideSection(data));

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
