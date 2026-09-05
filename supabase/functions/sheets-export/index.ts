import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value: unknown, max = 1000) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function money(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Math.round((number + Number.EPSILON) * 100) / 100 : 0;
}

function numeric(value: unknown) {
  const number = Number(value);
  return value !== "" && value !== null && value !== undefined && Number.isFinite(number) ? number : "";
}

function objectValue(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? value as Record<string, any> : {};
}

function safeEqual(left: unknown, right: unknown) {
  const a = new TextEncoder().encode(String(left ?? ""));
  const b = new TextEncoder().encode(String(right ?? ""));
  if (!a.length || !b.length) return false;
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (a[i % a.length] ?? 0) ^ (b[i % b.length] ?? 0);
  }
  return diff === 0;
}

function serviceKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return parsed.default || Object.values(parsed)[0] || "";
  } catch {
    return "";
  }
}

function optional(row: Record<string, any>, key: string, value: unknown) {
  const text = clean(value);
  if (text) row[key] = text;
}

function optionalNumber(row: Record<string, any>, key: string, value: unknown) {
  const number = numeric(value);
  if (number !== "") row[key] = number;
}

function paymentReference(raw: Record<string, any>, direct?: unknown) {
  const value = clean(direct ?? raw?.receipt ?? raw?.paymentReceipt ?? raw?.cheque ?? raw?.check);
  return value.replace(/^CHEQUE\s*/i, "").trim();
}

function rowDate(row: Record<string, any>) {
  const value = clean(row["FECHA"]);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "9999-12-31";
}

function addDays(dateText: unknown, daysValue: unknown) {
  const date = clean(dateText);
  const days = Number(daysValue);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(days)) return "";
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function addMonths(dateText: unknown, monthsValue: unknown) {
  const date = clean(dateText);
  const months = Number(monthsValue);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(months)) return "";
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCMonth(value.getUTCMonth() + months);
  return value.toISOString().slice(0, 10);
}

function sourceDocument(notes: unknown, ...rawValues: unknown[]) {
  for (const value of rawValues) {
    const raw = objectValue(value);
    const explicit = clean(raw.sourceDocument ?? raw.source_document ?? raw.documentSource);
    if (explicit) return explicit;
  }
  const match = clean(notes, 4000).match(/FUENTE(?:\s+CRUZADA)?:\s*([^.;]+?\.(?:pdf|docx?|xlsx?))/i);
  return match ? clean(match[1], 300) : "";
}

function contractMetadata(contract: Record<string, any>, project: Record<string, any>) {
  const raw = objectValue(contract.raw_data);
  const controls = objectValue(raw.controls);
  const start = clean(contract.start_date || raw.start);
  const end = clean(contract.end_date || raw.end);
  const advanceDate = clean(contract.advance_payment_date || raw.advancePaymentDate);
  const clauseStart = addDays(advanceDate, controls.orderStartAfterAdvanceDays);
  let dateValidation = "";
  if (clauseStart && start) {
    dateValidation = clauseStart === start
      ? "COINCIDE CON EL CÁLCULO SEGÚN CLÁUSULA"
      : `REVISAR: inicio registrado ${start}; inicio calculado según cláusula ${clauseStart}`;
  } else if (controls.orderStartAfterAdvanceDays && !advanceDate) {
    dateValidation = "PENDIENTE: falta fecha comprobada de entrega/recepción del anticipo";
  }

  const originalAmount = money(contract.original_amount || raw.originalAmount || project.budget_estimate);
  const performancePct = numeric(controls.performanceGuaranteePct);
  const qualityPct = numeric(controls.qualityGuaranteePct);
  const advanceGuaranteePct = numeric(controls.advanceGuaranteePct);
  const penaltyApplied = money(controls.penaltyDailyApplied);
  const penaltyCalculated = originalAmount && numeric(controls.penaltyDailyPct) !== ""
    ? money(originalAmount * Number(controls.penaltyDailyPct) / 100)
    : 0;

  return {
    contractNumber: clean(contract.number || raw.number),
    originalAmount,
    signatureDate: clean(contract.signature_date || raw.signature),
    start,
    end,
    executionDays: numeric(contract.execution_days || raw.executionDays || project.execution_days),
    contractStatus: clean(contract.status || raw.status),
    advancePct: numeric(contract.advance_requested_pct || raw.advanceRequestedPct),
    advanceDate,
    recoveryTarget: numeric(contract.recovery_target_pct || raw.recoveryTarget),
    clauseStart,
    dateValidation,
    penaltyDaily: penaltyApplied || penaltyCalculated,
    performancePct,
    performanceAmount: performancePct === "" ? 0 : money(originalAmount * Number(performancePct) / 100),
    performanceEnd: addMonths(end, controls.performanceExtraMonths),
    qualityPct,
    qualityAmount: qualityPct === "" ? 0 : money(originalAmount * Number(qualityPct) / 100),
    qualityDays: numeric(controls.qualityGuaranteeDays),
    advanceGuaranteePct,
    advanceGuaranteeAmount: advanceGuaranteePct === "" ? 0 : money(money(contract.advance_approved || raw.advanceApproved || contract.advance_paid) * Number(advanceGuaranteePct) / 100),
    location: clean(project.location),
    projectStatus: clean(project.status),
    projectType: clean(project.project_type),
    financing: clean(controls.financingSource),
    source: sourceDocument(contract.notes, raw),
  };
}

