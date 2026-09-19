import type { Guarantee, Project } from '../types.ts';

export type GuaranteeAttentionKind =
  | 'AMPLIACION'
  | 'REGULARIZAR'
  | 'LIBERACION_ANTICIPO'
  | 'LIBERACION_CUMPLIMIENTO'
  | 'CIERRE_ANUAL'
  | 'INFORMATIVA';

export interface GuaranteeAttention {
  kind: GuaranteeAttentionKind;
  label: string;
  detail: string;
  context: string;
  isClosureCandidate: boolean;
}

const normalize = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const isFinishedProject = (project?: Project) => {
  if (!project) return false;
  return project.status === 'FINALIZADO' || /finaliz|liquid|cerrad|terminad|concluid/.test(normalize(project.statusLabel));
};

const yearFromDate = (value?: string) => {
  const year = Number(String(value || '').slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
};

/** Determines the next review without assuming every expired policy needs an extension. */
export function getGuaranteeAttention(guarantee: Guarantee, project?: Project, referenceDate = new Date()): GuaranteeAttention {
  const currentYear = referenceDate.getFullYear();
  const projectFinished = isFinishedProject(project);
  const guaranteeYear = yearFromDate(guarantee.expiryDate);
  const projectEndYear = yearFromDate(project?.expectedEndDate);
  const annualClose = !projectFinished && ((guaranteeYear !== null && guaranteeYear < currentYear) || (projectEndYear !== null && projectEndYear < currentYear));

  if (guarantee.status === 'LIBERADA') {
    return { kind: 'INFORMATIVA', label: 'Ver liberación', detail: 'La garantía ya está liberada; consulta el soporte de cierre en el expediente.', context: 'Garantía liberada', isClosureCandidate: false };
  }
  if (guarantee.status === 'EJECUTADA') {
    return { kind: 'INFORMATIVA', label: 'Ver ejecución', detail: 'La garantía ya figura ejecutada; consulta el acta y la documentación asociada.', context: 'Garantía ejecutada', isClosureCandidate: false };
  }
  if (projectFinished && guarantee.type === 'ANTICIPO') {
    return { kind: 'LIBERACION_ANTICIPO', label: 'Revisar amortización y liberación', detail: 'El proyecto figura finalizado. Verifica el saldo amortizado y la liberación de la garantía de anticipo.', context: 'Proyecto finalizado', isClosureCandidate: true };
  }
  if (projectFinished && guarantee.type === 'CUMPLIMIENTO') {
    return { kind: 'LIBERACION_CUMPLIMIENTO', label: 'Revisar liberación', detail: 'El proyecto figura finalizado. Revisa recepción, liquidación y la liberación o ejecución según el expediente.', context: 'Proyecto finalizado', isClosureCandidate: true };
  }
  if (projectFinished) {
    return { kind: 'LIBERACION_CUMPLIMIENTO', label: 'Revisar cierre de garantía', detail: 'El proyecto figura finalizado. Confirma si corresponde liberar, ejecutar o archivar esta garantía.', context: 'Proyecto finalizado', isClosureCandidate: true };
  }
  if (annualClose) {
    return { kind: 'CIERRE_ANUAL', label: 'Revisar cierre anual', detail: 'La vigencia corresponde a un año ya cerrado. Verifica el estado del proyecto y actualiza el expediente antes de ampliar.', context: 'Año cerrado', isClosureCandidate: true };
  }
  if (guarantee.status === 'VENCIDA') {
    return { kind: 'REGULARIZAR', label: 'Regularizar vigencia', detail: 'El proyecto no figura finalizado. Revisa si corresponde ampliar, sustituir o ejecutar la garantía.', context: 'Proyecto activo', isClosureCandidate: false };
  }
  if (guarantee.status === 'POR_VENCER') {
    return { kind: 'AMPLIACION', label: 'Gestionar ampliación', detail: 'La garantía está próxima a vencer y el proyecto no figura finalizado. Verifica el avance y tramita la ampliación si corresponde.', context: 'Proyecto activo', isClosureCandidate: false };
  }
  return { kind: 'INFORMATIVA', label: 'Revisar garantía', detail: 'La garantía está vigente; verifica que su fecha cubra el plazo contractual y el estado actual del proyecto.', context: 'Garantía vigente', isClosureCandidate: false };
}
