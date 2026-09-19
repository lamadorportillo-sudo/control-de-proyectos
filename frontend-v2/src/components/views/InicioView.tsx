import React from 'react';
import {
  Search,
  FolderGit2,
  FolderPlus,
  FilePlus2,
  Receipt,
  CreditCard,
  UploadCloud,
  AlertOctagon,
  Smartphone,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { AppModule, Project, Deficiency, Guarantee, Estimate } from '../../types.ts';
import { formatLempiras, formatDateSpanish } from '../../services/calculationService.ts';
import { getGuaranteeAttention } from '../../services/guaranteeLifecycleService.ts';

interface InicioViewProps {
  onNavigate: (module: AppModule, extraData?: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  projects: Project[];
  deficiencies: Deficiency[];
  guarantees: Guarantee[];
  estimates: Estimate[];
  recentActivity: any[];
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  projects,
  deficiencies,
  guarantees,
  estimates,
  recentActivity,
}) => {
  const blockingDefs = deficiencies.filter(
    (d) => d.severity === 'BLOQUEANTE' && d.status !== 'CERRADA'
  );
  const expiredGuarantees = guarantees.filter(
    (g) => g.status === 'VENCIDA' || g.status === 'POR_VENCER'
  );
  const pendingEstimates = estimates.filter(
    (e) => e.paymentStatus === 'ORDEN_PAGO' || e.paymentStatus === 'APROBADA'
  );
  const totalBudget = projects.reduce(
    (total, project) => total + (project.revisedBudget || project.assignedBudget || 0),
    0
  );
  const attentionCount = blockingDefs.length + expiredGuarantees.length + pendingEstimates.length;

  const quickActions = [
    {
      id: 'qa-new-project',
      label: 'Nuevo proyecto',
      desc: 'Crear o revisar un expediente',
      icon: FolderPlus,
      action: () => onNavigate('proyectos', { action: 'NEW_PROJECT' }),
    },
    {
      id: 'qa-register-visit',
      label: 'Registrar visita',
      desc: 'Guardar observaciones y evidencias',
      icon: Smartphone,
      action: () => onNavigate('registrar_visita'),
    },
    {
      id: 'qa-new-estimate',
      label: 'Nueva estimación',
      desc: 'Registrar actividades y deducciones',
      icon: Receipt,
      action: () => onNavigate('estimaciones', { action: 'NEW_ESTIMATE' }),
    },
  ];

  return (
    <div id="inicio-view-container" className="max-w-5xl mx-auto space-y-7 pb-12">
      <div className="pt-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          ¿Qué necesitas revisar?
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
          Busca un proyecto, contrato o ubicación para abrir el expediente correcto.
        </p>
      </div>

      <div className="bg-[#151e29] border border-[#2b3a4a] rounded-xl p-3 md:p-4 shadow-xl">
        <label htmlFor="inicio-search-input" className="block text-xs font-medium text-slate-300 mb-2">
          Búsqueda directa de expediente
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="inicio-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar proyecto, contrato, contratista o código (ej. tanque, El Centro, COT121706-2026)..."
              className="w-full bg-[#0b1220] text-white text-sm rounded-lg pl-11 pr-4 py-2.5 border border-[#243247] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            id="btn-inicio-search"
            className="px-4 py-2.5 bg-[#c5a367] hover:bg-[#d4b779] text-[#0b1118] font-medium text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Buscar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Resumen operativo">
        <button
          type="button"
          onClick={() => onNavigate('proyectos')}
          className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-3 text-left transition hover:border-[#c5a367] hover:bg-[#1b2735]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Expedientes</span>
            <FolderGit2 className="h-4 w-4 text-[#c5a367]" />
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums text-white">{projects.length}</div>
          <div className="text-[11px] text-slate-400">proyectos disponibles</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('presupuestos')}
          className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-3 text-left transition hover:border-[#c5a367] hover:bg-[#1b2735]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Presupuesto</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-1 truncate text-base font-bold tabular-nums text-white">{formatLempiras(totalBudget)}</div>
          <div className="text-[11px] text-slate-400">vigente registrado</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('deficiencias')}
          className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-3 text-left transition hover:border-red-700/80 hover:bg-[#1b2735]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Bloqueantes</span>
            <AlertOctagon className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums text-white">{blockingDefs.length}</div>
          <div className="text-[11px] text-slate-400">requieren seguimiento</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate(expiredGuarantees.length > 0 ? 'garantias' : 'estimaciones')}
          className="rounded-xl border border-[#2b3a4a] bg-[#151e29] p-3 text-left transition hover:border-amber-700/80 hover:bg-[#1b2735]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Por atender</span>
            <ShieldCheck className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums text-white">{attentionCount}</div>
          <div className="text-[11px] text-slate-400">garantías y pagos</div>
        </button>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Acciones Operativas
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                id={qa.id}
                onClick={qa.action}
                className={`p-3.5 rounded-lg bg-[#151e29] border border-[#2b3a4a] text-left transition-all flex flex-col justify-between group text-[#b4c0ce] hover:border-[#c5a367] hover:bg-[#1b2735]`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded bg-[#0b1220] border border-[#1f2e45] text-slate-300 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-200 transition-colors">
                    {qa.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {qa.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(blockingDefs.length > 0 || expiredGuarantees.length > 0 || pendingEstimates.length > 0) && (
        <div id="section-pendientes-atencion" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pendientes Reales de Atención</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {blockingDefs.length + expiredGuarantees.length + pendingEstimates.length} ítems
            </span>
          </div>

          <div className="space-y-2">
            {blockingDefs.map((def) => {
              const prj = projects.find((p) => p.id === def.projectId);
              return (
                <div
                  key={def.id}
                  className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 text-[10px] font-bold uppercase">
                          Riesgo Bloqueante
                        </span>
                        <span className="text-xs font-semibold text-white">{def.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {prj?.shortName || prj?.code} • {def.specificLocation}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('deficiencias', { deficiencyId: def.id })}
                    className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-medium rounded border border-red-700/80 shrink-0 self-end sm:self-center transition-colors"
                  >
                    Resolver deficiencia
                  </button>
                </div>
              );
            })}

            {expiredGuarantees.map((gar) => {
              const prj = projects.find((p) => p.id === gar.projectId);
              const attention = getGuaranteeAttention(gar, prj);
              const isExpired = gar.status === 'VENCIDA';
              return (
                <div
                  key={gar.id}
                  className={`p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
                    isExpired
                      ? 'bg-amber-950/30 border-amber-800/60'
                      : 'bg-[#111827] border-amber-900/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${isExpired ? 'text-amber-400' : 'text-amber-300'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${isExpired ? 'bg-amber-900/60 text-amber-200' : 'bg-slate-800 text-slate-300'}`}>
                          {gar.statusLabel}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {gar.typeLabel} ({gar.policyNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {prj?.shortName} • Vencimiento: {formatDateSpanish(gar.expiryDate)} • {formatLempiras(gar.amount)}
                      </div>
                      <div className="mt-1 text-[11px] text-amber-200/90">
                        {attention.context}: {attention.detail}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('garantias', { guaranteeId: gar.id })}
                    title={attention.detail}
                    className="px-3 py-1 bg-[#172235] hover:bg-amber-950/60 text-amber-200 text-xs font-medium rounded border border-[#243247] hover:border-amber-700/80 shrink-0 self-end sm:self-center transition-colors"
                  >
                    {attention.label}
                  </button>
                </div>
              );
            })}

            {pendingEstimates.map((est) => {
              const prj = projects.find((p) => p.id === est.projectId);
              return (
                <div
                  key={est.id}
                  className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <Receipt className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 text-[10px] font-semibold uppercase">
                          {est.paymentStatusLabel}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          Estimación N° {est.estimateNumber} - {prj?.shortName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Neto a pagar: <strong className="text-white tabular-nums">{formatLempiras(est.netPayable)}</strong> (Bruto: {formatLempiras(est.grossAmount)})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('estimaciones', { estimateId: est.id })}
                    className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-medium rounded border border-emerald-700/80 shrink-0 self-end sm:self-center transition-colors"
                  >
                    Ver orden y liquidar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div id="section-actividad-reciente" className="bg-[#111827] border border-[#172235] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Actividad Reciente del Expediente</span>
          </div>
          <button
            onClick={() => onNavigate('auditoria')}
            className="text-xs text-[#c5a367] hover:text-[#d4b779] transition-colors"
          >
            Ver historial completo
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#2b3a4a] px-3 py-5 text-center text-xs text-slate-500">
            No hay movimientos recientes para mostrar.
          </div>
        ) : (
          <div className="divide-y divide-[#172235]">
            {recentActivity.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-medium">{log.details}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{log.user} ({log.role})</span><span>•</span><span>{log.timestamp}</span>
                  </div>
                </div>
                {log.entityCode && (
                  <span className="px-2 py-0.5 rounded bg-[#172235] text-slate-300 text-[10px] font-mono shrink-0">{log.entityCode}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