function applyContractColumns(row: Record<string, any>, meta: Record<string, any>) {
  optional(row, "N.º CONTRATO", meta.contractNumber);
  if (meta.originalAmount) row["MONTO CONTRATADO"] = meta.originalAmount;
  optional(row, "FECHA FIRMA", meta.signatureDate);
  optional(row, "FECHA INICIO REGISTRADA", meta.start);
  optional(row, "FECHA FIN REGISTRADA", meta.end);
  optionalNumber(row, "DÍAS DE EJECUCIÓN", meta.executionDays);
  optional(row, "ESTADO DEL CONTRATO", meta.contractStatus);
  optionalNumber(row, "% ANTICIPO", meta.advancePct);
  optional(row, "FECHA PAGO ANTICIPO", meta.advanceDate);
  optionalNumber(row, "% META AMORTIZACIÓN", meta.recoveryTarget);
  optional(row, "INICIO CALCULADO SEGÚN CLÁUSULA", meta.clauseStart);
  optional(row, "VALIDACIÓN DE FECHA", meta.dateValidation);
  if (meta.penaltyDaily) row["MULTA DIARIA"] = meta.penaltyDaily;
  optionalNumber(row, "% GARANTÍA CUMPLIMIENTO", meta.performancePct);
  if (meta.performanceAmount) row["MONTO GARANTÍA CUMPLIMIENTO"] = meta.performanceAmount;
  optional(row, "VENCIMIENTO GARANTÍA CUMPLIMIENTO", meta.performanceEnd);
  optionalNumber(row, "% GARANTÍA CALIDAD", meta.qualityPct);
  if (meta.qualityAmount) row["MONTO GARANTÍA CALIDAD"] = meta.qualityAmount;
  optionalNumber(row, "PLAZO GARANTÍA CALIDAD (DÍAS)", meta.qualityDays);
  optionalNumber(row, "% GARANTÍA ANTICIPO", meta.advanceGuaranteePct);
  if (meta.advanceGuaranteeAmount) row["MONTO GARANTÍA ANTICIPO"] = meta.advanceGuaranteeAmount;
  optional(row, "UBICACIÓN", meta.location);
  optional(row, "ESTADO DEL PROYECTO", meta.projectStatus);
  optional(row, "TIPO DE PROYECTO", meta.projectType);
}

