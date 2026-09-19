import type { DocumentType } from '../types.ts';

export interface DocumentClassificationInput {
  evidenceType?: unknown;
  fileName?: unknown;
  mimeType?: unknown;
  title?: unknown;
  documentType?: unknown;
  document_type?: unknown;
  type?: unknown;
  category?: unknown;
  extractedText?: unknown;
}

export interface DocumentClassification {
  type: DocumentType;
  label: string;
}

const asText = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const normalize = (value: unknown) => asText(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const labels: Record<DocumentType, string> = {
  CONTRATO: 'Contrato',
  ESTIMACION: 'Estimación',
  ORDEN_PAGO: 'Orden de pago',
  POLIZA: 'Póliza / garantía',
  BITACORA: 'Bitácora',
  FOTOGRAFIA: 'Fotografía',
  PLANO: 'Plano',
  INFORME: 'Informe',
  ACTA: 'Acta',
  AUDIO: 'Audio',
  CONVENIO: 'Convenio',
  ADENDA: 'Adenda contractual',
  OTRO: 'Evidencia',
};

const typeFromExplicitValue = (value: string): DocumentType | null => {
  if (/contrat|contract/.test(value)) return 'CONTRATO';
  if (/estimaci|estimate/.test(value)) return 'ESTIMACION';
  if (/orden.{0,8}pago|payment.?order/.test(value)) return 'ORDEN_PAGO';
  if (/garant|poliza|fianza|guarantee/.test(value)) return 'POLIZA';
  if (/plano|plan|dwg|dxf/.test(value)) return 'PLANO';
  if (/informe|reporte|report/.test(value)) return 'INFORME';
  if (/acta|act/.test(value)) return 'ACTA';
  if (/bitacora|log/.test(value)) return 'BITACORA';
  if (/convenio|agreement/.test(value)) return 'CONVENIO';
  if (/adenda|addendum|modificatorio/.test(value)) return 'ADENDA';
  if (/foto|fotograf|image|photo/.test(value)) return 'FOTOGRAFIA';
  if (/audio|voice|nota de voz/.test(value)) return 'AUDIO';
  return null;
};

/**
 * Classifies evidence without treating a casual mention of "convenio" inside
 * a contract clause as proof that the document is a convenio.
 *
 * Strong file/media signals take precedence over stale metadata because old
 * uploads may have been saved with the wrong category.
 */
export const classifyDocumentType = (input: DocumentClassificationInput): DocumentClassification => {
  const fileName = normalize(input.fileName);
  const title = normalize(input.title);
  const mime = normalize(input.mimeType);
  const evidenceType = normalize(input.evidenceType);
  const explicitType = normalize(input.documentType || input.document_type);
  const otherMetadata = normalize([input.type, input.category].map(asText).join(' '));
  const textStart = normalize(input.extractedText).slice(0, 2400);
  const fileTitle = `${fileName} ${title}`.trim();

  const isImage = mime.startsWith('image/') || /\.(?:jpe?g|png|gif|webp|bmp|tiff?|heic|avif)$/i.test(fileName) || /photo|foto|image/.test(evidenceType);
  if (isImage) return { type: 'FOTOGRAFIA', label: labels.FOTOGRAFIA };

  const isAudio = mime.startsWith('audio/') || /\.(?:mp3|wav|m4a|ogg|webm|aac)$/i.test(fileName) || /audio|voice/.test(evidenceType);
  if (isAudio) return { type: 'AUDIO', label: labels.AUDIO };

  const explicit = typeFromExplicitValue(`${explicitType} ${evidenceType} ${otherMetadata}`);
  const explicitNonContract = explicit && !['CONTRATO', 'CONVENIO', 'ADENDA'].includes(explicit) ? explicit : null;
  if (explicitNonContract) return { type: explicitNonContract, label: labels[explicitNonContract] };

  // A contract title or heading has priority over stale metadata and over
  // incidental references such as "para efectos de este Convenio".
  const contractSignal =
    /\bcontrato\b/.test(fileTitle) ||
    /\bcontrat(?:o|ual|acion|acion)\b/.test(fileTitle) ||
    /^\s*contrato\b/.test(textStart) ||
    /\bcontrato\s+(?:para|de|entre)\b/.test(textStart.slice(0, 900));
  if (contractSignal || explicit === 'CONTRATO') return { type: 'CONTRATO', label: labels.CONTRATO };

  const amendmentSignal =
    /\b(?:adenda|addendum|modificatorio|modificacion contractual)\b/.test(fileTitle) ||
    /^\s*(?:adenda|addendum|modificatorio)\b/.test(textStart);
  if (amendmentSignal || explicit === 'ADENDA') return { type: 'ADENDA', label: labels.ADENDA };

  // A convenio must be identified by its own title/category or by the heading
  // of the document, not by a word appearing in a different document type.
  const agreementSignal =
    /\bconvenio\b/.test(fileTitle) ||
    /^\s*(?:el\s+)?convenio\b/.test(textStart) ||
    /\bconvenio\s+(?:interinstitucional|de cooperacion|de colaboracion)\b/.test(textStart.slice(0, 1200));
  if (agreementSignal || explicit === 'CONVENIO') return { type: 'CONVENIO', label: labels.CONVENIO };

  const inferred = typeFromExplicitValue(`${fileTitle} ${textStart}`);
  if (inferred && inferred !== 'CONVENIO') return { type: inferred, label: labels[inferred] };
  return { type: 'OTRO', label: labels.OTRO };
};