const CONTRACT_COLUMNS = [
  "N.º CONTRATO",
  "MONTO CONTRATADO",
  "FECHA FIRMA",
  "FECHA INICIO REGISTRADA",
  "FECHA FIN REGISTRADA",
  "DÍAS DE EJECUCIÓN",
  "ESTADO DEL CONTRATO",
  "% ANTICIPO",
  "FECHA PAGO ANTICIPO",
  "% META AMORTIZACIÓN",
  "INICIO CALCULADO SEGÚN CLÁUSULA",
  "VALIDACIÓN DE FECHA",
  "MULTA DIARIA",
  "% GARANTÍA CUMPLIMIENTO",
  "MONTO GARANTÍA CUMPLIMIENTO",
  "VENCIMIENTO GARANTÍA CUMPLIMIENTO",
  "% GARANTÍA CALIDAD",
  "MONTO GARANTÍA CALIDAD",
  "PLAZO GARANTÍA CALIDAD (DÍAS)",
  "% GARANTÍA ANTICIPO",
  "MONTO GARANTÍA ANTICIPO",
  "UBICACIÓN",
  "ESTADO DEL PROYECTO",
  "TIPO DE PROYECTO",
];

function clearContractColumns(row: Record<string, any>) {
  CONTRACT_COLUMNS.forEach((header) => {
    row[header] = "";
  });
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "GET") {
      return json({ ok: true, service: "sheets-export", configured: Boolean(Deno.env.get("SHEETS_SYNC_SECRET")) });
    }
    if (req.method !== "POST") return json({ ok: false, error: "Método no permitido" }, 405);

    const expected = Deno.env.get("SHEETS_SYNC_SECRET") || "";
    const received = req.headers.get("x-halu-sync-secret") || "";
    if (!safeEqual(received, expected)) return json({ ok: false, error: "No autorizado" }, 401);

    const body = await req.json().catch(() => ({}));
    if (body.action !== "export_payments") return json({ ok: false, error: "Acción no permitida" }, 400);

    const url = Deno.env.get("SUPABASE_URL") || "";
    const key = serviceKey();
    if (!url || !key) return json({ ok: false, error: "Configuración interna incompleta" }, 503);
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const [estimatesResult, contractsResult, projectsResult] = await Promise.all([
      supabase.from("estimates")
        .select("id,project_id,contract_id,number,period_start,period_end,gross,advance_applied,quality_applied,isr_applied,other_deductions,total_deductions,net,status,payment_date,payment_order,invoice,receipt,manual_reason,notes,payment_notes,raw_data,created_at")
        .is("voided_at", null).order("created_at", { ascending: true }),
      supabase.from("contracts")
        .select("id,project_id,number,contractor,original_amount,signature_date,start_date,end_date,execution_days,status,advance_requested_pct,advance_approved,advance_paid,advance_payment_date,recovery_target_pct,notes,raw_data,created_at")
        .is("voided_at", null),
      supabase.from("projects")
        .select("id,code,name,location,project_type,budget_estimate,status,start_date,end_date,execution_days,raw_data")
        .is("archived_at", null),
    ]);

    const firstError = estimatesResult.error || contractsResult.error || projectsResult.error;
    if (firstError) {
      console.error("sheets-export query", firstError.message);
      return json({ ok: false, error: "No fue posible consultar los pagos" }, 500);
    }

    const projects = new Map((projectsResult.data || []).map((item: any) => [item.id, item]));
    const contracts = new Map((contractsResult.data || []).map((item: any) => [item.id, item]));
    const metadata = new Map<string, Record<string, any>>();
    for (const contract of contractsResult.data || []) {
      metadata.set(contract.id, contractMetadata(contract, projects.get(contract.project_id) || {}));
    }

    const estimates = [...(estimatesResult.data || [])].sort((a: any, b: any) =>
      clean(a.contract_id).localeCompare(clean(b.contract_id)) ||
      clean(a.period_end || a.payment_date || a.created_at).localeCompare(clean(b.period_end || b.payment_date || b.created_at)) ||
      Number(a.number || 0) - Number(b.number || 0)
    );
    const amortized = new Map<string, number>();
    const contractMetadataWritten = new Set<string>();
    const rows: Record<string, any>[] = [];

    for (const estimate of estimates) {
      const project = projects.get(estimate.project_id) || {};
      const contract = contracts.get(estimate.contract_id) || {};
      const meta = metadata.get(estimate.contract_id) || {};
      const raw = objectValue(estimate.raw_data);
      const number = Number(estimate.number) || 0;
      const row: Record<string, any> = {
        "N.": 0,
        "CÓDIGO": clean(project.code, 120),
        "CONTRATISTA": clean(contract.contractor, 300),
        "CONCEPTO": `ESTIMACIÓN N.º ${number}`,
        "PROYECTO": clean(project.name, 500),
        "ESTIMACIÓN": money(estimate.gross),
        "RET. G. ANTICIPO": money(estimate.advance_applied),
        "ISR": money(estimate.isr_applied),
        "RET. G. CALIDAD": money(estimate.quality_applied),
        "PAGO": money(estimate.net),
      };

      optional(row, "FECHA", estimate.payment_date || raw.paymentDate);
      optional(row, "CHEQUE", paymentReference(raw, estimate.receipt));
      optional(row, "ORDEN DE PAGO", estimate.payment_order);
      optional(row, "FACTURA", estimate.invoice);
      const qualityPayment = raw.qualityPayment ?? raw.quality_paid ?? raw.pagoCalidad;
      if (qualityPayment !== undefined && money(qualityPayment) !== 0) row["CALIDAD"] = money(qualityPayment);
      const penalty = raw.penalty ?? raw.multa ?? raw.latePenalty ?? raw.multaIncumplimiento;
      if (penalty !== undefined && money(penalty) !== 0) row["MULTA POR INCUMPLIMIENTO"] = money(penalty);

      optional(row, "INICIO DEL PERÍODO", estimate.period_start || raw.start);
      optional(row, "FIN DEL PERÍODO", estimate.period_end || raw.end);
      optional(row, "ESTADO DE ESTIMACIÓN", estimate.status || raw.status);
      optionalNumber(row, "AVANCE FÍSICO %", raw.physical);
      row["TOTAL DEDUCCIONES"] = money(estimate.total_deductions ?? raw.totalDeductions);
      row["OTRAS DEDUCCIONES"] = money(estimate.other_deductions ?? raw.other);

      const currentAmortized = money((amortized.get(estimate.contract_id) || 0) + money(estimate.advance_applied));
      amortized.set(estimate.contract_id, currentAmortized);
      row["SALDO DE ANTICIPO"] = money(Math.max(0, money(contract.advance_paid) - currentAmortized));

      clearContractColumns(row);
      const hasAdvanceRow = money(contract.advance_paid) > 0;
      if (!hasAdvanceRow && !contractMetadataWritten.has(estimate.contract_id)) {
        applyContractColumns(row, meta);
        contractMetadataWritten.add(estimate.contract_id);
      }
      const observations = [estimate.notes, estimate.payment_notes, estimate.manual_reason]
        .map((value) => clean(value, 1600)).filter(Boolean).join(" | ");
      optional(row, "OBSERVACIONES / REVISIÓN", observations);
      rows.push(row);
    }

    for (const contract of contractsResult.data || []) {
      const advance = money(contract.advance_paid);
      if (advance <= 0) continue;
      const project = projects.get(contract.project_id) || {};
      const raw = objectValue(contract.raw_data);
      const meta = metadata.get(contract.id) || {};
      const row: Record<string, any> = {
        "N.": 0,
        "CÓDIGO": clean(project.code, 120),
        "CONTRATISTA": clean(contract.contractor, 300),
        "CONCEPTO": "ANTICIPO",
        "PROYECTO": clean(project.name, 500),
        "ANTICIPO": advance,
        "PAGO": advance,
        "SALDO DE ANTICIPO": advance,
      };
      optional(row, "FECHA", contract.advance_payment_date || raw.advancePaymentDate);
      optional(row, "CHEQUE", paymentReference(raw));
      clearContractColumns(row);
      applyContractColumns(row, meta);
      optional(row, "OBSERVACIONES / REVISIÓN", meta.dateValidation);
      contractMetadataWritten.add(contract.id);
      rows.push(row);
    }

    rows.sort((a, b) => rowDate(a).localeCompare(rowDate(b)) ||
      clean(a["CÓDIGO"]).localeCompare(clean(b["CÓDIGO"])) ||
      clean(a["CONCEPTO"]).localeCompare(clean(b["CONCEPTO"])));
    rows.forEach((row, index) => { row["N."] = index + 1; });
    return json({ ok: true, rows, count: rows.length, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("sheets-export", error);
    return json({ ok: false, error: "Error interno de sincronización" }, 500);
  }
});